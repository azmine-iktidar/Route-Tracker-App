import React from "react";
import { View, StyleSheet, Animated } from "react-native";
import { Svg, Path } from "react-native-svg";

interface NorthIndicatingCompassProps {
  heading: number;
}

const NorthIndicatingCompass: React.FC<NorthIndicatingCompassProps> = ({
  heading,
}) => {
  const rotation = new Animated.Value(heading);

  Animated.timing(rotation, {
    toValue: heading,
    duration: 200,
    useNativeDriver: true,
  }).start();

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.compass,
          {
            transform: [
              {
                rotate: rotation.interpolate({
                  inputRange: [0, 360],
                  outputRange: ["0deg", "360deg"],
                }),
              },
            ],
          },
        ]}
      >
        <Svg height="40" width="40" viewBox="0 0 24 24">
          <Path
            d="M12 2L8 11H16L12 2zM12 22L16 13H8L12 22z"
            fill="#FF0000"
            stroke="#FFFFFF"
            strokeWidth="1"
          />
        </Svg>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  compass: {
    width: 40,
    height: 40,
  },
});

export default NorthIndicatingCompass;
