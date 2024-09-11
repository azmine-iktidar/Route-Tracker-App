import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { RouteWithUser } from "../../types";

interface RouteItemProps {
  item: RouteWithUser;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

const RouteItem: React.FC<RouteItemProps> = ({ item, onView, onDelete }) => (
  <View style={styles.routeItem}>
    <View style={styles.routeInfo}>
      <Text style={styles.routeName}>{item.name}</Text>
      <Text>Created by: {item.user.username}</Text>
      <Text>Date: {new Date(item.created_at).toLocaleDateString()}</Text>
    </View>
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={styles.viewButton}
        onPress={() => onView(item.id)}
      >
        <Text style={styles.buttonText}>View</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(item.id)}
      >
        <Text style={styles.buttonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  routeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  routeInfo: {
    flex: 1,
  },
  routeName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
  },
  viewButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default RouteItem;
