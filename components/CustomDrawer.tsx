import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerContentComponentProps,
} from "@react-navigation/drawer";
import { User } from "../types"; // Make sure to import the User type

interface CustomDrawerProps extends DrawerContentComponentProps {
  user: User | null;
  logout: () => Promise<void>;
}

export function CustomDrawer({ user, logout, ...props }: CustomDrawerProps) {
  return (
    <View style={styles.container}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.drawerContent}
      >
        <View style={styles.header}>
          <Image source={require("../assets/logo.png")} style={styles.logo} />
        </View>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      {user && (
        <View style={styles.footer}>
          <Text style={styles.userEmail}>{user.email}</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: "SourceSansPro_700Bold",
    fontSize: 20,
  },
  body: {
    fontFamily: "SourceSansPro_400Regular",
    fontSize: 16,
  },
  emphasis: {
    fontFamily: "SourceSansPro_400Regular_Italic",
    fontSize: 16,
  },
  specialText: {
    fontFamily: "BalsamiqSans_400Regular",
    fontSize: 18,
  },
  container: {
    flex: 1,
  },
  drawerContent: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f4f4f4",
    alignItems: "center",
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 10,
    objectFit: "contain",
  },
  appName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f4f4f4",
  },
  userEmail: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: "#f44336",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
