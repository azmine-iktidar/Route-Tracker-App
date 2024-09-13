import {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useCallback,
} from "react";
import {
  View,
  Alert,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import { LocationType, RouteType, RoutePoint, Checkpoint } from "../types";
import { useUserStore } from "../contexts/userStore";
import {
  saveRoute,
  fetchRouteById,
  syncOfflineRoutes,
} from "../utils/RouteService";
import {
  stopLocationTracking,
  startLocationTracking,
} from "../utils/LocationService";
import MapViewContainer, {
  MapViewHandle,
} from "../components/Map/MapViewContainer";
import LocationButton from "../components/Map/LocationButton";
import RouteNameInput from "../components/Map/RouteNameInput";
import StatusIndicator from "../components/Map/StatusIndicator";
import TrackingControls from "../components/Map/TrackingControls";
import { isOnline } from "../utils/netcheck";
import { RouteProp } from "@react-navigation/native";
interface RouteParams {
  routeId: string;
}
type MapScreenRouteProp = {
  route: RouteProp<Record<string, RouteParams>, string>;
  navigation: any;
};

export default function MapScreen({ route, navigation }: MapScreenRouteProp) {
  const [location, setLocation] = useState<LocationType | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<RoutePoint[]>([]);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [routeName, setRouteName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [isOnlineState, setIsOnlineState] = useState(true);
  const [savedRoute, setSavedRoute] = useState<RouteType | null>(null);
  const [isViewingMode, setIsViewingMode] = useState(false);
  const [saveLoadingState, setSaveLoadingState] = useState(false);
  const [isTrackingStopped, setIsTrackingStopped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const userId = useUserStore((state) => state.user?.id);
  const mapRef = useRef<MapViewHandle>(null);
  const [routeBounds, setRouteBounds] = useState<{
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  } | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const calculateRouteBounds = (points: RoutePoint[]) => {
    if (points.length === 0) return null;

    let minLat = points[0].location.latitude;
    let maxLat = points[0].location.latitude;
    let minLng = points[0].location.longitude;
    let maxLng = points[0].location.longitude;

    points.forEach((point) => {
      minLat = Math.min(minLat, point.location.latitude);
      maxLat = Math.max(maxLat, point.location.latitude);
      minLng = Math.min(minLng, point.location.longitude);
      maxLng = Math.max(maxLng, point.location.longitude);
    });

    return { minLat, maxLat, minLng, maxLng };
  };

  const fetchSavedRouteById = async (routeId: string) => {
    console.log("Fetching saved route by ID:", routeId);
    try {
      const fetchedRoute = await fetchRouteById(routeId);

      if (fetchedRoute) {
        setSavedRoute(fetchedRoute);
        setIsViewingMode(true);

        if (fetchedRoute.points && fetchedRoute.points.length > 0) {
          setCurrentRoute(fetchedRoute.points);
          const bounds = calculateRouteBounds(fetchedRoute.points);
          setRouteBounds(bounds);
        } else {
          console.warn("No route points found in the fetched route");
          Alert.alert("Warning", "This route has no recorded points.");
          mapRef.current?.centerOnUserLocation();
        }

        if (fetchedRoute.checkpoints && fetchedRoute.checkpoints.length > 0) {
          setCheckpoints(fetchedRoute.checkpoints);
        } else {
          console.log("No checkpoints found for this route");
        }
      } else {
        console.warn("Route not found");
        Alert.alert("Error", "Route not found or could not be loaded.");
        mapRef.current?.centerOnUserLocation();
      }
    } catch (error) {
      console.error("Error fetching route:", error);
      Alert.alert("Error", "Failed to fetch route. Please try again.");
      mapRef.current?.centerOnUserLocation();
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (route.params?.routeId) {
      setIsLoading(true);
      fetchSavedRouteById(route.params.routeId);
    }
  }, [route.params?.routeId]);
  useEffect(() => {
    console.log("MapScreen mounted");
    const checkConnectionAndSync = async () => {
      const online = await isOnline();
      setIsOnlineState(online);
      if (online) {
        await syncOfflineRoutes();
      }
    };

    checkConnectionAndSync();
    setupLocationAndFetchRoute();

    return () => {
      console.log("MapScreen unmounting");
      stopLocationTracking();
    };
  }, []);

  const setupLocationAndFetchRoute = async () => {
    console.log("Setting up location permissions");
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.error("Location permission denied");
      setErrorMsg("Permission to access location was denied");
      return;
    }

    console.log("Location permission granted, updating location");
    await updateLocation();
  };
  const getLocation = useCallback(async (): Promise<LocationType | null> => {
    try {
      let location = await Location.getCurrentPositionAsync({});
      const newLocation: LocationType = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy ?? undefined,
        altitude: location.coords.altitude ?? undefined,
        speed: location.coords.speed ?? undefined,
        timestamp: location.timestamp,
      };
      setLocation(newLocation);
      return newLocation;
    } catch (error) {
      console.error("Error getting current location:", error);
      setErrorMsg("Failed to get current location");
      return null;
    }
  }, []);
  const updateLocation = async () => {
    try {
      let location = await Location.getCurrentPositionAsync({});
      console.log("Current location:", location);
      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy ?? undefined,
        altitude: location.coords.altitude ?? undefined,
        speed: location.coords.speed ?? undefined,
        timestamp: location.timestamp,
      };
      setLocation(newLocation);

      if (isMapReady && mapRef.current) {
        mapRef.current.centerAndZoomOnLocation(newLocation);
      }
    } catch (error) {
      console.error("Error getting current location:", error);
      setErrorMsg("Failed to get current location");
    }
  };
  const handleMapReady = () => {
    setIsMapReady(true);
  };
  useEffect(() => {
    if (isMapReady && !route.params?.routeId) {
      updateLocation();
    }
  }, [isMapReady]);

  useLayoutEffect(() => {
    if (route.params?.routeId) {
      setIsLoading(true);
      fetchSavedRouteById(route.params.routeId);
    } else {
      mapRef.current?.centerOnUserLocation();
    }
  }, [route.params?.routeId]);
  const handleNewLocation = (newLocation: Location.LocationObject) => {
    console.log("New location received:", newLocation);
    const point: RoutePoint = {
      id: Date.now().toString(),
      location: {
        latitude: newLocation.coords.latitude,
        longitude: newLocation.coords.longitude,
        accuracy: newLocation.coords.accuracy ?? undefined,
        altitude: newLocation.coords.altitude ?? undefined,
        speed: newLocation.coords.speed ?? undefined,
        timestamp: newLocation.timestamp,
      },
      timestamp: newLocation.timestamp,
    };
    setCurrentRoute((prevRoute) => [...prevRoute, point]);
    setLocation(point.location);
  };

  const startTracking = () => {
    console.log("Starting tracking");
    setIsTracking(true);
    setIsTrackingStopped(false);
    setCurrentRoute([]);
    setCheckpoints([]);
    startLocationTracking(handleNewLocation);
  };

  const stopTracking = () => {
    console.log("Stopping tracking");
    setIsTracking(false);
    setIsTrackingStopped(true);
    stopLocationTracking();
    setShowNameInput(true);
  };

  const addCheckpoint = () => {
    if (location) {
      console.log("Adding checkpoint at location:", location);
      const newCheckpoint: Checkpoint = {
        id: Date.now().toString(),
        location: location,
      };
      setCheckpoints((prev) => [...prev, newCheckpoint]);
    } else {
      console.warn("Attempted to add checkpoint with no current location");
    }
  };

  const handleSaveRoute = async () => {
    setSaveLoadingState(true);
    console.log("Attempting to save route");
    if (currentRoute.length === 0) {
      console.warn("No route to save");
      Alert.alert("Error", "No route to save");
      setSaveLoadingState(false);
      return;
    }

    if (!routeName) {
      console.warn("No route name provided");
      Alert.alert("Error", "Please enter a name for the route");
      setSaveLoadingState(false);
      return;
    }

    if (!userId) {
      console.error("No user ID available");
      Alert.alert("Error", "User not logged in");
      setSaveLoadingState(false);
      return;
    }

    const newRoute: RouteType = {
      user_id: userId,
      id: Date.now().toString(),
      name: routeName,
      createdBy: userId,
      points: currentRoute,
      checkpoints: checkpoints,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log("New route object:", newRoute);

    try {
      const savedRouteId = await saveRoute(newRoute);
      console.log("Route saved successfully with ID:", savedRouteId);
      clearRoute();
      navigation.navigate("RouteList");
    } catch (error) {
      console.error("Error saving route:", error);
      Alert.alert("Error", "Failed to save route. Please try again.");
    } finally {
      setSaveLoadingState(false);
    }
  };

  const clearRoute = () => {
    setShowNameInput(false);
    setRouteName("");
    setCurrentRoute([]);
    setCheckpoints([]);
    setSavedRoute(null);
    setIsViewingMode(false);
    setIsTrackingStopped(false);
  };

  const clearMap = () => {
    if (mapRef.current) {
      mapRef.current.clearMap();
      mapRef.current.centerOnUserLocation();
      setSavedRoute(null);
      setIsViewingMode(false);
      setCurrentRoute([]);
      setCheckpoints([]);
    }
  };

  const discardRoute = () => {
    console.log("Discarding route");
    Alert.alert(
      "Discard Route",
      "Are you sure you want to discard this route?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => {
            clearRoute();
          },
        },
      ]
    );
  };
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading route...</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <MapViewContainer
        ref={mapRef}
        location={location}
        currentRoute={currentRoute}
        checkpoints={checkpoints}
        savedRoute={savedRoute}
        isViewingMode={isViewingMode}
        isTrackingStopped={isTrackingStopped}
        routeBounds={routeBounds}
        onMapReady={handleMapReady}
        getLocation={getLocation}
      />
      <StatusIndicator isOnline={isOnlineState} />
      {!showNameInput && !isViewingMode && (
        <TrackingControls
          isTracking={isTracking}
          startTracking={startTracking}
          stopTracking={stopTracking}
          addCheckpoint={addCheckpoint}
        />
      )}
      {showNameInput && (
        <RouteNameInput
          routeName={routeName}
          setRouteName={setRouteName}
          saveRoute={handleSaveRoute}
          saveLoadingState={saveLoadingState}
          discardRoute={discardRoute}
        />
      )}
      {!showNameInput && (
        <LocationButton
          onPress={() => {
            console.log("Centering on user location");
            mapRef.current?.centerOnUserLocation();
          }}
        />
      )}
      {isViewingMode && (
        <TouchableOpacity style={styles.clearButton} onPress={clearMap}>
          <Text style={styles.clearButtonText}>Clear Map</Text>
        </TouchableOpacity>
      )}
      {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
    </View>
  );
}

// Styles would be defined here, but they are omitted as requested
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
  clearButton: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 10,
    borderRadius: 5,
  },
  clearButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: "#333",
  },
});
