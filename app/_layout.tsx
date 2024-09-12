import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  ThemeProvider,
} from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { TextStyle } from "react-native";
import * as Linking from "expo-linking";
import { useColorScheme } from "../components/useColorScheme.web";
import { useAuth } from "../hooks/useAuth";
import { CustomDrawer } from "@/components/CustomDrawer";
import { LoginScreen } from "@/screens/LoginScreen";
import { screenComponents } from "@/screens/screenComponents";

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
  const { isLoggedIn, isLoading, login, logout, user } = useAuth();

  const mainScreens: MainScreenName[] = ["Map", "RouteList", "AboutApp"];

  const theme = colorScheme === "dark" ? DarkTheme : DefaultTheme;

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

  if (isLoading) {
    // You might want to show a loading screen here
    return null;
  }

  return (
    <ThemeProvider value={theme}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <SafeAreaProvider>
        <NavigationContainer theme={theme} linking={linking} independent={true}>
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
              </>
            ) : (
              <>
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
                      const ScreenComponent = screenComponents[name];
                      return <ScreenComponent {...props} />;
                    }}
                  </Drawer.Screen>
                ))}
              </>
            )}
          </Drawer.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
