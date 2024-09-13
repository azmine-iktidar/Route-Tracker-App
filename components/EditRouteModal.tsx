import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { supabase } from "@/supabaseClient";

interface EditRouteModalProps {
  isVisible: boolean;
  routeID: string;
  onClose: (shouldRefresh?: boolean) => void;
  onUpdate: (newRouteName: string) => void;
  currentName: string;
}

const EditRouteModal: React.FC<EditRouteModalProps> = ({
  isVisible,
  routeID,
  onClose,
  onUpdate,
  currentName,
}) => {
  const [newRouteName, setNewRouteName] = useState(currentName);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setNewRouteName(currentName);
  }, [currentName]);

  const handleEdit = async () => {
    if (!newRouteName.trim()) {
      Alert.alert("Error", "Route name cannot be empty.");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from("routes")
        .update({ name: newRouteName })
        .eq("id", routeID);

      if (error) throw error;

      onUpdate(newRouteName);
      onClose(true);
    } catch (error) {
      console.error("Error editing route:", error);
      Alert.alert("Error", "Failed to edit route. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={isVisible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Edit Route</Text>
          <TextInput
            value={newRouteName}
            onChangeText={setNewRouteName}
            placeholder="Enter new route name"
            style={styles.input}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => onClose(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.updateButton]}
              onPress={handleEdit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Update</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 320,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    elevation: 5,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    padding: 10,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#ff3b3b",
  },
  updateButton: {
    backgroundColor: "#007bff",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default EditRouteModal;
