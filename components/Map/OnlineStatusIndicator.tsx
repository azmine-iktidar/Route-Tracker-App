import React, { useEffect, useState } from "react";
import { Text, StyleSheet, Animated } from "react-native";

interface StatusIndicatorProps {
  isOnline: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ isOnline }) => {
  const [fadeAnim] = useState(new Animated.Value(0)); // Fade animation

  useEffect(() => {
    // Re-trigger the animation when `isOnline` changes
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOnline]); // Re-run effect when `isOnline` changes

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: isOnline ? "#4caf50" : "#f44336" },
        { opacity: fadeAnim }, // Apply fade animation
      ]}
    >
      <Text style={styles.text}>{isOnline ? "Online" : "Offline"}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 8,
    borderRadius: 5,
    alignItems: "center",
  },
  text: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
  },
});

export default StatusIndicator;
