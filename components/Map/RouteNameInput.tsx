import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

interface RouteNameInputProps {
  routeName: string;
  setRouteName: (name: string) => void;
  saveRoute: () => void;
  saveLoadingState: boolean;
  discardRoute: () => void;
}

const RouteNameInput: React.FC<RouteNameInputProps> = ({
  routeName,
  setRouteName,
  saveRoute,
  saveLoadingState,
  discardRoute,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Route Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter route name"
          value={routeName}
          onChangeText={setRouteName}
          placeholderTextColor="#888"
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={saveRoute}
            disabled={saveLoadingState}
          >
            {saveLoadingState ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Save Route</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.discardButton]}
            onPress={discardRoute}
          >
            <Text style={styles.buttonText}>Discard</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  card: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: "#f9f9f9",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    width: "48%",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#007bff",
  },
  discardButton: {
    backgroundColor: "#dc3545",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default RouteNameInput;
