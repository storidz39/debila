import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  Image,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { AuthStackParamList } from "../navigation/auth-stack";
import { useAuth } from "../store/auth-store";
import { colors, spacing, radius, shadows } from "../theme";

import { useLanguage } from "../store/language-store-fixed";

export function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { login } = useAuth();
  const { t } = useLanguage();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!phone.trim() || !password) {
      Alert.alert("تنبيه", "يرجى إدخال رقم الجوال وكلمة المرور للمتابعة.");
      return;
    }
    const phoneTrimmed = phone.trim();
    const isOnlyDigits = /^\d+$/.test(phoneTrimmed);
    if (isOnlyDigits) {
      const phoneRegex = /^(05|06|07)\d{8}$/;
      if (!phoneRegex.test(phoneTrimmed)) {
        Alert.alert("حدث خطأ", "رقم الهاتف غير صحيح. يجب أن يتكون من 10 أرقام ويبدأ بـ 05، 06، أو 07.");
        return;
      }
    } else if (phoneTrimmed.length < 3) {
      Alert.alert("تنبيه", "اسم المستخدم قصير جداً.");
      return;
    }
    setBusy(true);
    try {
      await login(phone.trim(), password);
    } catch (e) {
      Alert.alert("خطأ في الدخول", e instanceof Error ? e.message : "يرجى التحقق من البيانات والمحاولة مرة أخرى.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.scroll} 
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <View style={styles.topBackground}>
        <View style={styles.logoContainer}>
          <Image 
            source={require("../../assets/images/logo.png")} 
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        </View>
      </View>

      <View style={styles.bottomCard}>
        <Text style={styles.title}>مرحبا بك في بادر</Text>
        <Text style={styles.subtitle}>يرجى إدخال رقم الهاتف وكلمة المرور الخاصة بك</Text>

        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <Ionicons name="call" size={20} color={"#1E293B"} style={styles.inputIconRight} />
              <TextInput
                style={styles.input}
                placeholder="رقم الهاتف"
                placeholderTextColor={colors.muted}
                autoCapitalize="none"
                autoCorrect={false}
                value={phone}
                onChangeText={setPhone}
                textAlign="right"
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={20} color={"#1E293B"} style={styles.inputIconRight} />
              <TextInput
                style={styles.input}
                placeholder="كلمة المرور"
                placeholderTextColor={colors.muted}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                textAlign="right"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.inputIconLeft}>
                <Ionicons name={showPassword ? "eye-outline" : "eye-off"} size={22} color={"#1E293B"} />
              </Pressable>
            </View>
          </View>

          <Pressable 
            style={{ alignSelf: "flex-start", marginBottom: spacing.xl, marginLeft: 10 }}
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={{ color: colors.primary, fontWeight: "600", fontSize: 13, textDecorationLine: "underline" }}>هل نسيت كلمة المرور؟</Text>
          </Pressable>

          <Pressable
            style={[styles.primaryButton, busy && styles.disabled]}
            onPress={handleLogin}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.primaryButtonText}>تسجيل الدخول</Text>
            )}
          </Pressable>

          <Pressable 
            onPress={() => navigation.navigate("Register")} 
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>إنشاء حساب جديد</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { 
    backgroundColor: colors.primary, // Changed to green
    minHeight: "100%",
  },
  topBackground: {
    height: 320, 
    backgroundColor: "#004d26", // Cooler, deeper green
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logoContainer: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.95)", // More transparent
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 40,
    paddingHorizontal: spacing.md, 
    paddingBottom: 60,
    marginTop: -80, // Deeper overlap
    ...shadows.lg,
  },
  title: { 
    fontSize: 26, 
    fontWeight: "900", 
    color: "#6b5e43", // Brownish/gold title color from image
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: { 
    fontSize: 14, 
    color: colors.textSecondary, 
    textAlign: "center",
    fontWeight: "700",
    marginBottom: 40,
  },
  form: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  inputWrapper: {
    marginBottom: spacing.lg,
  },
  inputContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    borderRadius: 30, // Strongly rounded
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: colors.surface,
    height: 55,
    paddingHorizontal: spacing.xl,
  },
  inputIconRight: {
    marginLeft: 12,
  },
  inputIconLeft: {
    marginRight: 10,
    padding: 5,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  primaryButton: {
    height: 55,
    borderRadius: 30,
    backgroundColor: colors.primary, // Changed to green
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  primaryButtonText: { 
    color: colors.white, 
    fontWeight: "600", 
    fontSize: 16 
  },
  disabled: { 
    opacity: 0.6 
  },
  secondaryButton: { 
    height: 55,
    borderRadius: 30,
    backgroundColor: "#f0fdf4", // Very light green tint
    borderWidth: 1,
    borderColor: colors.primary + "30",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: { 
    color: colors.primary, 
    fontWeight: "600", 
    fontSize: 16 
  },
});
