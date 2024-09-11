import { StyleSheet, Text, View, Image, ScrollView } from "react-native";

const AboutApp = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>About Tactical Navigator</Text>
        <Image source={require("../assets/logo.png")} style={styles.logo} />
      </View>

      <Text style={styles.description}>
        Tactical Navigator is designed to assist Bangladesh Army personnel in
        executing missions with precision and efficiency. Developed in
        collaboration with 15 RE Bn, the app empowers soldiers to navigate
        through complex terrains with real-time location tracking, strategic
        route planning, and tactical data sharing.
      </Text>

      <Text style={styles.description}>
        This app offers secure communication, up-to-date map data, and offline
        functionality to ensure mission readiness in any environment. Whether in
        field operations or training exercises, Tactical Navigator enhances
        situational awareness and decision-making on the ground.
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
    fontSize: 24,
    fontWeight: "bold",
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
    width: 150,
    height: 150,
    marginBottom: 20,
    objectFit: "contain",
  },
  description: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 22,
  },
  footer: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#555",
    textAlign: "center",
    marginTop: 30,
  },
});
