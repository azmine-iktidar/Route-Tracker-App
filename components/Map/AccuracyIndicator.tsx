import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface AccuracyIndicatorProps {
  accuracy: number;
}

const AccuracyIndicator: React.FC<AccuracyIndicatorProps> = ({ accuracy }) => {
  const getAccuracyInfo: (accuracy: number) => {
    text: string;
    color: string;
    icon: "gps-not-fixed" | "warning" | "gps-fixed";
  } = (accuracy: number) => {
    if (accuracy >= 100) {
      return {
        text: "Weak GPS Signal",
        color: "#FF4136",
        icon: "gps-not-fixed",
      };
    } else if (accuracy >= 50) {
      return {
        text: "Moderate Accuracy",
        color: "#FF851B",
        icon: "warning",
      };
    } else {
      return {
        text: "Good Accuracy",
        color: "#2ECC40",
        icon: "gps-fixed",
      };
    }
  };

  const { text, color, icon } = getAccuracyInfo(accuracy);

  return (
    <View style={[styles.container, { backgroundColor: color }]}>
      <MaterialIcons name={icon} size={24} color="white" />
      <View style={styles.textContainer}>
        <Text style={styles.accuracyText}>{text}</Text>
        <Text style={styles.metersText}>{`${Math.round(
          accuracy
        )} meters`}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: "auto",
    display: "flex",
    maxWidth: 160,
  },
  textContainer: {
    marginLeft: 8,
  },
  accuracyText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  metersText: {
    color: "white",
    fontSize: 10,
  },
});

export default AccuracyIndicator;
