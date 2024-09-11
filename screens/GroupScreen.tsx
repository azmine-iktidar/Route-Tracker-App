import { useState, useEffect } from "react";

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import NetInfo from "@react-native-community/netinfo";
import { Group, User, GroupInvite } from "../types";
import { supabase } from "../supabaseClient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";

export default function GroupScreen() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [invites, setInvites] = useState<GroupInvite[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupHandle, setNewGroupHandle] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? false);
    });

    loadGroups();
    loadCurrentUser();
    loadInvites();

    return () => {
      unsubscribe();
    };
  }, [isOnline]);

  const loadGroups = async () => {
    console.log("Loading groups...");
    try {
      if (isOnline) {
        const { data, error } = await supabase.from("groups").select("*");
        if (error) throw error;
        setGroups(data || []);
        await AsyncStorage.setItem("cachedGroups", JSON.stringify(data));
      } else {
        const cachedGroups = await AsyncStorage.getItem("cachedGroups");
        if (cachedGroups) {
          setGroups(JSON.parse(cachedGroups));
        }
      }
    } catch (error) {
      console.error("Error loading groups:", error);
    }
    console.log("Groups loaded:", groups);
  };

  const loadCurrentUser = async () => {
    try {
      const userString = await AsyncStorage.getItem("user");
      if (userString) {
        setCurrentUser(JSON.parse(userString));
      }
    } catch (error) {
      console.error("Error loading current user:", error);
    }
  };

  const loadInvites = async () => {
    if (currentUser && isOnline) {
      try {
        const { data, error } = await supabase
          .from("group_invites")
          .select("*")
          .eq("email", currentUser.email)
          .eq("invite_status", "pending");
        if (error) throw error;
        setInvites(data || []);
      } catch (error) {
        console.error("Error loading invites:", error);
      }
    }
  };

  const searchGroups = async () => {
    try {
      if (isOnline) {
        const { data, error } = await supabase
          .from("groups")
          .select("*")
          .ilike("name", `%${searchQuery}%`);
        if (error) throw error;
        setGroups(data || []);
      } else {
        const cachedGroups = await AsyncStorage.getItem("cachedGroups");
        if (cachedGroups) {
          const allGroups = JSON.parse(cachedGroups);
          const filteredGroups = allGroups.filter((group: Group) =>
            group.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setGroups(filteredGroups);
        }
      }
    } catch (error) {
      console.error("Error searching groups:", error);
    }
  };

  const createGroup = async () => {
    if (!currentUser) return;

    try {
      if (isOnline) {
        // Create the group
        const { data: groupData, error: groupError } = await supabase
          .from("groups")
          .insert({
            name: newGroupName,
            handle: newGroupHandle,
            created_by: currentUser.id,
          })
          .select();

        if (groupError) throw groupError;

        if (groupData && groupData[0]) {
          // Add the creator as an admin member
          const { error: memberError } = await supabase
            .from("group_members")
            .insert({
              group_id: groupData[0].id,
              user_id: currentUser.id,
              role: "admin",
            });

          if (memberError) throw memberError;

          setGroups([...groups, groupData[0]]);
          const cachedGroups = await AsyncStorage.getItem("cachedGroups");
          if (cachedGroups) {
            const updatedGroups = [...JSON.parse(cachedGroups), groupData[0]];
            await AsyncStorage.setItem(
              "cachedGroups",
              JSON.stringify(updatedGroups)
            );
          }
        }
      } else {
        Alert.alert("Error", "Cannot create group while offline");
        return;
      }

      setIsCreateModalVisible(false);
      setNewGroupName("");
      setNewGroupHandle("");
    } catch (error) {
      console.error("Error creating group:", error);
      Alert.alert("Error", "Failed to create group. Please try again.");
    }
  };

  const viewInvites = () => {
    navigation.navigate("Invites", { invites });
  };

  const joinGroupRequest = async (group: Group) => {
    if (!currentUser || !isOnline) return;

    Alert.alert(
      "Join Group",
      `Send a join request to the group ${group.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send Request",
          onPress: async () => {
            try {
              const { error } = await supabase.from("group_invites").insert({
                group_id: group.id,
                email: currentUser.email,
                invited_by: group.created_by,
                invite_status: "pending",
              });
              if (error) throw error;
              Alert.alert("Request Sent", "Your request has been sent.");
            } catch (error) {
              console.error("Error sending join request:", error);
              Alert.alert(
                "Error",
                "Failed to send join request. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const renderGroupItem = ({ item }: { item: Group }) => {
    const isCreator = currentUser && item.created_by === currentUser.id;

    return (
      <TouchableOpacity
        style={styles.groupItem}
        onPress={() => navigation.navigate("GroupDetail", { group: item })}
      >
        <Text style={styles.groupName}>{item.name}</Text>
        <Text>Handle: {item.handle}</Text>
        <Text>Created: {new Date(item.created_at).toLocaleDateString()}</Text>
        {isCreator ? (
          <TouchableOpacity
            style={[styles.button, styles.viewButton]}
            onPress={() => navigation.navigate("GroupDetail", { group: item })}
          >
            <Text style={styles.buttonText}>View Group</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.joinButton]}
            onPress={() => joinGroupRequest(item)}
          >
            <Text style={styles.buttonText}>Join Group</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchBar}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search Groups"
          placeholderTextColor="#888"
          onSubmitEditing={searchGroups}
        />
      </View>

      <FlashList
        estimatedItemSize={100}
        onRefresh={() => {
          loadGroups();
        }}
        refreshing={false}
        data={groups}
        renderItem={renderGroupItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.noGroupsText}>No groups found.</Text>
        }
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={isCreateModalVisible}
        onRequestClose={() => setIsCreateModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                marginBottom: 10,
                color: "#0c0c0c",
                textAlign: "center",
              }}
            >
              Create Group
            </Text>
            <TextInput
              style={styles.input}
              value={newGroupName}
              onChangeText={setNewGroupName}
              placeholder="Group Name"
            />
            <TextInput
              style={styles.input}
              value={newGroupHandle}
              onChangeText={(e) => setNewGroupHandle(e.trim())}
              placeholder="@NewGroupName"
            />
            <Text
              style={{
                fontSize: 10,
                color: "#888",
                textAlign: "center",
                marginBottom: 10,
              }}
            >
              when using group handle no spaces are allowed
            </Text>
            <TouchableOpacity style={styles.createButton} onPress={createGroup}>
              <Text style={styles.createButtonText}>Create</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsCreateModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <TouchableOpacity style={styles.inviteButton} onPress={viewInvites}>
        <View
          style={{
            position: "relative",
          }}
        >
          <MaterialCommunityIcons name="email" size={24} color="#ffffff" />
          {invites.length > 0 && (
            <Text style={styles.inviteButtonText}>{invites.length}</Text>
          )}
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.createButtonIcon}
        onPress={() => setIsCreateModalVisible(true)}
      >
        <MaterialCommunityIcons name="plus-circle" size={33} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#F9FAFB",
  },
  searchBar: {
    height: 45,
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    fontSize: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: "100%",
  },
  groupItem: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    marginVertical: 10,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  groupName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  groupInfo: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  noGroupsText: {
    textAlign: "center",
    color: "#9CA3AF",
    marginTop: 20,
    fontSize: 16,
  },
  inviteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563EB",
    padding: 15,
    borderRadius: 50,
    position: "absolute",
    bottom: 20,
    right: 20,
    elevation: 5,
  },
  inviteButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    position: "absolute",
    top: -18,
    textAlign: "center",
    right: -18,
    backgroundColor: "#001aff",
    borderRadius: 999,
    aspectRatio: 1,
    width: 24,
  },
  createButton: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
    backgroundColor: "#10B981",
  },
  createButtonIcon: {
    borderRadius: 999,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
    backgroundColor: "#10B981",
    position: "absolute",
    bottom: 90,
    right: 20,
    width: 50,
    aspectRatio: 1,
    textAlign: "center",
    textAlignVertical: "center",
    justifyContent: "center",
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    padding: 25,
    borderRadius: 15,
    width: "85%",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    padding: 12,
    marginBottom: 15,
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: "#F3F4F6",
  },
  cancelButton: {
    backgroundColor: "#EF4444",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  cancelButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  button: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  joinButton: {
    backgroundColor: "#3B82F6",
  },
  viewButton: {
    backgroundColor: "#10B981",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  header: {
    display: "flex",
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "space-between",
  },
});
