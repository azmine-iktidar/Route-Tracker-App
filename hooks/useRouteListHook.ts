import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { supabase } from "../supabaseClient";
import { RouteWithUser } from "../types";
import { isOnline } from "../utils/netcheck";

export const useRoutes = () => {
  const [routes, setRoutes] = useState<RouteWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRoutes = useCallback(async () => {
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

      // Ensure we're setting a new array of routes, not modifying the existing one
      setRoutes(data || []);
    } catch (error) {
      console.error("Error fetching routes:", error);
      Alert.alert("Error", "Failed to fetch routes. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    console.log("Refreshing routes");
    const onlineStatus = await isOnline();
    if (onlineStatus) {
      setRefreshing(true);
      await fetchRoutes();
      setRefreshing(false);
    } else {
      Alert.alert("No Internet", "You are not connected to the internet.");
    }
    console.log("Refreshed routes");
  }, [fetchRoutes]);

  const handleDeleteRoute = useCallback(
    async (id: string) => {
      setRoutes((prevRoutes) => prevRoutes.filter((route) => route.id !== id));

      try {
        const { error } = await supabase.from("routes").delete().eq("id", id);

        if (error) throw error;

        Alert.alert("Success", "Route deleted successfully");
      } catch (error) {
        console.error("Error deleting route:", error);
        Alert.alert("Error", "Failed to delete route. Please try again.");

        await fetchRoutes();
      }
    },
    [fetchRoutes]
  );

  const handleUpdateRouteName = useCallback(
    async (id: string, newName: string) => {
      try {
        setLoading(true);
        const { error } = await supabase
          .from("routes")
          .update({ name: newName })
          .eq("id", id);

        if (error) throw error;

        // Update the route name in the state
        setRoutes((prevRoutes) =>
          prevRoutes.map((route) =>
            route.id === id ? { ...route, name: newName } : route
          )
        );
      } catch (error) {
        console.error("Error updating route name:", error);
        Alert.alert("Error", "Failed to update route name. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  return {
    routes,
    loading,
    refreshing,
    fetchRoutes,
    handleRefresh,
    handleDeleteRoute,
    handleUpdateRouteName,
  };
};
