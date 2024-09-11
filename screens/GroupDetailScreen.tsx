import { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";
import { Group, User } from "../types";
import { supabase } from "../supabaseClient";
import { FlashList } from "@shopify/flash-list";

export default function GroupDetailScreen() {
  const route = useRoute();
  const { group }: { group: Group } = route.params;
  const [members, setMembers] = useState<User[]>([]);

  useEffect(() => {
    loadGroupMembers();
  }, []);

  const loadGroupMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("group_members")
        .select("users(*)")
        .eq("groupId", group.id);
      if (error) throw error;
      setMembers(data?.map((item) => item.users) || []);
    } catch (error) {
      console.error("Error loading group members:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.groupName}>{group.name}</Text>
      <Text>Handle: {group.handle}</Text>
      <Text>Members:</Text>
      <FlashList
        estimatedItemSize={100}
        data={members}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={styles.memberName}>{item.username}</Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f0f0f0",
  },
  groupName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  memberName: {
    fontSize: 18,
    paddingVertical: 5,
  },
});
