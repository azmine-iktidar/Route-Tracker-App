import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../supabaseClient";
import { RouteWithUser } from "../types";
import { MaterialIcons } from "@expo/vector-icons";
import { isOnline } from "../utils/netcheck";
import { FlashList } from "@shopify/flash-list";
import EditRouteModal from "@/components/EditRouteModal";

export default function RouteListScreen({ navigation }: { navigation: any }) {
  const [routes, setRoutes] = useState<RouteWithUser[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<RouteWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRouteID, setSelectedRouteID] = useState<string>("");
  const [selectedRouteName, setSelectedRouteName] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    fetchRoutes();
  }, []);

  useEffect(() => {
    filterRoutes();
  }, [routes, searchQuery]);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("routes")
        .select(
          `
          *,
          user:users!routes_created_by_fkey (
            id,
            username,
            email
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRoutes(data || []);
    } catch (error) {
      console.error("Error fetching routes:", error);
      Alert.alert("Error", "Failed to fetch routes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filterRoutes = () => {
    const filtered = routes.filter(
      (route) =>
        route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        route.user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredRoutes(filtered);
  };

  const handleRefresh = useCallback(async () => {
    const onlineStatus = await isOnline();
    if (onlineStatus) {
      setRefreshing(true);
      await fetchRoutes();
      setRefreshing(false);
    } else {
      Alert.alert("No Internet", "You are not connected to the internet.");
    }
  }, []);

  const deleteRoute = async (id: string) => {
    Alert.alert("Delete Route", "Are you sure you want to delete this route?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            const { error } = await supabase
              .from("routes")
              .delete()
              .eq("id", id);

            if (error) throw error;

            setRoutes(routes.filter((route) => route.id !== id));
            Alert.alert("Success", "Route deleted successfully");
          } catch (error) {
            console.error("Error deleting route:", error);
            Alert.alert("Error", "Failed to delete route. Please try again.");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const openEditModal = (id: string, name: string) => {
    setSelectedRouteID(id);
    setSelectedRouteName(name);
    setModalVisible(true);
  };

  const closeEditModal = (shouldRefresh: boolean = false) => {
    setModalVisible(false);
    setSelectedRouteID("");
    setSelectedRouteName("");
    if (shouldRefresh) {
      fetchRoutes();
    }
  };

  const handleUpdateRoute = (newName: string) => {
    const updatedRoutes = routes.map((route) =>
      route.id === selectedRouteID ? { ...route, name: newName } : route
    );
    setRoutes(updatedRoutes);
  };

  const renderRouteItem = ({ item }: { item: RouteWithUser }) => (
    <LinearGradient
      colors={["#dfdfdf", "#e4e4e4"]}
      start={[0, 0]}
      end={[1, 1]}
      style={styles.routeItem}
    >
      <View style={styles.routeInfo}>
        <Text style={styles.routeName}>{item.name}</Text>
        <Text style={styles.routeDetail}>Created by: {item.user.username}</Text>
        <Text style={styles.routeDetail}>Date: {item.created_at}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate("Map", { routeId: item.id })}
        >
          <MaterialIcons name="visibility" size={26} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: "#e0ca00" }]}
          onPress={() => openEditModal(item.id, item.name)}
        >
          <MaterialIcons name="edit" size={26} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: "#dc2626" }]}
          onPress={() => deleteRoute(item.id)}
        >
          <MaterialIcons name="delete" size={26} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search routes or users"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => setSearchQuery("")}
        >
          <MaterialIcons name="clear" size={24} color="#999" />
        </TouchableOpacity>
      </View>
      <FlashList
        estimatedItemSize={100}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        data={filteredRoutes}
        renderItem={renderRouteItem}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <Text style={styles.noDataText}>
            {searchQuery ? "No matching routes found" : "No routes available"}
          </Text>
        }
      />
      <EditRouteModal
        isVisible={modalVisible}
        routeID={selectedRouteID}
        currentName={selectedRouteName}
        onClose={closeEditModal}
        onUpdate={handleUpdateRoute}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  routeItem: {
    borderRadius: 20,
    padding: 20,
    margin: 20,
    marginBottom: 12,
    shadowColor: "#8b8b8b",
    shadowOffset: { width: 14, height: 14 },
    shadowOpacity: 0.5,
    shadowRadius: 29,
    elevation: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // To mimic the inner shadow effect, use two shadow properties
    overflow: "hidden",
  },
  routeInfo: {
    flex: 1,
  },
  routeName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
  },
  routeDetail: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
  },
  iconButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    padding: 8,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  container: {
    flex: 1,
    backgroundColor: "#f9fafb", // Light background
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  noDataText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 24,
  },
  separator: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  input: {
    width: "100%",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  clearButton: {
    padding: 8,
    marginLeft: 8,
  },
});
