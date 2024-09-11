import { createStackNavigator } from "@react-navigation/stack";
import GroupDetailScreen from "../GroupDetailScreen";
import GroupScreen from "../GroupScreen";
import InvitesScreen from "../InvitesScreen";

const Stack = createStackNavigator();

export default function GroupStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="GroupMain"
        component={GroupScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GroupDetail"
        component={GroupDetailScreen}
        options={{ title: "Group Details" }}
      />
      <Stack.Screen
        name="Invites"
        component={InvitesScreen}
        options={{ title: "Group Invites" }}
      />
    </Stack.Navigator>
  );
}
