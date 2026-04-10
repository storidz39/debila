import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  AdminScreen,
  HomeScreen,
  WebDashboardScreen,
  MapScreen,
  NotificationsScreen,
  ProfileScreen,
  ReportScreen,
  TrackingScreen,
  AddDepartmentScreen,
  ComplaintDetailScreen,
  SettingsScreen,
  StatsScreen,
  AlertsScreen,
  MailboxScreen,
} from "../screens";
import { useAuth } from "../store/auth-store";
import { colors, shadows } from "../theme";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function isStaffRole(role: string | undefined) {
  return role === "department" || role === "admin";
}

export function AppNavigator() {
  const { user } = useAuth();
  const showAdmin = isStaffRole(user?.role);
  const isCitizen = user?.role === "citizen";
  const isAdmin = user?.role === "admin";

  // For Web, we use a different structure entirely to support the sidebar
  if (Platform.OS === "web") {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false, animation: "none" }}>
        <Stack.Screen name="Home" component={WebDashboardScreen} />
        <Stack.Screen name="Report" component={ReportScreen} />
        <Stack.Screen name="Tracking" component={TrackingScreen} />
        {(isCitizen || isAdmin) && <Stack.Screen name="Map" component={MapScreen} />}
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        {showAdmin && <Stack.Screen name="Admin" component={AdminScreen} />}
        {showAdmin && <Stack.Screen name="AdminNew" component={AdminScreen} initialParams={{ filter: 'new' }} />}
        {showAdmin && <Stack.Screen name="AdminResolved" component={AdminScreen} initialParams={{ filter: 'resolved' }} />}
        {showAdmin && <Stack.Screen name="Mailbox" component={MailboxScreen} />}
        {showAdmin && <Stack.Screen name="Alerts" component={AlertsScreen} />}
        {isAdmin && <Stack.Screen name="Stats" component={StatsScreen} />}
        {isAdmin && <Stack.Screen name="AddDepartment" component={AddDepartmentScreen} />}
        <Stack.Screen name="ComplaintDetail" component={ComplaintDetailScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Tab.Navigator
      initialRouteName={showAdmin ? "Admin" : "Home"}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: "#94A3B8",
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
          height: 65,
          paddingBottom: 10,
          paddingTop: 8,
          ...shadows.md,
        },
        tabBarLabelStyle: { 
          fontSize: 11, 
          fontWeight: "700",
          marginTop: -4,
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: any;
          if (route.name === "Home") iconName = focused ? "home" : "home-outline";
          else if (route.name === "Report") iconName = focused ? "add-circle" : "add-circle-outline";
          else if (route.name === "Map") iconName = focused ? "map" : "map-outline";
          else if (route.name === "Tracking") iconName = focused ? "list" : "list-outline";
          else if (route.name === "Notifications") iconName = focused ? "notifications" : "notifications-outline";
          else if (route.name === "Admin") iconName = focused ? "shield-checkmark" : "shield-checkmark-outline";
          else if (route.name === "Profile") iconName = focused ? "person" : "person-outline";
          
          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      {!showAdmin && <Tab.Screen name="Home" component={HomeScreen} options={{ title: "الرئيسية" }} />}
      {isCitizen && <Tab.Screen name="Report" component={ReportScreen} options={{ title: "إبلاغ" }} />}
      {(isCitizen || isAdmin) && <Tab.Screen name="Map" component={MapScreen} options={{ title: "الخريطة" }} />}
      {isCitizen && <Tab.Screen name="Tracking" component={TrackingScreen} options={{ title: "بلاغاتي" }} />}
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: "الإشعارات" }}
      />
      {showAdmin && (
        <Tab.Screen name="Admin" component={AdminScreen} options={{ title: "الطلبات الواردة" }} />
      )}
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "حسابي" }} />
    </Tab.Navigator>
  );
}
