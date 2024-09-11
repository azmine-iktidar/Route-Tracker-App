import React from "react";
import { Text, StyleSheet } from "react-native";

import RouteItem from "./RouteItem";
import { RouteWithUser } from "../../types";
import { FlashList } from "@shopify/flash-list";

interface RouteListProps {
  routes: RouteWithUser[];
  onViewRoute: (id: string) => void;
  onDeleteRoute: (id: string) => void;
}

const RouteList: React.FC<RouteListProps> = ({
  routes,
  onViewRoute,
  onDeleteRoute,
}) => {
  if (routes.length === 0) {
    return <Text style={styles.noDataText}>No routes available</Text>;
  }

  return (
    <FlashList
      estimatedItemSize={100}
      data={routes}
      renderItem={({ item }) => (
        <RouteItem item={item} onView={onViewRoute} onDelete={onDeleteRoute} />
      )}
      keyExtractor={(item) => item.id.toString()}
    />
  );
};

const styles = StyleSheet.create({
  noDataText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 50,
  },
});

export default RouteList;
