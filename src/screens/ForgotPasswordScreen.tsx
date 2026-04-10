import { useNavigation } from "@react-navigation/native";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, shadows } from "../theme";
import type { AuthStackParamList } from "../navigation/auth-stack";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

export function ForgotPasswordScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(1); // 1: phone, 2: success message

  const handleReset = async () => {
    if (!phone.trim()) {
      Alert.alert("تنبيه", "يرجى إدخال رقم الهاتف المسجل.");
      return;
    }
    
    setBusy(true);
    try {
      // simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStep(2);
    } catch (e) {
      Alert.alert("خطأ", "فشل طلب استعادة كلمة المرور. حاول مجدداً.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-forward" size={24} color={colors.primary} />
        </Pressable>
        <Text style={styles.title}>استعادة كلمة المرور</Text>
      </View>

      <View style={styles.card}>
        {step === 1 ? (
          <>
            <View style={styles.iconCircle}>
              <Ionicons name="lock-closed" size={40} color={colors.primary} />
            </View>
            <Text style={styles.instruction}>
              يرجى إدخال رقم الهاتف المرتبط بحسابك. سنقوم بإرسال تعليمات استعادة الوصول عبر الرسائل القصيرة.
            </Text>
            
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color={colors.muted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="رقم الهاتف"
                placeholderTextColor={colors.muted}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                textAlign="right"
              />
            </View>

            <Pressable
              style={[styles.primaryButton, busy && styles.disabled]}
              onPress={handleReset}
              disabled={busy}
            >
              {busy ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.primaryButtonText}>إرسال طلب الاستعادة</Text>
              )}
            </Pressable>
          </>
        ) : (
          <View style={styles.successView}>
            <Ionicons name="checkmark-circle" size={60} color={colors.primary} />
            <Text style={styles.successTitle}>تم إرسال الطلب</Text>
            <Text style={styles.successText}>
              إذا كان رقم الهاتف مسجلاً لدينا، ستتلقى رسالة قصيرة تحتوي على رمز التحقق خلال دقائق.
            </Text>
            <Pressable style={styles.primaryButton} onPress={() => navigation.navigate("Login")}>
              <Text style={styles.primaryButtonText}>العودة لتسجيل الدخول</Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { 
    padding: spacing.xl, 
    flexGrow: 1, 
    backgroundColor: colors.background,
    justifyContent: "center",
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: spacing.xl,
    gap: 12,
  },
  backBtn: {
    padding: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.primary,
    flex: 1,
    textAlign: "right",
  },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: radius.lg,
    ...shadows.md,
    alignItems: "center",
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  instruction: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.xl,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    height: 52,
    paddingHorizontal: spacing.md,
    width: "100%",
    marginBottom: spacing.xl,
  },
  inputIcon: {
    marginLeft: 10,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  primaryButton: {
    height: 54,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    ...shadows.md,
  },
  primaryButtonText: { 
    color: colors.white, 
    fontWeight: "800", 
    fontSize: 16 
  },
  disabled: { opacity: 0.6 },
  successView: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.primary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  successText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.xl,
  }
});
