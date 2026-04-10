import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Platform, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { colors, spacing, radius, shadows } from "../theme";
import { useAuth } from "../store/auth-store";
import { WebDashboardLayout } from "../components/layout/WebDashboardLayout";

export function SettingsScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm("تسجيل الخروج من كافة الأجهزة؟")) logout();
    } else {
      Alert.alert(
        "تسجيل الخروج",
        "هل أنت متأكد أنك تريد تسجيل الخروج من كافة الأجهزة؟",
        [
          { text: "إلغاء", style: "cancel" },
          { text: "خروج وتأكيد", style: "destructive", onPress: logout }
        ]
      );
    }
  };

  return (
    <WebDashboardLayout>
      <ScrollView style={styles.container} contentContainerStyle={[styles.scrollArea, isMobile && { padding: spacing.md }]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>إعدادات منصة بادر</Text>
          <Text style={styles.subtitle}>تخصيص الخصوصية، التنبيهات، والأمان الرقمي لحسابكم.</Text>
        </View>

        <View style={styles.contentGrid}>
          {/* Account Info */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-outline" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>معلومات الحساب</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>الاسم الكامل</Text>
              <Text style={styles.infoValue}>{user?.full_name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>رقم الجوال</Text>
              <Text style={styles.infoValue}>{user?.phone}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>نوع الحساب</Text>
              <Text style={styles.infoValue}>{user?.role === 'admin' ? "مدير عام" : user?.role === 'department' ? "حساب إداري" : "حساب مواطن"}</Text>
            </View>
            {user?.role === 'department' && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>الهيئة التابع لها</Text>
                <Text style={styles.infoValue}>{user.organization}</Text>
              </View>
            )}
            <Pressable 
              style={styles.editBtn} 
              onPress={() => (navigation as any).navigate("EditProfileSettings")}
            >
              <Text style={styles.editBtnText}>تحديث البيانات الشخصية</Text>
            </Pressable>
          </View>

          {/* Security & Support */}
          <View style={[styles.card, { borderColor: colors.danger + '30' }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.danger} />
              <Text style={[styles.sectionTitle, { color: colors.danger }]}>الأمان والدعم</Text>
            </View>
            
            <Pressable style={styles.actionRow} onPress={() => (navigation as any).navigate("SecuritySettings")}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.actionText}>تغيير كلمة المرور</Text>
              <Ionicons name="chevron-back" size={16} color={colors.muted} />
            </Pressable>

            <Pressable style={styles.actionRow} onPress={() => (navigation as any).navigate("AboutPlatform")}>
              <Ionicons name="headset-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.actionText}>مركز المساعدة التقنية</Text>
              <Ionicons name="chevron-back" size={16} color={colors.muted} />
            </Pressable>

            <Pressable style={[styles.actionRow, { borderBottomWidth: 0 }]} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={18} color={colors.danger} />
              <Text style={[styles.actionText, { color: colors.danger }]}>تسجيل الخروج من كافة الأجهزة</Text>
              <Ionicons name="chevron-back" size={16} color={colors.muted} />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </WebDashboardLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  scrollArea: { padding: spacing.huge },
  header: { marginBottom: spacing.xl, alignItems: "center" },
  title: { fontSize: 24, fontWeight: "900", color: colors.primary },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 8, fontWeight: "600", textAlign: "center" },

  contentGrid: { gap: spacing.lg, maxWidth: 600, width: "100%", alignSelf: "center" },
  card: { backgroundColor: colors.surface, padding: spacing.xl, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, ...shadows.sm },
  
  sectionHeader: { flexDirection: "row-reverse", alignItems: "center", gap: 10, marginBottom: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.background, paddingBottom: spacing.md },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: colors.primary },
  
  infoRow: { flexDirection: "row-reverse", justifyContent: "space-between", paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.background },
  infoLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: "700" },
  infoValue: { fontSize: 13, color: colors.textPrimary, fontWeight: "800" },
  
  editBtn: { alignSelf: "flex-start", marginTop: spacing.lg, paddingVertical: 8, paddingHorizontal: 16, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.primary },
  editBtnText: { color: colors.primary, fontSize: 12, fontWeight: "800" },
  
  prefRow: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.background },
  prefText: { alignItems: "flex-end", flex: 1 },
  prefTitle: { fontSize: 14, fontWeight: "800", color: colors.textPrimary },
  prefSub: { fontSize: 11, color: colors.textSecondary, marginTop: 4, fontWeight: "600" },
  
  actionRow: { flexDirection: "row-reverse", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.background, gap: 12 },
  actionText: { flex: 1, textAlign: "right", fontSize: 13, fontWeight: "700", color: colors.textPrimary },
});
