import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
} from "react-native";

import { supabase } from "../supabaseClient";
import { RouteWithUser } from "../types";
import { MaterialIcons } from "@expo/vector-icons";
import { isOnline } from "../utils/netcheck";
import { FlashList } from "@shopify/flash-list";

export default function RouteListScreen({ navigation }: { navigation: any }) {
  const [routes, setRoutes] = useState<RouteWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRoutes();
  }, []);
  const handleRefresh = useCallback(async () => {
    console.log("Refreshing routes");
    const onlineStatus = await isOnline();
    if (onlineStatus) {
      setRefreshing(true);
      fetchRoutes().finally(() => setRefreshing(false));
    } else {
      Alert.alert("No Internet", "You are not connected to the internet.");
    }
    console.log("Refreshed routes");
  }, []);
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
      console.log("Routes loaded", routes);
    } finally {
      setLoading(false);
    }
  };

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

  const renderRouteItem = ({ item }: { item: RouteWithUser }) => (
    <View style={styles.routeItem}>
      <View style={styles.routeInfo}>
        <Text style={styles.routeName}>{item.name}</Text>
        <Text style={styles.routeDetail}>Created by: {item.user.username}</Text>
        <Text style={styles.routeDetail}>
          Date: {new Date(item.created_at).toUTCString()}
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            console.log("Navigating to Map using routeId:", item.id);
            navigation.navigate("Map", { routeId: item.id });
          }}
        >
          <MaterialIcons name="visibility" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => deleteRoute(item.id)}
        >
          <MaterialIcons name="delete" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
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
      <FlashList
        estimatedItemSize={100}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        data={routes}
        renderItem={renderRouteItem}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <Text style={styles.noDataText}>No routes available</Text>
        }
      />
    </View>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  routeItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  routeInfo: {
    marginBottom: 12,
  },
  routeName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  routeDetail: {
    fontSize: 14,
    color: "#4A4A4A",
    marginBottom: 2,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  iconButton: {
    backgroundColor: "#007bff",
    borderRadius: 50,
    padding: 8,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    fontSize: 16,
    color: "#4A4A4A",
    textAlign: "center",
    marginTop: 24,
  },
  listHeader: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  separator: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 8,
  },
});
