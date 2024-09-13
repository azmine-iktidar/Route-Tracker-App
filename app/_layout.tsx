import { useState, useEffect, useCallback } from "react";
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  ThemeProvider,
} from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { TextStyle, View, ActivityIndicator } from "react-native";
import * as Linking from "expo-linking";
import * as Location from "expo-location";
import { useColorScheme } from "../components/useColorScheme.web";
import { useAuth } from "../hooks/useAuth";
import { CustomDrawer } from "../components/CustomDrawer";
import { screenComponents } from "../screens/screenComponents";
import { LoginScreen } from "@/screens/LoginScreen";

const Drawer = createDrawerNavigator();

type MainScreenName = "Map" | "RouteList" | "AboutApp";

const linking = {
  prefixes: [Linking.createURL("/")],
  config: {
    screens: {
      Login: "login",
      Register: "register",
      Map: "map",
      RouteList: "routes",
      AboutApp: "about",
    },
  },
};

export default function AppLayout() {
  const colorScheme = useColorScheme();
  const {
    isLoggedIn,
    isLoading: isAuthLoading,
    login,
    logout,
    user,
  } = useAuth();
  const [isLocationPermissionGranted, setIsLocationPermissionGranted] =
    useState(false);
  const [isInitialChecksDone, setIsInitialChecksDone] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  const theme = colorScheme === "dark" ? DarkTheme : DefaultTheme;

  const performInitialChecks = useCallback(async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      setIsLocationPermissionGranted(status === "granted");

      // Simulate map loading (replace with actual map loading logic if needed)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsMapReady(true);
    } catch (error) {
      console.error("Error during initial checks:", error);
    } finally {
      setIsInitialChecksDone(true);
    }
  }, []);

  useEffect(() => {
    performInitialChecks();
  }, [performInitialChecks]);

  const drawerScreenOptions = {
    headerStyle: {
      backgroundColor: theme.colors.card,
    },
    headerTintColor: theme.colors.text,
    headerTitleStyle: {
      fontWeight: "bold",
      fontStyle: "normal",
    } as TextStyle,
    drawerStyle: {
      backgroundColor: theme.colors.background,
      width: 240,
    },
    swipeEnabled: isLoggedIn,
    drawerLabelStyle: {},
  };

  const renderNavigator = () => {
    if (isAuthLoading || !isInitialChecksDone || !isMapReady) {
      return (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }

    return (
      <Drawer.Navigator
        screenOptions={drawerScreenOptions}
        drawerContent={(props) => (
          <CustomDrawer
            {...props}
            user={user}
            logout={async () => {
              const success = await logout();
              if (success) {
                props.navigation.reset({
                  index: 0,
                  routes: [{ name: "Login" }],
                });
              }
            }}
          />
        )}
      >
        {!isLoggedIn ? (
          <>
            <Drawer.Screen
              name="Login"
              options={{
                headerTitle: "Login",
                title: "Login",
                swipeEnabled: false,
              }}
            >
              {(props) => <LoginScreen {...props} login={login} />}
            </Drawer.Screen>
            <Drawer.Screen
              name="Register"
              options={{
                headerTitle: "Register",
              }}
              component={screenComponents.Register}
            />
            <Drawer.Screen
              name="AboutApp"
              options={{
                headerTitle: "About App",
                drawerLabel: "About App",
              }}
              component={screenComponents.AboutApp}
            />
          </>
        ) : (
          <>
            {(["Map", "RouteList", "AboutApp"] as const).map((name) => (
              <Drawer.Screen
                key={name}
                name={name}
                options={{
                  swipeEnabled: true,
                  swipeEdgeWidth: 50,
                  swipeMinDistance: 50,
                  headerTitle:
                    name === "AboutApp"
                      ? "About App"
                      : name === "RouteList"
                      ? "Routes"
                      : "Map",
                  title:
                    name === "AboutApp"
                      ? "About App"
                      : name === "RouteList"
                      ? "Routes"
                      : "Map",
                  drawerLabelStyle: {
                    fontWeight: "bold",
                  },
                }}
              >
                {(props) => {
                  const ScreenComponent = screenComponents[name];
                  // @ts-ignore
                  return <ScreenComponent {...props} />;
                }}
              </Drawer.Screen>
            ))}
          </>
        )}
      </Drawer.Navigator>
    );
  };

  return (
    <ThemeProvider value={DarkTheme}>
      <StatusBar style={"dark"} />
      <SafeAreaProvider>
        <NavigationContainer theme={theme} linking={linking} independent={true}>
          {renderNavigator()}
        </NavigationContainer>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
