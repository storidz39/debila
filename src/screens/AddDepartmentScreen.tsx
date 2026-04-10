import { useNavigation, useRoute } from "@react-navigation/native";
import { useState, useEffect } from "react";
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
        const d = deps.find(x => String(x.id) === String(departmentId));
        if (d) {
          setDeptName(d.name || d.organization || "");
          setUsername(d.username || "");
          setPassword(""); // Security: don't show password
          setLogoUri(d.logo_uri || null);
          setCoverUri(d.cover_uri || null);
        }
      });
    }
  }, [departmentId, isEditing]);

  const handlePickLogo = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true
    });

    if (!res.canceled && res.assets.length > 0) {
      const asset = res.assets[0];
      setLogoUri(asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri);
    }
  };

  const handlePickCover = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
      base64: true
    });

    if (!res.canceled && res.assets.length > 0) {
      const asset = res.assets[0];
      setCoverUri(asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri);
    }
  };

  const handleCreate = async () => {
    if (!deptName.trim() || !username.trim() || (!isEditing && password.length < 6)) {
      if (Platform.OS === 'web') window.alert("تنبيه: يرجى ملء كافة البيانات الرئيسية.");
      else Alert.alert("تنبيه", "يرجى ملء كافة البيانات الرئيسية.");
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
          logo_uri: logoUri,
          cover_uri: coverUri,
        });
        if (Platform.OS === "web") window.alert("تم التعديل بنجاح.");
        else Alert.alert("نجاح", "تم التعديل بنجاح.");
      } else {
        await registerRequest(
          username.trim(), 
          password.trim(),
          deptName.trim(),
          username.trim(),
          "", 
          "department",
          deptName.trim(),
          logoUri || "",
          coverUri || ""
        );
        if (Platform.OS === "web") window.alert("تم إضافة المصلحة بنجاح.");
        else Alert.alert("نجاح", "تم إضافة المصلحة بنجاح.");
      }
      navigation.goBack();
    } catch (e: any) {
      if (Platform.OS === "web") window.alert("خطأ في الاتصال بالسيرفر.");
      else Alert.alert("خطأ", "فشل في الحفظ.");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (Platform.OS === "web") {
      if (!window.confirm("هل أنت متأكد من مسح المصلحة؟")) return;
      await deleteDepartmentApi(departmentId);
      navigation.goBack();
      return;
    }
    Alert.alert("تأكيد الحذف", "هل أنت متأكد من مسح المصلحة؟", [
      { text: "إلغاء", style: "cancel" },
      { text: "نعم", style: "destructive", onPress: async () => {
        await deleteDepartmentApi(departmentId);
        navigation.goBack();
      }}
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={{ alignSelf: "flex-end" }}>
          <Ionicons name="arrow-back-outline" size={24} color={colors.primary} />
        </Pressable>
        <Text style={styles.title}>{isEditing ? "تعديل المصلحة" : "إضافة مصلحة"}</Text>
      </View>

      <View style={styles.formContainer}>
        {/* Logo Picker */}
        <View style={styles.logoSection}>
          <Text style={styles.label}>شعار المصلحة</Text>
          <Pressable style={styles.logoPicker} onPress={handlePickLogo}>
            {logoUri ? (
              <Image source={{ uri: logoUri }} style={styles.logoImage} />
            ) : (
              <Ionicons name="images-outline" size={32} color={colors.muted} />
            )}
          </Pressable>
        </View>

        <Text style={styles.label}>اسم المصلحة</Text>
        <TextInput style={styles.input} value={deptName} onChangeText={setDeptName} textAlign="right" />

        <Text style={styles.label}>اسم الدخول (Username)</Text>
        <TextInput 
            style={styles.input} 
            value={username} 
            onChangeText={setUsername} 
            textAlign="right" 
            autoCapitalize="none"
        />

        <Text style={styles.label}>كلمة المرور</Text>
        <TextInput 
            style={styles.input} 
            secureTextEntry 
            value={password} 
            onChangeText={setPassword} 
            textAlign="right" 
            placeholder={isEditing ? "اترك فارغاً لعدم التغيير" : ""}
        />

        <Pressable style={[styles.submitBtn, busy && { opacity: 0.6 }]} onPress={handleCreate} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>{isEditing ? "تحديث" : "حفظ"}</Text>}
        </Pressable>

        {isEditing && (
          <Pressable style={[styles.submitBtn, { backgroundColor: colors.danger, marginTop: spacing.md }]} onPress={handleDelete}>
            <Text style={styles.submitText}>حذف المصلحة</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.xl, backgroundColor: colors.background, minHeight: "100%" },
  header: { marginBottom: spacing.xl },
  title: { fontSize: 24, fontWeight: "900", color: colors.primary, textAlign: "right" },
  formContainer: { backgroundColor: colors.surface, padding: spacing.xl, borderRadius: radius.md, ...shadows.sm },
  label: { fontSize: 14, fontWeight: "800", color: colors.textPrimary, marginBottom: 8, textAlign: "right" },
  input: { backgroundColor: colors.background, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.lg, textAlign: "right" },
  logoSection: { alignItems: "center", marginBottom: spacing.xl },
  logoPicker: { width: 100, height: 100, borderRadius: radius.full, borderStyle: "dashed", borderWidth: 2, borderColor: colors.border, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  logoImage: { width: "100%", height: "100%" },
  submitBtn: { height: 50, backgroundColor: colors.primary, borderRadius: radius.sm, alignItems: "center", justifyContent: "center", marginTop: spacing.lg },
  submitText: { color: "#fff", fontWeight: "900", fontSize: 16 },
});
