import { useState, useEffect } from "react";
import { View, Text, StyleSheet, Switch, Button } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppConfig, User } from "../types";
import { getAuth, signOut } from "firebase/auth";

const auth = getAuth();

export default function SettingsScreen({ navigation }: any) {
  const [config, setConfig] = useState<AppConfig>({
    apiUrl: "",
    enableOfflineMaps: false,
    allowGroupSharing: false,
    mapSettings: {
      zoomLevel: 10,
      offlineEnabled: false,
      showTraffic: false,
    },
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    loadConfig();
    loadCurrentUser();
  }, []);

  const loadConfig = async () => {
    try {
      const savedConfig = await AsyncStorage.getItem("appConfig");
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
      }
    } catch (error) {
      console.error("Error loading config:", error);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const userString = await AsyncStorage.getItem("user");
      if (userString) {
        setCurrentUser(JSON.parse(userString));
      }
    } catch (error) {
      console.error("Error loading current user:", error);
    }
  };

  const saveConfig = async (newConfig: AppConfig) => {
    try {
      await AsyncStorage.setItem("appConfig", JSON.stringify(newConfig));
      setConfig(newConfig);
    } catch (error) {
      console.error("Error saving config:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem("user");
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.setting}>
        <Text>Enable Offline Maps</Text>
        <Switch
          value={config.enableOfflineMaps}
          onValueChange={(value) =>
            saveConfig({ ...config, enableOfflineMaps: value })
          }
        />
      </View>

      <View style={styles.setting}>
        <Text>Allow Group Sharing</Text>
        <Switch
          value={config.allowGroupSharing}
          onValueChange={(value) =>
            saveConfig({ ...config, allowGroupSharing: value })
          }
        />
      </View>

      <View style={styles.setting}>
        <Text>Show Traffic</Text>
        <Switch
          value={config.mapSettings.showTraffic}
          onValueChange={(value) =>
            saveConfig({
              ...config,
              mapSettings: { ...config.mapSettings, showTraffic: value },
            })
          }
        />
      </View>

      {currentUser && (
        <View style={styles.userInfo}>
          <Text>Logged in as: {currentUser.username}</Text>
          <Text>Email: {currentUser.email}</Text>
        </View>
      )}

      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  setting: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  userInfo: {
    marginTop: 20,
    marginBottom: 20,
  },
});
