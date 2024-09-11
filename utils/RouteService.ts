import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../supabaseClient";
import { RouteType } from "../types";
import { isOnline } from "../utils/netcheck";

const ROUTES_STORAGE_KEY = "offlineRoutes";

export const saveRoute = async (route: RouteType): Promise<string> => {
  try {
    const online = await isOnline();

    if (online) {
      return await saveRouteOnline(route);
    } else {
      return await saveRouteOffline(route);
    }
  } catch (error) {
    console.error("Error saving route:", error);
    throw error;
  }
};

export const saveRouteOnline = async (route: RouteType): Promise<string> => {
  const { data, error } = await supabase.from("routes").insert(route).single();

  if (error) throw error;

  // Also save to AsyncStorage for offline access
  await saveRouteToAsyncStorage(route);

  return data.id;
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

    if (online) {
      return await fetchRoutesOnline();
    } else {
      return await fetchRoutesOffline();
    }
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
      user:users!routes_created_by_fkey (
        id,
        username,
        email
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Update AsyncStorage with the latest data
  await AsyncStorage.setItem(ROUTES_STORAGE_KEY, JSON.stringify(data));

  return data || [];
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

  // Update AsyncStorage with the latest synced data
  await AsyncStorage.setItem(
    ROUTES_STORAGE_KEY,
    JSON.stringify(await fetchRoutesOnline())
  );
};

export const fetchRouteById = async (
  routeId: string
): Promise<RouteType | null> => {
  console.log("Fetching route by ID:", routeId);
  try {
    // First, fetch the main route data
    const { data: routeData, error: routeError } = await supabase
      .from("routes")
      .select("*")
      .eq("id", routeId)
      .single();

    if (routeError) {
      console.error("Error fetching route:", routeError);
      throw routeError;
    }

    if (!routeData) {
      console.log("No route found with ID:", routeId);
      return null;
    }

    // Now, fetch the route points
    const { data: pointsData, error: pointsError } = await supabase
      .from("route_points")
      .select("*")
      .eq("route_id", routeId);

    if (pointsError) {
      console.error("Error fetching route points:", pointsError);
      // Don't throw, continue with empty points array
    }

    // Try to fetch checkpoints if the table exists
    let checkpointsData = [];
    try {
      const { data: checkpoints, error: checkpointsError } = await supabase
        .from("checkpoints")
        .select("*")
        .eq("route_id", routeId);

      if (checkpointsError) {
        console.error("Error fetching checkpoints:", checkpointsError);
      } else {
        checkpointsData = checkpoints || [];
      }
    } catch (error) {
      console.error(
        "Error fetching checkpoints, table might not exist:",
        error
      );
    }

    // Transform the data to match the RouteType
    const route: RouteType = {
      id: routeData.id,
      user_id: routeData.user_id,
      name: routeData.name,
      createdBy: routeData.created_by,
      // @ts-ignore
      points: (pointsData || []).map((point: any) => ({
        id: point.id,
        location: {
          latitude: point.latitude,
          longitude: point.longitude,
        },
        timestamp: point.timestamp,
      })),
      checkpoints: checkpointsData.map((checkpoint: any) => ({
        id: checkpoint.id,
        location: {
          latitude: checkpoint.latitude,
          longitude: checkpoint.longitude,
        },
      })),
      createdAt: routeData.created_at,
      updatedAt: routeData.updated_at,
    };

    // Update local storage
    await AsyncStorage.setItem(`route_${routeId}`, JSON.stringify(route));

    return route;
  } catch (error) {
    console.error("Error in fetchRouteById:", error);

    // Try to fetch from local storage if online fetch fails
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
