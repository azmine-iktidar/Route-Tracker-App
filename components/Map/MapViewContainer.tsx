import React, { forwardRef, useImperativeHandle, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline, Region } from "react-native-maps";
import { LocationType, RoutePoint, RouteType, Checkpoint } from "../../types";
import { customMapStyleArray } from "../../contexts";

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
    },
    ref
  ) => {
    const mapRef = React.useRef<MapView | null>(null);
    const [mapKey, setMapKey] = useState(0);

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
            zoom: 17, // You can adjust this zoom level as needed
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

    React.useEffect(() => {
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

    return (
      <View style={styles.container}>
        <MapView
          key={mapKey}
          ref={mapRef}
          style={styles.map}
          provider={"google"}
          showsUserLocation
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
          followsUserLocation={!isViewingMode}
          customMapStyle={customMapStyleArray}
          userInterfaceStyle="dark"
          onMapReady={onMapReady}
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
        {location && location.accuracy && (
          <View style={styles.accuracyContainer}>
            <Text style={styles.accuracyText}>
              Accuracy: {Math.round(location.accuracy)} meters
            </Text>
          </View>
        )}
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
});

export default MapViewContainer;
