import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline, Region } from "react-native-maps";
import { LocationType, RoutePoint, RouteType, Checkpoint } from "../../types";
import { customMapStyleArray } from "../../contexts";
import AccuracyIndicator from "./AccuracyIndicator";

interface MapViewContainerProps {
  location: LocationType | null;
  currentRoute: RoutePoint[];
  checkpoints: Checkpoint[];
  savedRoute: RouteType | null;
  isViewingMode: boolean;
  isTrackingStopped: boolean;
  routeBounds?: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  } | null;
  onMapReady: () => void;
  getLocation: () => Promise<LocationType | null>;
}
export interface MapViewHandle {
  centerOnUserLocation: () => void;
  centerOnLocation: (location: LocationType) => void;
  fitToCoordinates: (coordinates: LocationType[]) => void;
  clearMap: () => void;
  centerAndZoomOnLocation: (location: LocationType) => void;
}

const MapViewContainer = forwardRef<MapViewHandle, MapViewContainerProps>(
  (
    {
      location,
      currentRoute,
      checkpoints,
      savedRoute,
      isViewingMode,
      isTrackingStopped,
      routeBounds,
      onMapReady,
      getLocation,
    },
    ref
  ) => {
    const mapRef = useRef<MapView | null>(null);
    const [mapKey, setMapKey] = useState(0);
    const animatedValue = useRef(new Animated.Value(0)).current;
    const [currentAccuracy, setCurrentAccuracy] = useState<number | null>(null);
    const [isCompassVisible, setIsCompassVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useImperativeHandle(ref, () => ({
      centerOnUserLocation: () => {
        if (mapRef.current && location) {
          mapRef.current.animateCamera({
            center: {
              latitude: location.latitude,
              longitude: location.longitude,
            },
            zoom: 15,
          });
        }
      },
      centerOnLocation: (loc: LocationType) => {
        if (mapRef.current) {
          mapRef.current.animateCamera({
            center: { latitude: loc.latitude, longitude: loc.longitude },
            zoom: 15,
          });
        }
      },
      fitToCoordinates: (coordinates: LocationType[]) => {
        if (mapRef.current && coordinates.length > 0) {
          mapRef.current.fitToCoordinates(
            coordinates.map((coord) => ({
              latitude: coord.latitude,
              longitude: coord.longitude,
            })),
            {
              edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
              animated: true,
            }
          );
        }
      },
      clearMap: () => {
        setMapKey((prevKey) => prevKey + 1);
      },
      centerAndZoomOnLocation: (loc: LocationType) => {
        if (mapRef.current) {
          mapRef.current.animateCamera({
            center: { latitude: loc.latitude, longitude: loc.longitude },
            zoom: 20,
          });
        }
      },
    }));
    const routeToDisplay =
      isViewingMode && savedRoute ? savedRoute.points : currentRoute;
    const checkpointsToDisplay =
      isViewingMode && savedRoute && savedRoute.checkpoints
        ? savedRoute.checkpoints
        : checkpoints;

    useEffect(() => {
      if (routeBounds) {
        const { minLat, maxLat, minLng, maxLng } = routeBounds;
        const region: Region = {
          latitude: (minLat + maxLat) / 2,
          longitude: (minLng + maxLng) / 2,
          latitudeDelta: (maxLat - minLat) * 1.1, // 10% padding
          longitudeDelta: (maxLng - minLng) * 1.1, // 10% padding
        };
        mapRef.current?.animateToRegion(region, 1000);
      }
    }, [routeBounds]);
    const checkCompassVisibility = async () => {
      if (!mapRef.current) return;
      const camera = await mapRef.current.getCamera();

      if (camera.heading > 0) {
        console.log("Compass is shown");
      }
    };
    const animateView = (toValue: number) => {
      Animated.timing(animatedValue, {
        toValue,
        duration: 300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    };

    const onRegionChangeComplete = async () => {
      if (!mapRef.current) return;
      const camera = await mapRef.current.getCamera();

      if (camera.heading > 0 && !isCompassVisible) {
        console.log("Compass is shown");
        setIsCompassVisible(true);
        animateView(1);
      } else if (camera.heading === 0 && isCompassVisible) {
        console.log("Compass is hidden");
        setIsCompassVisible(false);
        animateView(0);
      }
    };

    const translateX = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 40], // Move 40 units to the right when shown
    });
    useEffect(() => {
      let intervalId: NodeJS.Timeout;

      const updateAccuracy = async () => {
        const newLocation = await getLocation();
        if (newLocation && newLocation.accuracy) {
          setCurrentAccuracy(newLocation.accuracy);
        }
      };

      intervalId = setInterval(updateAccuracy, 2000);

      updateAccuracy();

      return () => {
        if (intervalId) {
          clearInterval(intervalId);
        }
      };
    }, [getLocation]);
    return (
      <View style={styles.container}>
        <MapView
          key={mapKey}
          ref={mapRef}
          style={styles.map}
          showsUserLocation
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
          followsUserLocation={!isViewingMode}
          customMapStyle={customMapStyleArray}
          userInterfaceStyle="dark"
          onMapReady={onMapReady}
          onRegionChangeComplete={onRegionChangeComplete}
          initialRegion={
            location
              ? {
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }
              : undefined
          }
        >
          {routeToDisplay.length > 0 && (
            <Polyline
              coordinates={routeToDisplay.map((point) => ({
                latitude: point.location.latitude,
                longitude: point.location.longitude,
              }))}
              strokeColor={isViewingMode ? "red" : "#000"}
              strokeWidth={3}
            />
          )}

          {checkpointsToDisplay.map((checkpoint, index) => (
            <Marker
              key={checkpoint.id}
              coordinate={{
                latitude: checkpoint.location.latitude,
                longitude: checkpoint.location.longitude,
              }}
            >
              <View
                style={[styles.markerContainer, { backgroundColor: "blue" }]}
              >
                <Text style={styles.markerText}>{`CP${index + 1}`}</Text>
              </View>
            </Marker>
          ))}

          {routeToDisplay.length > 0 && (
            <>
              <Marker
                coordinate={{
                  latitude: routeToDisplay[0].location.latitude,
                  longitude: routeToDisplay[0].location.longitude,
                }}
              >
                <View
                  style={[styles.markerContainer, { backgroundColor: "green" }]}
                >
                  <Text style={styles.markerText}>SP</Text>
                </View>
              </Marker>

              {(isTrackingStopped || isViewingMode) && (
                <Marker
                  coordinate={{
                    latitude:
                      routeToDisplay[routeToDisplay.length - 1].location
                        .latitude,
                    longitude:
                      routeToDisplay[routeToDisplay.length - 1].location
                        .longitude,
                  }}
                >
                  <View
                    style={[styles.markerContainer, { backgroundColor: "red" }]}
                  >
                    <Text style={styles.markerText}>FP</Text>
                  </View>
                </Marker>
              )}
            </>
          )}
        </MapView>
        <Animated.View
          style={[
            styles.animatedView,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          {location && location.accuracy && (
            <AccuracyIndicator accuracy={location.accuracy} />
          )}
        </Animated.View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  accuracyContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 5,
    borderRadius: 5,
    zIndex: 1000,
  },
  accuracyText: {
    color: "white",
    fontSize: 12,
  },
  markerContainer: {
    borderRadius: 20,
    padding: 5,
    borderWidth: 1,
    borderColor: "white",
  },
  markerText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  animatedView: {
    position: "absolute",
    top: 10,
    left: 10,
  },
  rotationText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default MapViewContainer;
