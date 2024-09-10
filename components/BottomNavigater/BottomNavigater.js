import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// screens
import UserProfile from "../../screen/UserProfile";
import Home from "../../screen/Home";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import MusicPlayer from "../../screen/MusicPlayer";

const Tab = createBottomTabNavigator();

export default function BottomNavigater() {
  return (
    <Tab.Navigator
      initialRouteName="Feed"
      screenOptions={({ route }) => ({
        tabBarStyle: {
          backgroundColor: "black",
          borderTopWidth: 0,
          position: "absolute",
          elevation: 0, // <-- this is the solution
          height: 37,
        },

        tabBarLabel: () => {
          return null;
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Home") {
            iconName = focused ? "account-music" : "account-music-outline";
          } else if (route.name === "UserProfile") {
            iconName = focused ? "account" : "account-outline";
          } else if (route.name === "MusicPlayer") {
            iconName = focused ? "music-note-sixteenth" : "music-note";
          }
          return (
            <MaterialCommunityIcons name={iconName} size={size} color={color} />
          );
        },
        tabBarActiveTintColor: "#D90026",
        tabBarInactiveTintColor: "white",
      })}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          headerShown: false,
        }}
      />

      <Tab.Screen
        name="MusicPlayer"
        initialParams={{ songTitle: "songTitle" }}
        component={MusicPlayer}
        options={{
          headerShown: false,
        }}
      />

      <Tab.Screen
        name="UserProfile"
        component={UserProfile}
        options={{
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}
