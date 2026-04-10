import { Pressable, ScrollView, Text, View, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../store/auth-store";
import { colors, spacing, radius } from "../theme";
import { screenStyles as styles } from "./styles";
import { WebDashboardLayout } from "../components/layout/WebDashboardLayout";

import { useLanguage } from "../store/language-store-fixed";

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const handleLogout = () => {
    import("react-native").then(({ Platform, Alert }) => {
      if (Platform.OS === "web") {
        if (window.confirm("هل أنت متأكد من رغبتك في تسجيل الخروج من المنصة؟")) {
          logout();
        }
      } else {
        Alert.alert(
          "تسجيل الخروج",
          "هل أنت متأكد من رغبتك في تسجيل الخروج من المنصة؟",
          [
            { text: "إلغاء", style: "cancel" },
            { text: "خروج", style: "destructive", onPress: logout }
          ]
        );
      }
    });
  };

  const navigation = useNavigation();

  return (
    <WebDashboardLayout>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatar}>
            <Ionicons name="person" size={50} color={colors.white} />
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={styles.profileName}>{user?.full_name || "مواطن مسجل"}</Text>
            <Text style={styles.profileMeta}>{user?.organization || "منصة بادر للخدمات"}</Text>
            <Text style={[styles.profileMeta, { opacity: 0.6 }]}>{user?.phone || "05XXXXXXXX"}</Text>
          </View>
          
          <View style={{ flexDirection: "row", gap: 8, marginTop: spacing.md }}>
            <View style={{ backgroundColor: colors.accent + "15", paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.full }}>
              <Text style={{ color: colors.accent, fontWeight: "800", fontSize: 12 }}>{user?.role === "admin" ? t("profile.admin") : user?.role === "department" ? t("profile.dept") : t("profile.citizen")}</Text>
            </View>
            <View style={{ backgroundColor: colors.success + "15", paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.full }}>
              <Text style={{ color: colors.success, fontWeight: "800", fontSize: 12 }}>{t("profile.verified")}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t("profile.settings")}</Text>
        <View style={styles.blockCard}>
          <MenuRow icon="person-circle-outline" label={t("profile.edit")} onPress={() => (navigation as any).navigate("EditProfileSettings")} />
          <MenuRow icon="shield-half-outline" label={t("profile.security")} onPress={() => (navigation as any).navigate("SecuritySettings")} />
          <MenuRow icon="language-outline" label={t("profile.lang")} value="العربية" onPress={() => (navigation as any).navigate("LanguageSettings")} />
          <MenuRow icon="document-text-outline" label={t("profile.privacy")} onPress={() => (navigation as any).navigate("PrivacySettings")} />
          <MenuRow icon="information-circle-outline" label={t("profile.about")} border={false} onPress={() => (navigation as any).navigate("AboutPlatform")} />
        </View>

        <Pressable 
          style={[styles.primaryButton, { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.danger, marginTop: spacing.lg, flexDirection: "row", justifyContent: "center", gap: 8 }]} 
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={[styles.primaryButtonText, { color: colors.danger }]}>{t("profile.logout")}</Text>
        </Pressable>

        <Text style={{ textAlign: "center", color: colors.muted, fontSize: 11, marginTop: spacing.xl }}>
          الإصدار 2.4.0 (2026) - منصة بادر الموحدة
        </Text>
      </ScrollView>
    </WebDashboardLayout>
  );
}

function MenuRow({ icon, label, value, border = true, onPress }: { icon: any, label: string, value?: string, border?: boolean, onPress?: () => void }) {
  return (
    <Pressable 
      onPress={onPress}
      style={{ 
        flexDirection: "row", 
        alignItems: "center", 
        paddingVertical: 14,
        borderBottomWidth: border ? 1 : 0,
        borderBottomColor: colors.background
      }}
    >
      <View style={{ width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <Text style={{ flex: 1, fontSize: 15, fontWeight: "700", color: colors.textPrimary, textAlign: "right" }}>{label}</Text>
      {value ? (
        <Text style={{ fontSize: 14, color: colors.muted, fontWeight: "600", marginRight: 8 }}>{value}</Text>
      ) : (
        <Ionicons name="chevron-back" size={16} color={colors.muted} />
      )}
    </Pressable>
  );
}
