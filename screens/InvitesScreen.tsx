import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { GroupInvite } from "../types";
import { supabase } from "../supabaseClient";
import { FlashList } from "@shopify/flash-list";

export default function InvitesScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { invites }: { invites: GroupInvite[] } = route.params;

  const acceptInvite = async (invite: GroupInvite) => {
    try {
      const { error: updateError } = await supabase
        .from("group_invites")
        .update({ inviteStatus: "accepted" })
        .eq("id", invite.id);
      if (updateError) throw updateError;

      const { error: insertError } = await supabase
        .from("group_members")
        .insert({
          groupId: invite.groupId,
          userId: invite.email,
          role: "member",
        });
      if (insertError) throw insertError;

      Alert.alert("Invite Accepted", "You have joined the group.");
      navigation.goBack();
    } catch (error) {
      console.error("Error accepting invite:", error);
      Alert.alert("Error", "Failed to accept invite. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <FlashList
        estimatedItemSize={100}
        data={invites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.inviteItem}>
            <Text style={styles.groupName}>{item.groupId}</Text>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => acceptInvite(item)}
            >
              <Text style={styles.acceptText}>Accept</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  inviteItem: {
    padding: 15,
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 10,
  },
  groupName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  acceptButton: {
    marginTop: 10,
    backgroundColor: "#0066cc",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  acceptText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
});
