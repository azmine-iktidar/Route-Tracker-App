import React from "react";
import { Text, StyleSheet, Animated } from "react-native";

interface StatusIndicatorProps {
  isOnline: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ isOnline }) => {
  const [fadeAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOnline]);

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: isOnline ? "#4caf4f86" : "#f443367f" },
        { opacity: fadeAnim },
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
    backgroundColor: "rgba(255, 0, 0, 0.7)",
    padding: 5,
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
