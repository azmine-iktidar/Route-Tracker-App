import { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, ScrollView, Alert } from "react-native";

const AboutApp = () => {
  const [version, setVersion] = useState("1.0.0");

  // Simulate update check on page load
  useEffect(() => {
    const checkForUpdates = async () => {
      // Simulated update check (replace with real API call)
      const hasUpdate = false; // Simulate an available update

      if (hasUpdate) {
        Alert.alert(
          "Update Available",
          "A new version is available. Would you like to download it now?",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Download",
              onPress: () => {
                // Replace with the actual download link
                console.log("Download initiated...");
              },
            },
          ]
        );
      }
    };

    checkForUpdates();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>About</Text>
        <Text style={styles.subtitle}>Tactical Navigator v1.0.0</Text>
        <Image source={require("../assets/logo.png")} style={styles.logo} />
      </View>

      <Text style={styles.description}>
        Tactical Navigator assists BD Army in executing missions with custom
        routes, real-time tracking, and secure data sharing.
      </Text>

      <Text style={styles.description}>
        Navigate complex terrains, ensure mission readiness, and make informed
        decisions with pre-saved routes and up-to-date map data.
      </Text>

      <Text style={styles.footer}>
        Developed By: BA-10846 Capt Md. Azmine Abrar, Engrs
      </Text>
    </ScrollView>
  );
};

export default AboutApp;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1f2937",
  },
  subtitle: {
    fontSize: 18,
    color: "#4b5563",
    marginBottom: 10,
  },
  logo: {
    width: 90,
    height: 90,
    marginVertical: 10,
  },
  description: {
    fontSize: 16,
    color: "#374151",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  footer: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 20,
  },
});
