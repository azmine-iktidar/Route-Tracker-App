import * as Location from "expo-location";

let locationSubscription: Location.LocationSubscription | null = null;

export const startLocationTracking = async (
  callback: (location: Location.LocationObject) => void
) => {
  locationSubscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 2000,
      distanceInterval: 5,
    },
    callback
  );
};
export const stopLocationTracking = () => {
  if (locationSubscription) {
    locationSubscription.remove();
    locationSubscription = null;
  }
};
