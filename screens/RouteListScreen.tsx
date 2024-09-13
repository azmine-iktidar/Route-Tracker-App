import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../supabaseClient";
import { RouteWithUser } from "../types";
import { MaterialIcons } from "@expo/vector-icons";
import { isOnline } from "../utils/netcheck";
import { FlashList } from "@shopify/flash-list";
import EditRouteModal from "@/components/EditRouteModal";
import { useUserStore } from "../contexts/userStore";
import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

const ROUTES_STORAGE_KEY = "offlineRoutes";

type RootStackParamList = {
  RouteList: { refresh?: boolean };
  Map: { routeId: string };
};

type Props = {
  route: RouteProp<RootStackParamList, "RouteList">;
  navigation: NativeStackNavigationProp<RootStackParamList, "RouteList">;
};

const RouteList: React.FC<Props> = ({ route, navigation }) => {
  const [routes, setRoutes] = useState<RouteWithUser[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<RouteWithUser[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRouteID, setSelectedRouteID] = useState<string>("");
  const [selectedRouteName, setSelectedRouteName] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { refresh } = route.params || {};
  const user = useUserStore((state) => state.user);

  const fetchRoutes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("routes")
        .select(
          `
          id,
          name,
          created_by,
          created_at,
          updated_at,
          user:users!routes_created_by_fkey (
            id,
            username,
            email
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      const fetchedRoutes = (data as unknown as RouteWithUser[]) || [];
      setRoutes(fetchedRoutes);

      // Update AsyncStorage with fetched routes
      await AsyncStorage.setItem(
        ROUTES_STORAGE_KEY,
        JSON.stringify(fetchedRoutes)
      );
    } catch (error) {
      console.error("Error fetching routes:", error);
      Alert.alert("Error", "Failed to fetch routes. Please try again.");

      // If fetch fails, try to load from AsyncStorage
      const storedRoutes = await AsyncStorage.getItem(ROUTES_STORAGE_KEY);
      if (storedRoutes) {
        setRoutes(JSON.parse(storedRoutes));
      }
    }
  }, []);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  useEffect(() => {
    if (refresh) {
      handleRefresh();
    }
  }, [refresh]);

  useEffect(() => {
    filterRoutes();
  }, [routes, searchQuery]);

  const filterRoutes = useCallback(() => {
    const filtered = routes.filter(
      (route) =>
        route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (route.user?.username
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ??
          false)
    );
    setFilteredRoutes(filtered);
  }, [routes, searchQuery]);

  const handleRefresh = useCallback(async () => {
    const onlineStatus = await isOnline();
    if (onlineStatus) {
      setRefreshing(true);
      await fetchRoutes();
      setRefreshing(false);
    } else {
      Alert.alert("No Internet", "You are not connected to the internet.");
    }
  }, [fetchRoutes]);

  const deleteRoute = useCallback(
    (id: string) => {
      Alert.alert(
        "Delete Route",
        "Are you sure you want to delete this route?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                // Delete from database
                const { error } = await supabase
                  .from("routes")
                  .delete()
                  .eq("id", id);
                if (error) throw error;

                // Update state
                const updatedRoutes = routes.filter((route) => route.id !== id);
                setRoutes(updatedRoutes);

                // Update AsyncStorage
                await AsyncStorage.setItem(
                  ROUTES_STORAGE_KEY,
                  JSON.stringify(updatedRoutes)
                );
              } catch (error) {
                console.error("Error deleting route:", error);
                Alert.alert(
                  "Error",
                  "Failed to delete route. Please try again."
                );
              }
            },
          },
        ]
      );
    },
    [routes]
  );

  const openEditModal = useCallback((id: string, name: string) => {
    setSelectedRouteID(id);
    setSelectedRouteName(name);
    setModalVisible(true);
  }, []);

  const closeEditModal = useCallback(() => {
    setModalVisible(false);
    setSelectedRouteID("");
    setSelectedRouteName("");
  }, []);

  const handleUpdateRoute = useCallback(
    async (newName: string) => {
      try {
        // Update in database
        const { error } = await supabase
          .from("routes")
          .update({ name: newName })
          .eq("id", selectedRouteID);
        if (error) throw error;

        // Update state
        const updatedRoutes = routes.map((route) =>
          route.id === selectedRouteID ? { ...route, name: newName } : route
        );
        setRoutes(updatedRoutes);

        // Update AsyncStorage
        await AsyncStorage.setItem(
          ROUTES_STORAGE_KEY,
          JSON.stringify(updatedRoutes)
        );

        closeEditModal();
      } catch (error) {
        console.error("Error updating route:", error);
        Alert.alert("Error", "Failed to update route. Please try again.");
      }
    },
    [selectedRouteID, routes, closeEditModal]
  );
  const formatDate = (dateString: string) => {
    if (!dateString) return "Invalid Date";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    const bdTime = new Date(date.getTime() + 6 * 60 * 60 * 1000);
    const hours = bdTime.getUTCHours().toString().padStart(2, "0");
    const day = bdTime.getUTCDate().toString().padStart(2, "0");
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = months[bdTime.getUTCMonth()];
    const year = bdTime.getUTCFullYear();

    return `${hours}00 hr ${day} ${month} ${year}`;
  };
  const renderRouteItem = ({
    item,
  }: {
    item: RouteWithUser;
    index: number;
    separators: { highlight: boolean };
  }) => (
    <LinearGradient
      colors={["#f0f9ff", "#e0f2fe"]}
      start={[0, 0]}
      end={[1, 1]}
      style={styles.routeItem}
    >
      <View style={styles.routeInfo}>
        <Text style={styles.routeName}>{item.name}</Text>
        <Text style={styles.routeDetail}>
          Created by: {item.user?.username ?? "Unknown"}
        </Text>
        <Text style={styles.routeDetail}>
          Date: {formatDate(item.created_at)}
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.iconButton, styles.viewButton]}
          onPress={() => navigation.navigate("Map", { routeId: item.id })}
        >
          <MaterialIcons name="visibility" size={22} color="#ffffff" />
        </TouchableOpacity>

        {
          // @ts-ignore
          user && item.created_by === user.id && (
            <>
              <TouchableOpacity
                style={[styles.iconButton, styles.editButton]}
                onPress={() => openEditModal(item.id, item.name)}
              >
                <MaterialIcons name="edit" size={22} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconButton, styles.deleteButton]}
                onPress={() => deleteRoute(item.id)}
              >
                <MaterialIcons name="delete" size={22} color="#ffffff" />
              </TouchableOpacity>
            </>
          )
        }
      </View>
    </LinearGradient>
  );

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
          <MaterialIcons name="clear" size={22} color="#999" />
        </TouchableOpacity>
      </View>
      <FlashList
        estimatedItemSize={100}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        data={filteredRoutes}
        // @ts-ignore
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: "#f1f5f9",
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#1e293b",
  },
  clearButton: {
    padding: 8,
    marginLeft: 8,
  },
  routeItem: {
    borderRadius: 16,
    padding: 16,
    margin: 16,
    marginBottom: 8,
    shadowColor: "#64748b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  routeInfo: {
    flex: 1,
  },
  routeName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 4,
  },
  routeDetail: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 2,
  },
  buttonContainer: {
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    borderRadius: 12,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  viewButton: {
    backgroundColor: "#3b82f6",
  },
  editButton: {
    backgroundColor: "#eab308",
  },
  deleteButton: {
    backgroundColor: "#ef4444",
  },
  separator: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginHorizontal: 16,
  },
  noDataText: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginTop: 24,
    fontStyle: "italic",
  },
});

export default RouteList;
