import React from "react";
import { View, Text } from "react-native";

import RegisterScreen from "./RegisterScreen";
import MapScreen from "./MapScreen";
import RouteListScreen from "./RouteListScreen";

import { LoginScreen } from "./LoginScreen";
import AboutApp from "./AboutApp";

// Placeholder component for screens that haven't been implemented yet
const PlaceholderScreen: React.FC<{ name: string }> = ({ name }) => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text>{name} Screen</Text>
    <Text>This screen has not been implemented yet.</Text>
  </View>
);

// Export all screen components
export const screenComponents = {
  Login: LoginScreen,
  Register: RegisterScreen,
  Map: MapScreen,
  RouteList: RouteListScreen,

  AboutApp: AboutApp,
};

// TypeScript type for the screenComponents object
export type ScreenComponentsType = typeof screenComponents;
