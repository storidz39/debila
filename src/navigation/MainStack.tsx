import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ComplaintDetailScreen } from "../screens/ComplaintDetailScreen";
import { AddDepartmentScreen } from "../screens/AddDepartmentScreen";
import { SettingsScreens } from "../screens/SettingsScreens";
import { colors } from "../theme";
import { AppNavigator } from "./AppNavigator";
import type { MainStackParamList } from "./types";

const Stack = createNativeStackNavigator<MainStackParamList>();

export function MainStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { fontWeight: "700" },
        headerTintColor: colors.textPrimary,
        headerTitleAlign: "center",
      }}
    >
      <Stack.Screen name="MainTabs" component={AppNavigator} options={{ headerShown: false }} />
      <Stack.Screen
        name="ComplaintDetail"
        component={ComplaintDetailScreen}
        options={{ title: "تفاصيل البلاغ" }}
      />
      <Stack.Screen
        name="AddDepartment"
        component={AddDepartmentScreen}
        options={{ title: "إضافة مصلحة" }}
      />
      <Stack.Screen name="SecuritySettings" component={SettingsScreens.SecuritySettings} options={{ title: "الأمان وكلمة المرور" }} />
      <Stack.Screen name="EditProfileSettings" component={SettingsScreens.EditProfileSettings} options={{ title: "تحديث البيانات الشخصية" }} />
      <Stack.Screen name="LanguageSettings" component={SettingsScreens.LanguageSettings} options={{ title: "لغة التطبيق" }} />
      <Stack.Screen name="PrivacySettings" component={SettingsScreens.PrivacySettings} options={{ title: "سياسة الخصوصية" }} />
      <Stack.Screen name="AboutPlatform" component={SettingsScreens.AboutPlatform} options={{ title: "حول المنصة" }} />
    </Stack.Navigator>
  );
}
