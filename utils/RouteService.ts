import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../supabaseClient";
import { RouteType, RoutePoint, Checkpoint } from "../types";
import { isOnline } from "../utils/netcheck";

const ROUTES_STORAGE_KEY = "offlineRoutes";

const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toISOString();
};

export const saveRoute = async (route: RouteType): Promise<string> => {
  try {
    const online = await isOnline();
    return online
      ? await saveRouteOnline(route)
      : await saveRouteOffline(route);
  } catch (error) {
    console.error("Error saving route:", error);
    throw error;
  }
};

export const saveRouteOnline = async (route: RouteType): Promise<string> => {
  const { data, error } = await supabase
    .from("routes")
    .insert({
      name: route.name,
      created_by: route.createdBy,
    })
    .select()
    .single();

  if (error) throw error;

  const routeId = data.id;

  if (route.points && route.points.length > 0) {
    const { error: pointsError } = await supabase.from("route_points").insert(
      route.points.map((point: RoutePoint) => ({
        route_id: routeId,
        latitude: point.location.latitude,
        longitude: point.location.longitude,
        accuracy: point.location.accuracy,
        altitude: point.location.altitude,
        speed: point.location.speed,
        timestamp: formatTimestamp(point.timestamp),
      }))
    );

    if (pointsError) throw pointsError;
  }

  if (route.checkpoints && route.checkpoints.length > 0) {
    const { error: checkpointsError } = await supabase
      .from("checkpoints")
      .insert(
        route.checkpoints.map((checkpoint: Checkpoint) => ({
          route_id: routeId,
          latitude: checkpoint.location.latitude,
          longitude: checkpoint.location.longitude,
          accuracy: checkpoint.location.accuracy,
          altitude: checkpoint.location.altitude,
          speed: checkpoint.location.speed,
          timestamp: checkpoint.location.timestamp
            ? formatTimestamp(checkpoint.location.timestamp)
            : null,
        }))
      );

    if (checkpointsError) throw checkpointsError;
  }

  await saveRouteToAsyncStorage({ ...route, id: routeId });

  return routeId;
};

export const saveRouteOffline = async (route: RouteType): Promise<string> => {
  await saveRouteToAsyncStorage(route);
  return route.id;
};

const saveRouteToAsyncStorage = async (route: RouteType) => {
  try {
    const existingRoutes = await AsyncStorage.getItem(ROUTES_STORAGE_KEY);
    let routes = existingRoutes ? JSON.parse(existingRoutes) : [];
    routes.push(route);
    await AsyncStorage.setItem(ROUTES_STORAGE_KEY, JSON.stringify(routes));
  } catch (error) {
    console.error("Error saving route to AsyncStorage:", error);
    throw error;
  }
};

export const fetchRoutes = async (): Promise<RouteType[]> => {
  try {
    const online = await isOnline();
    return online ? await fetchRoutesOnline() : await fetchRoutesOffline();
  } catch (error) {
    console.error("Error fetching routes:", error);
    throw error;
  }
};

const fetchRoutesOnline = async (): Promise<RouteType[]> => {
  const { data, error } = await supabase
    .from("routes")
    .select(
      `
      *,
      route_points (id, latitude, longitude, accuracy, altitude, speed, timestamp),
      checkpoints (id, latitude, longitude, accuracy, altitude, speed, timestamp)
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  const routes: RouteType[] = data.map((route: any) => ({
    id: route.id,
    name: route.name,
    createdBy: route.created_by,
    user_id: route.user_id,
    points: route.route_points.map((point: any) => ({
      id: point.id,
      location: {
        latitude: point.latitude,
        longitude: point.longitude,
        accuracy: point.accuracy,
        altitude: point.altitude,
        speed: point.speed,
      },
      timestamp: new Date(point.timestamp).getTime(),
    })),
    checkpoints: route.checkpoints.map((checkpoint: any) => ({
      id: checkpoint.id,
      location: {
        latitude: checkpoint.latitude,
        longitude: checkpoint.longitude,
        accuracy: checkpoint.accuracy,
        altitude: checkpoint.altitude,
        speed: checkpoint.speed,
        timestamp: new Date(checkpoint.timestamp).getTime(),
      },
    })),
    createdAt: route.created_at,
    updatedAt: route.updated_at,
  }));

  await AsyncStorage.setItem(ROUTES_STORAGE_KEY, JSON.stringify(routes));

  return routes;
};

const fetchRoutesOffline = async (): Promise<RouteType[]> => {
  const routes = await AsyncStorage.getItem(ROUTES_STORAGE_KEY);
  return routes ? JSON.parse(routes) : [];
};

export const syncOfflineRoutes = async () => {
  const online = await isOnline();
  if (!online) return;

  const offlineRoutes = await fetchRoutesOffline();
  const onlineRoutes = await fetchRoutesOnline();

  const routesToSync = offlineRoutes.filter(
    (offlineRoute) =>
      !onlineRoutes.some((onlineRoute) => onlineRoute.id === offlineRoute.id)
  );

  for (const route of routesToSync) {
    await saveRouteOnline(route);
  }

  await AsyncStorage.setItem(
    ROUTES_STORAGE_KEY,
    JSON.stringify(await fetchRoutesOnline())
  );
};

export const fetchRouteById = async (
  routeId: string
): Promise<RouteType | null> => {
  try {
    const { data, error } = await supabase
      .from("routes")
      .select(
        `
        *,
        route_points (id, latitude, longitude, accuracy, altitude, speed, timestamp),
        checkpoints (id, latitude, longitude, accuracy, altitude, speed, timestamp)
      `
      )
      .eq("id", routeId)
      .single();

    if (error) throw error;

    if (!data) return null;

    const route: RouteType = {
      user_id: data.user_id,
      id: data.id,
      name: data.name,
      createdBy: data.created_by,
      points: data.route_points.map((point: any) => ({
        id: point.id,
        location: {
          latitude: point.latitude,
          longitude: point.longitude,
          accuracy: point.accuracy,
          altitude: point.altitude,
          speed: point.speed,
        },
        timestamp: new Date(point.timestamp).getTime(),
      })),
      checkpoints: data.checkpoints.map((checkpoint: any) => ({
        id: checkpoint.id,
        location: {
          latitude: checkpoint.latitude,
          longitude: checkpoint.longitude,
          accuracy: checkpoint.accuracy,
          altitude: checkpoint.altitude,
          speed: checkpoint.speed,
          timestamp: new Date(checkpoint.timestamp).getTime(),
        },
      })),
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    await AsyncStorage.setItem(`route_${routeId}`, JSON.stringify(route));

    return route;
  } catch (error) {
    console.error("Error in fetchRouteById:", error);

    try {
      const localRoute = await AsyncStorage.getItem(`route_${routeId}`);
      if (localRoute) {
        console.log("Fetched route from local storage");
        return JSON.parse(localRoute);
      }
    } catch (localError) {
      console.error("Error fetching from local storage:", localError);
    }

    return null;
  }
};
