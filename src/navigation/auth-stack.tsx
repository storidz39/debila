import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { ForgotPasswordScreen } from "../screens/ForgotPasswordScreen";

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitleAlign: "center",
        headerTitleStyle: { fontWeight: "700" },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: "تسجيل الدخول" }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "إنشاء حساب" }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: "استعادة الوصول" }} />
    </Stack.Navigator>
  );
}
