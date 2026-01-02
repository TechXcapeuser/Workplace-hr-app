import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute } from "@react-navigation/native";
import DashboardScreen from "../screens/DashboardScreen";
import AttendanceScreen from "../screens/AttendanceScreen";
import MoreScreen from "../screens/MoreScreen";
import Holidays from "../screens/Holidays";
import LeaveScreen from "../screens/LeaveScreen";
 

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { token, user } = route.params || {};
  
    return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#020B2D",
          height: 60 + insets.bottom, // ✅ MOVE UP
          paddingBottom: insets.bottom, // ✅ SAFE AREA
          borderTopColor: "rgba(255,255,255,0.15)",
        },
        tabBarActiveTintColor: "#1E90FF",
        tabBarInactiveTintColor: "#999",
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Home") iconName = "home-outline";
          if (route.name === "Dashboard") iconName = "grid-outline";
          if (route.name === "Logout") iconName = "log-out-outline";
          if (route.name === "Leave") iconName = "calendar-outline";

          return <Ionicons name={iconName} size={22} color={color} />;
        },
        tabBarLabelStyle: {
          fontSize: 11,
          marginBottom: 4,
        },
      })}
    >
      <Tab.Screen name="Home" initialParams={{ token, user }}  component={DashboardScreen}  />
      <Tab.Screen name="Dashboard" initialParams={{ token, user }}  component={DashboardScreen} options={{ tabBarButton: () => null, }} />
      <Tab.Screen name="AttendanceScreen" initialParams={{ token, user }}  component={AttendanceScreen} options={{ tabBarButton: () => null, }} />
      <Tab.Screen name="Holidays" initialParams={{ token, user }}  component={Holidays} options={{ tabBarButton: () => null, }} />
      <Tab.Screen name="Leave" initialParams={{ token, user }}  component={LeaveScreen} options={{ tabBarButton: () => null, }} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
}
