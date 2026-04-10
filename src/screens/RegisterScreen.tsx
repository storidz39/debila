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
import { useAuth } from "../store/auth-store";
import { colors, spacing, radius, shadows } from "../theme";

export function RegisterScreen() {
  const navigation = useNavigation();
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!fullName.trim() || !username.trim() || !phone.trim() || password.length < 6) {
      Alert.alert("تنبيه", "يرجى إكمال جميع البيانات الأساسية واختيار كلمة مرور قوية (6 رموز على الأقل)");
      return;
    }
    const phoneRegex = /^(05|06|07)\d{8}$/;
    if (!phoneRegex.test(phone.trim())) {
      Alert.alert("حدث خطأ", "رقم الهاتف غير صحيح. يجب أن يتكون من 10 أرقام ويبدأ بـ 05، 06، أو 07.");
      return;
    }
    setErrorText(null);
    setBusy(true);
    try {
      await register(phone.trim(), password, fullName.trim(), username.trim(), email.trim());
      Alert.alert("نجاح", "تم إنشاء حسابك بنجاح! يتم الآن توجيهك للمنصة.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "فشل إنشاء الحساب الجديد. يرجى التأكد من توفر الجداول في Supabase.";
      setErrorText(msg);
      Alert.alert("خطأ في التسجيل", msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.scroll} 
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { alignItems: "center" }]}>
        <Pressable onPress={() => navigation.goBack()} style={{ alignSelf: "flex-end", padding: 8 }}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </Pressable>
        <View style={styles.logoContainer}>
          <Image 
            source={require("../../assets/images/logo.png")} 
            style={{ width: 80, height: 80, borderRadius: radius.lg }}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>إنشاء حساب المواطن</Text>
        <Text style={styles.subtitle}>بوابة المواطن الرقمية الموحدة</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>الاسم الكامل (كما في الهوية الوطنية)</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={18} color={fullName.length > 3 ? colors.primary : colors.muted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="مثال: محمد بن علي"
              placeholderTextColor={colors.muted}
              value={fullName}
              onChangeText={setFullName}
              textAlign="right"
            />
          </View>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>اسم المستخدم (بالأحرف اللاتينية)</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="at" size={18} color={username.length > 2 ? colors.primary : colors.muted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="username_example"
              placeholderTextColor={colors.muted}
              value={username}
              autoCapitalize="none"
              onChangeText={setUsername}
              textAlign="right"
            />
          </View>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>رقم الجوال (للتواصل وتتبع البلاغات)</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={18} color={phone.length === 10 ? colors.primary : colors.muted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="05XXXXXXXX / 06XXXXXXXX"
              placeholderTextColor={colors.muted}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={10}
              textAlign="right"
            />
          </View>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>كلمة المرور</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={18} color={password.length >= 6 ? colors.primary : colors.muted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="اختر كلمة مرور قوية"
              placeholderTextColor={colors.muted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              textAlign="right"
            />
          </View>
        </View>

        {errorText && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={18} color={colors.danger} />
            <Text style={styles.errorText}>{errorText}</Text>
          </View>
        )}

        <View style={{ marginTop: spacing.lg }}>
          <Pressable
            style={({ pressed }: any) => [
              styles.primaryButton, 
              (busy || !fullName || !phone || !password) && styles.disabled,
              pressed && { opacity: 0.8 }
            ]}
            onPress={handleRegister}
            disabled={busy || !fullName || !phone || !password}
          >
            {busy ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.primaryButtonText}>إنشاء الحساب والبدء</Text>
            )}
          </Pressable>
        </View>

        <Pressable onPress={() => navigation.goBack()} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>
            لديك حساب بالفعل؟ <Text style={{ color: colors.primary, fontWeight: "800" }}>تسجيل الدخول</Text>
          </Text>
        </Pressable>
      </View>

      <View style={{ marginTop: spacing.xl, padding: spacing.md, backgroundColor: "#F8FAFC", borderRadius: radius.md, borderWidth: 1, borderColor: colors.border }}>
        <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Ionicons name="information-circle" size={18} color={colors.muted} />
          <Text style={{ fontWeight: "700", color: colors.textPrimary, fontSize: 13 }}>لماذا التسجيل؟</Text>
        </View>
        <Text style={{ fontSize: 12, color: colors.textSecondary, textAlign: "right", lineHeight: 18 }}>
          يسمح لك الحساب بمتابعة حالة بلاغاتك بدقة، واستلام الإشعارات عند التحديث، والتواصل المباشر مع الجهات المعنية.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { 
    padding: spacing.lg, 
    paddingTop: 40,
    backgroundColor: colors.background,
    minHeight: "100%",
  },
  header: {
    marginBottom: spacing.xl,
    alignItems: "center",
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { 
    fontSize: 20, 
    fontWeight: "900", 
    color: colors.primary, 
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: { 
    fontSize: 16, 
    color: colors.accent, 
    textAlign: "center",
    fontWeight: "700",
  },
  form: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.lg,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.6)",
  },
  inputWrapper: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 6,
    textAlign: "right",
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
  },
  inputIcon: {
    marginLeft: 10,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "500",
  },
  primaryButton: {
    height: 54,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.md,
  },
  primaryButtonText: { 
    color: colors.white, 
    fontWeight: "800", 
    fontSize: 16 
  },
  disabled: { 
    opacity: 0.6 
  },
  secondaryButton: { 
    padding: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  secondaryButtonText: { 
    color: colors.textSecondary, 
    fontWeight: "600", 
    fontSize: 14 
  },
  errorContainer: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    padding: 12,
    borderRadius: radius.md,
    marginTop: spacing.md,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  errorText: {
    color: "#991b1b",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "right",
    flex: 1,
  },
});
