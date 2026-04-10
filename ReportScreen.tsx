import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useEffect, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { getDepartmentsFromApi, uploadComplaintImage } from "../services/api";
import { useAuth } from "../store/auth-store";
import { useComplaints } from "../store/complaints-store";
import { useLanguage } from "../store/language-store-fixed";
import { colors, spacing, radius, shadows } from "../theme";
import { WebDashboardLayout } from "../components/layout/WebDashboardLayout";

export function ReportScreen({
  initialCategory,
}: {
  initialCategory?: string;
}) {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { submitComplaint } = useComplaints();
  const { t } = useLanguage();

  const [type, setType] = useState<"complaint" | "suggestion">("complaint");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(initialCategory || "أخرى");
  const [sending, setSending] = useState(false);
  const [locBusy, setLocBusy] = useState(true);
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [localImageUris, setLocalImageUris] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [assignedDept, setAssignedDept] = useState<string>("");
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    address_text: string;
  } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocation({ lat: 36.7372, lng: 3.0880, address_text: "الجزائر العاصمة (افتراضي)" });
          return;
        }
        const pos = await Location.getCurrentPositionAsync({});
        let addressText = "مقر الولاية";
        let places: any[] = [];
        try {
          places = await Location.reverseGeocodeAsync({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        } catch(e) {}
        
        if (places && places.length > 0) {
          const p = places[0];
          const parts = [p.street, p.district, p.city].filter(Boolean);
          if (parts.length > 0) addressText = parts.join("، ");
        } else {
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json&accept-language=ar`);
            const data = await res.json();
            if (data && data.display_name) addressText = data.display_name.split(",").slice(0, 3).join("،");
          } catch(e) {}
        }
        
        addressText = `${addressText} (خط الطول: ${pos.coords.longitude.toFixed(5)}، خط العرض: ${pos.coords.latitude.toFixed(5)})`;

        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          address_text: addressText
        });
      } finally {
        setLocBusy(false);
      }
    })();

    // Load custom departments added by Admin from Centralized DB
    getDepartmentsFromApi().then(deps => {
      const customNames = deps.map(d => d.name || d.organization);
      setDepartments(customNames);
      if (customNames.length > 0) setAssignedDept(customNames[0]);
    });
  }, []);



  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.5, allowsMultipleSelection: true, aspect: [16, 9], base64: true });
    if (!res.canceled && res.assets) {
      const uris = res.assets.map(a => a.base64 ? `data:image/jpeg;base64,${a.base64}` : a.uri);
      setLocalImageUris((prev) => [...prev, ...uris]);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !location) return;
    setSending(true);
    try {
      let media_urls: string[] = [];
      if (localImageUris.length > 0) {
        for (const uri of localImageUris) {
          const url = await uploadComplaintImage(uri);
          if (url) media_urls.push(url);
        }
      }
      await submitComplaint({
        title: title.trim(),
        description: description.trim(),
        category,
        location: location.address_text,
        assigned_dept: assignedDept,
        media_urls,
      });
      if (Platform.OS === 'web') alert("تم إرسال بلاغك بنجاح إلى " + assignedDept);
      (navigation as any).navigate("Tracking");
    } finally {
      setSending(false);
    }
  };

  const isValid = title.length > 5 && description.length > 10 && !locBusy;

  return (
    <WebDashboardLayout>
      <ScrollView style={styles.container} contentContainerStyle={[styles.scrollArea, isMobile && { padding: spacing.md }]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.mainTitle}>{t("report.title")}</Text>
          <Text style={styles.mainSub}>{t("report.sub")}</Text>
        </View>

        <View style={{ flexDirection: "row-reverse", gap: spacing.md, marginBottom: spacing.xl }}>
          <Pressable 
            onPress={() => setType("complaint")}
            style={[styles.typeCard, type === "complaint" && styles.typeCardActive]}
          >
            <Ionicons name="alert-circle-outline" size={32} color={type === "complaint" ? colors.primary : colors.textSecondary} />
            <Text style={[styles.typeText, type === "complaint" && styles.typeTextActive]}>
              {t("report.complaint")}
            </Text>
          </Pressable>
          <Pressable 
            onPress={() => setType("suggestion")}
            style={[styles.typeCard, type === "suggestion" && styles.typeCardActive]}
          >
            <Ionicons name="bulb-outline" size={32} color={type === "suggestion" ? colors.primary : colors.textSecondary} />
            <Text style={[styles.typeText, type === "suggestion" && styles.typeTextActive]}>
              {t("report.suggestion")}
            </Text>
          </Pressable>
        </View>

        <View style={[styles.formRow, isMobile && { flexDirection: "column" }]}>
          <View style={[styles.card, !isMobile && { flex: 2 }, isMobile && { width: "100%" }]}>
            <Text style={styles.label}>{t("report.title_label")}</Text>
            <TextInput 
              style={styles.input} 
              placeholder="مثال: تسرب مياه في شارع العربي بن مهيدي"
              value={title}
              onChangeText={setTitle}
              textAlign="right"
            />
            
            <Text style={styles.label}>{t("report.details")}</Text>
            <TextInput 
              style={[styles.input, styles.textArea]} 
              placeholder="اشرح المشكلة ومظاهرها بوضوح..."
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
              textAlign="right"
            />
          </View>

          <View style={[styles.sideCard, !isMobile && { flex: 1 }, isMobile && { width: "100%" }]}>
            <Text style={styles.label}>{t("report.category")}</Text>
            <View style={styles.selectContainer}>
              {Platform.OS === 'web' ? (
                <select 
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontFamily: 'Cairo', fontSize: '14px', backgroundColor: colors.background, outline: 'none' }}
                  value={assignedDept}
                  onChange={(e) => setAssignedDept(e.target.value)}
                >
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              ) : (
                <View style={{ gap: 4 }}>
                  {departments.map(d => (
                    <Pressable 
                      key={d} 
                      onPress={() => setAssignedDept(d)} 
                      style={{ padding: 10, borderRadius: 6, backgroundColor: assignedDept === d ? colors.primary : colors.background, borderWidth: 1, borderColor: assignedDept === d ? colors.primary : colors.border }}
                    >
                      <Text style={{ color: assignedDept === d ? colors.white : colors.textPrimary, fontWeight: assignedDept === d ? "800" : "600", textAlign: "right" }}>{d}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            <Text style={[styles.label, { marginTop: spacing.lg }]}>{t("report.location")}</Text>
            <View style={styles.locBox}>
              <Ionicons name="location" size={16} color={colors.danger} />
              <Text style={styles.locText}>{locBusy ? "جارٍ التحديد..." : location?.address_text}</Text>
            </View>

            <Pressable style={styles.attachBtn} onPress={pickImage}>
              <Ionicons name="camera-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.attachText}>{localImageUris.length > 0 ? `تم إرفاق ${localImageUris.length} صور (اضغط للمزيد)` : "إرفاق صور توثيقية"}</Text>
            </Pressable>
            {localImageUris.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.md }}>
                {localImageUris.map((uri, idx) => (
                  <View key={idx} style={{ position: 'relative', marginRight: spacing.sm }}>
                    <Image source={{ uri }} style={styles.imagePreview} />
                    <Pressable 
                      style={{ position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, padding: 4 }}
                      onPress={() => setLocalImageUris(prev => prev.filter((_, i) => i !== idx))}
                    >
                      <Ionicons name="close" size={16} color="#fff" />
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable 
            style={[styles.submitBtn, !isValid && styles.btnDisabled, isMobile && { width: "100%", justifyContent: "center" }]} 
            onPress={handleSubmit}
            disabled={!isValid || sending}
          >
            {sending ? <ActivityIndicator color="#fff" /> : (
              <>
                <Ionicons name="cloud-upload-outline" size={20} color="#fff" style={{ marginLeft: 8 }} />
                <Text style={styles.submitText}>{t("report.submit")}</Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </WebDashboardLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  scrollArea: { padding: spacing.huge },
  header: { marginBottom: spacing.xl, alignItems: "center" },
  mainTitle: { fontSize: 28, fontWeight: "900", color: colors.primary },
  mainSub: { fontSize: 14, color: colors.textSecondary, marginTop: 8, fontWeight: "600", textAlign: "center" },
  
  typeCard: { flex: 1, padding: spacing.xl, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.border, alignItems: "center", backgroundColor: colors.surface, gap: 12 },
  typeCardActive: { borderColor: colors.primary, backgroundColor: "#F0FDF4" },
  typeText: { fontWeight: "700", color: colors.textSecondary, textAlign: "center", fontSize: 16 },
  typeTextActive: { color: colors.primary, fontWeight: "800" },

  formRow: { flexDirection: "row", gap: spacing.lg },
  card: { backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, ...shadows.sm },
  sideCard: { backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, ...shadows.sm },
  
  label: { fontSize: 14, fontWeight: "800", color: colors.textPrimary, marginBottom: 8, textAlign: "right" },
  input: { backgroundColor: colors.white, borderRadius: radius.sm, borderWidth: 1.5, borderColor: colors.border, padding: spacing.md, fontSize: 14, color: colors.textPrimary, marginBottom: spacing.lg },
  textArea: { height: 160, textAlignVertical: "top" },
  
  selectContainer: { marginBottom: spacing.lg },
  
  locBox: { flexDirection: "row", alignItems: "center", gap: 8, padding: spacing.md, backgroundColor: colors.background, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border },
  locText: { fontSize: 12, color: colors.textPrimary, fontWeight: "600" },
  
  attachBtn: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: spacing.lg, padding: spacing.md, borderRadius: radius.sm, borderStyle: "dashed", borderWidth: 1, borderColor: colors.muted, justifyContent: "center" },
  attachText: { fontSize: 13, fontWeight: "700", color: colors.textSecondary },
  imagePreview: { width: 120, height: 120, borderRadius: radius.sm },
  
  footer: { marginTop: spacing.xl, alignItems: "flex-start" },
  submitBtn: { flexDirection: "row", backgroundColor: colors.primary, paddingHorizontal: spacing.huge, paddingVertical: spacing.md, borderRadius: radius.sm, alignItems: "center", gap: 8, ...shadows.md },
  btnDisabled: { opacity: 0.5 },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
