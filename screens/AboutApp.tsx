import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  Alert,
  TouchableOpacity,
  Linking,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { supabase } from "../supabaseClient";

const AboutApp = () => {
  const [currentVersion, setCurrentVersion] = useState("1.0.0");
  const [latestVersion, setLatestVersion] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkForUpdates = async () => {
    setIsChecking(true);
    try {
      const { data, error } = await supabase
        .from("appversion")
        .select("*")
        .eq("isactive", true)
        .order("version", { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        setLatestVersion(data[0]);
        if (data[0].version !== currentVersion) {
          showUpdateAlert(data[0]);
        } else {
          Alert.alert("Up to Date", "You're using the latest version.");
        }
      } else {
        Alert.alert(
          "No Version Info",
          "Unable to retrieve version information."
        );
      }
    } catch (error) {
      console.error("Error checking for updates:", error);
      Alert.alert(
        "Error",
        "Failed to check for updates. Please try again later."
      );
    } finally {
      setIsChecking(false);
    }
  };

  const showUpdateAlert = (updateInfo) => {
    Alert.alert(
      "Update Available",
      `Version ${updateInfo.version} is available. ${
        updateInfo.message || "Would you like to update now?"
      }`,
      [
        { text: "Not Now", style: "cancel" },
        {
          text: "Update",
          onPress: () => Linking.openURL(updateInfo.downloadlink),
        },
      ]
    );
  };

  useEffect(() => {
    checkForUpdates();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Image source={require("../assets/logo.png")} style={styles.logo} />
        <Text style={styles.title}>Tactical Navigator</Text>
        <Text style={styles.version}>v{currentVersion}</Text>
        <TouchableOpacity
          style={{
            ...styles.updateButton,
            backgroundColor: isChecking ? "#bdc3c7" : "#3498db",
          }}
          onPress={checkForUpdates}
          disabled={isChecking}
        >
          <MaterialIcons name="system-update" size={24} color="#ffffff" />
          <Text style={styles.updateButtonText}>
            {isChecking ? "Checking..." : "Check for Updates"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>About the App</Text>
        <Text style={styles.description}>
          Tactical Navigator assists BD Army in executing missions with custom
          routes, real-time tracking, and secure data sharing.
        </Text>
        <Text style={styles.description}>
          Navigate complex terrains, ensure mission readiness, and make informed
          decisions with pre-saved routes and up-to-date map data.
        </Text>
      </View>

      <Text style={styles.developer}>
        Developed by: BA-10846 Capt Md. Azmine Abrar, Engrs
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f0f4f8",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 5,
  },
  version: {
    fontSize: 16,
    color: "#7f8c8d",
    marginBottom: 15,
  },
  updateButton: {
    flexDirection: "row",
    alignItems: "center",

    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
  },
  updateButtonText: {
    color: "#ffffff",
    marginLeft: 10,
    fontSize: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#34495e",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#5d6d7e",
    marginBottom: 10,
    lineHeight: 24,
  },
  developer: {
    fontSize: 10,
    textAlign: "center",
    marginBottom: 20,
    marginTop: 30,
    fontWeight: "bold",
    color: "#5d6d7e",
  },
});

export default AboutApp;
