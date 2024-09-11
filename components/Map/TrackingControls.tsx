import React from "react";
import { View, Button, StyleSheet } from "react-native";

interface TrackingControlsProps {
  isTracking: boolean;
  startTracking: () => void;
  stopTracking: () => void;
  addCheckpoint: () => void;
}

const TrackingControls: React.FC<TrackingControlsProps> = ({
  isTracking,
  startTracking,
  stopTracking,
  addCheckpoint,
}) => {
  return (
    <View style={styles.container}>
      <Button
        title={isTracking ? "Stop Tracking" : "Start Tracking"}
        onPress={isTracking ? stopTracking : startTracking}
        touchSoundDisabled={false}
      />
      {isTracking && <Button title="Add Checkpoint" onPress={addCheckpoint} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",

    gap: 10,
    marginHorizontal: "auto",
    bottom: 20,
    left: 10,
    right: 10,
    flexDirection: "column-reverse",
    justifyContent: "space-between",
  },
});

export default TrackingControls;
