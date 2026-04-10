import { useNavigation, useRoute } from "@react-navigation/native";
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
import { colors, spacing, radius, shadows } from "../theme";
import * as ImagePicker from "expo-image-picker";
import { getDepartmentsFromApi, updateDepartmentApi, deleteDepartmentApi } from "../services/api";
import { registerRequest } from "../services/auth-api";
import { useEffect } from "react";

export function AddDepartmentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const departmentId = (route.params as any)?.departmentId;
  const isEditing = Boolean(departmentId);

  const [deptName, setDeptName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isEditing) {
      getDepartmentsFromApi().then(deps => {
        const d = deps.find(x => x.id === departmentId);
        if (d) {
          setDeptName(d.name);
          setUsername(d.username);
          setPassword(""); // Don't show password for security
          setLogoUri(null); // Logo handling can be improved with URL
          setCoverUri(d.cover_uri || null);
        }
      });
    }
  }, [departmentId, isEditing]);

  const handlePickLogo = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("عذراً", "نحتاج إلى صلاحية الوصول للصور لإضافة شعار المصلحة.");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!pickerResult.canceled && pickerResult.assets.length > 0) {
      setLogoUri(pickerResult.assets[0].uri);
    }
  };

  const handlePickCover = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("عذراً", "نحتاج إلى صلاحية الوصول للصور لإضافة خلفية المصلحة.");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!pickerResult.canceled && pickerResult.assets.length > 0) {
      setCoverUri(pickerResult.assets[0].uri);
    }
  };

  const handleCreate = async () => {
    if (!deptName.trim() || !username.trim() || (!isEditing && password.length < 6)) {
      if (Platform.OS === 'web') window.alert("تنبيه: يرجى ملء كافة البيانات الرئيسية، ويجب أن تكون كلمة المرور 6 رموز على الأقل.");
      else Alert.alert("تنبيه", "يرجى ملء كافة البيانات الرئيسية، ويجب أن تكون كلمة المرور 6 رموز على الأقل.");
      return;
    }

    setBusy(true);
    try {
      if (isEditing) {
        await updateDepartmentApi(departmentId, {
          name: deptName.trim(),
          username: username.trim(),
          password: password.trim() || undefined,
          organization: deptName.trim(),
          cover_uri: coverUri || "",
        });
        if (Platform.OS === "web") window.alert("تم التعديل بنجاح.");
        else Alert.alert("نجاح", "تم التعديل بنجاح.");
      } else {
        await registerRequest(
          username.trim(), // Using username as id/login
          password.trim(),
          deptName.trim(),
          username.trim(),
          "", // email
          "department",
          deptName.trim(),
          coverUri || ""
        );
        if (Platform.OS === "web") window.alert("تم إضافة المصلحة بنجاح.");
        else Alert.alert("نجاح", "تم إضافة المصلحة بنجاح.");
      }
      navigation.goBack();
    } catch (e: any) {
      if (Platform.OS === "web") window.alert(e.message || "خطأ في الحفظ.");
      else Alert.alert("خطأ", e.message || "فشل في الحفظ.");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (Platform.OS === "web") {
      const confirm = window.confirm("هل أنت متأكد من مسح المصلحة كلياً؟");
      if (!confirm) return;
      await deleteDepartmentApi(departmentId);
      navigation.goBack();
      return;
    }

    Alert.alert("تأكيد الحذف", "هل أنت متأكد من مسح المصلحة كلياً؟", [
      { text: "إلغاء", style: "cancel" },
      { text: "نعم، احذف", style: "destructive", onPress: async () => {
        await deleteDepartmentApi(departmentId);
        navigation.goBack();
      }}
    ]);
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.scroll} 
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={{ alignSelf: "flex-end", padding: 8 }}>
          <Ionicons name="arrow-back-outline" size={24} color={colors.primary} />
        </Pressable>
        <Text style={styles.title}>{isEditing ? "تعديل بيانات المصلحة" : "إضافة مصلحة حكومية"}</Text>
        <Text style={styles.subtitle}>
          {isEditing ? "تحديث بيانات وصلاحيات دخول الهيئة" : "إعداد حساب جديد لهيئة أو إدارة للإشراف على البلاغات الخاصة بها"}
        </Text>
      </View>

      <View style={styles.formContainer}>
        {/* Logo Picker */}
        <View style={styles.logoSection}>
          <Text style={styles.label}>شعار المصلحة (Logo)</Text>
          <Pressable style={styles.logoPicker} onPress={handlePickLogo}>
            {logoUri ? (
              <Image source={{ uri: logoUri }} style={styles.logoImage} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Ionicons name="images-outline" size={32} color={colors.muted} />
                <Text style={styles.logoPlaceholderText}>اضغط لاختيار صورة الشعار</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Cover Picker */}
        <View style={styles.logoSection}>
          <Text style={styles.label}>صورة الغلاف (الخلفية الرسمية)</Text>
          <Pressable style={styles.coverPicker} onPress={handlePickCover}>
            {coverUri ? (
              <Image source={{ uri: coverUri }} style={styles.logoImage} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Ionicons name="image-outline" size={32} color={colors.muted} />
                <Text style={styles.logoPlaceholderText}>اختيار خلفية مخصصة للوحة تحكم المصلحة</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Form Inputs */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>اسم المصلحة</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="business-outline" size={20} color={colors.muted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="مثال: مديرية الأشغال العمومية"
              placeholderTextColor={colors.muted}
              value={deptName}
              onChangeText={setDeptName}
              textAlign="right"
            />
          </View>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>اسم المستخدم</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color={colors.muted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="اسم حساب الولوج (مثال: admin_tp)"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
              textAlign="right"
            />
          </View>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>كلمة السر المؤقتة</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.muted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="ستُعطى للمصلحة للولوج لأول مرة"
              placeholderTextColor={colors.muted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              textAlign="right"
            />
          </View>
        </View>

        <View style={{ marginTop: spacing.lg }}>
          <Pressable
            style={[styles.primaryButton, busy && styles.disabled]}
            onPress={handleCreate}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.primaryButtonText}>{isEditing ? "تحديث التغييرات" : "حفظ وإنشاء الحساب"}</Text>
            )}
          </Pressable>

          {isEditing && (
            <Pressable
              style={[styles.primaryButton, { backgroundColor: colors.danger, marginTop: spacing.md }]}
              onPress={handleDelete}
              disabled={busy}
            >
              <Text style={styles.primaryButtonText}>حذف المصلحة</Text>
            </Pressable>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { 
    padding: spacing.xl, 
    paddingTop: 30,
    backgroundColor: colors.background,
    minHeight: "100%",
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: { 
    fontSize: 26, 
    fontWeight: "800", 
    color: colors.primary, 
    textAlign: "right",
    marginBottom: 4,
  },
  subtitle: { 
    fontSize: 14, 
    color: colors.textSecondary, 
    textAlign: "right",
    lineHeight: 22,
  },
  formContainer: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  logoSection: {
    marginBottom: spacing.xl,
    alignItems: "flex-end", // Align right
  },
  logoPicker: {
    width: 100,
    height: 100,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
    overflow: "hidden",
  },
  coverPicker: {
    width: "100%",
    height: 120,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
    overflow: "hidden",
  },
  logoPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoPlaceholderText: {
    fontSize: 10,
    color: colors.muted,
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 4,
  },
  logoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  inputWrapper: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 8,
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
    marginLeft: 12,
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
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.md,
  },
  primaryButtonText: { 
    color: colors.white, 
    fontWeight: "700", 
    fontSize: 16 
  },
  disabled: { 
    opacity: 0.6 
  },
});
