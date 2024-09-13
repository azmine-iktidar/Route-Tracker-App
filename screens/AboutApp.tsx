import { StyleSheet, Text, View, Image, ScrollView } from "react-native";

const AboutApp = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>About</Text>
        <Text style={styles.title}>Tactical Navigator</Text>
        <Image source={require("../assets/logo.png")} style={styles.logo} />
      </View>

      <Text style={styles.description}>
        Tactical Navigator is designed to assist BD Army in executing missions
        with precision and efficiency using custom routes and checkpoints.
        Developed in collaboration with 15 RE Bn, the app enables soldiers to
        navigate through complex terrains with real-time location tracking,
        strategic route planning, and tactical data sharing across the app
        users.
      </Text>

      <Text style={styles.description}>
        This app offers secure communication, up-to-date map data to ensure
        mission readiness in any environment, specially navigating in dark or
        inclement weather. Whether in operations, training events or regular
        movements, Tactical Navigator can help in situational awareness and
        decision-making on the ground based on previously saved route.
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
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#2A2A2A",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 5,
    marginTop: 5,
    objectFit: "contain",
  },
  description: {
    fontSize: 16,
    color: "#333",
    textAlign: "justify",
    justifyContent: "center",
    marginBottom: 10,
    lineHeight: 21,
  },
  footer: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#555",
    textAlign: "center",
    marginTop: 10,
  },
});
