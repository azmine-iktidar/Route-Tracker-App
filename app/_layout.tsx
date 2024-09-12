import {
  DarkTheme,
  NavigationContainer,
  ThemeProvider,
} from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { TextStyle } from "react-native";
import { useAuth } from "@/hooks/useAuth";
import { CustomDrawer } from "@/components/CustomDrawer";
import { screenComponents } from "@/screens/screenComponents";
import { useColorScheme } from "@/components/useColorScheme";

const Drawer = createDrawerNavigator();

export default function App() {
  const colorScheme = useColorScheme();
  const { isLoggedIn, isLoading, login, logout, user } = useAuth();

  const mainScreens: ("Map" | "RouteList" | "AboutApp" | "Login")[] = [
    "Map",
    "RouteList",
    "AboutApp",
  ];

  const drawerScreenOptions = {
    headerStyle: {
      backgroundColor: "black",
    },
    headerTintColor: "#fff",
    headerTitleStyle: {
      fontWeight: "bold",
      fontStyle: "normal",
    } as TextStyle,
    drawerStyle: {
      backgroundColor: "#f8f8f8",
      width: 240,
    },
    swipeEnabled: isLoggedIn,
    drawerLabelStyle: {},
  };

  const renderMainScreen = (name: string) => (props: any) => {
    const ScreenComponent =
      screenComponents[name as keyof typeof screenComponents];
    return <ScreenComponent {...props} />;
  };

  return (
    <ThemeProvider value={DarkTheme}>
      <StatusBar backgroundColor="black" animated translucent />
      <SafeAreaProvider>
        <NavigationContainer independent>
          {isLoggedIn ? (
            <Drawer.Navigator
              initialRouteName="Map"
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
              screenOptions={drawerScreenOptions}
            >
              {mainScreens.map((name) => (
                <Drawer.Screen
                  key={name}
                  name={name}
                  options={{
                    swipeEnabled: true,
                    swipeEdgeWidth: 50,
                    swipeMinDistance: 50,
                    headerTitle: name === "AboutApp" ? "About App" : name,
                    title: name === "AboutApp" ? "About App" : name,
                    drawerLabelStyle: {
                      fontWeight: "bold",
                    },
                  }}
                >
                  {(props) => {
                    const ScreenComponent =
                      screenComponents[name as keyof typeof screenComponents];
                    return <ScreenComponent {...props} />;
                  }}
                </Drawer.Screen>
              ))}
            </Drawer.Navigator>
          ) : (
            <Drawer.Navigator
              screenOptions={{
                ...drawerScreenOptions,
                swipeEnabled: false,
                drawerType: "front",
              }}
            >
              <Drawer.Screen
                name="Login"
                options={{
                  headerTitle: "Login",
                  title: "Login",
                  swipeEnabled: false,
                }}
              >
                {(props) => {
                  const LoginScreen = screenComponents["Login"];
                  return <LoginScreen {...props} login={login} />;
                }}
              </Drawer.Screen>
              <Drawer.Screen
                name="Register"
                options={{
                  headerTitle: "Register",
                }}
                component={screenComponents["Register"]}
              />
              <Drawer.Screen
                name="AboutApp"
                options={{
                  headerTitle: "About App",
                }}
                component={screenComponents["AboutApp"]}
              />
            </Drawer.Navigator>
          )}
        </NavigationContainer>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
