import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, shadows } from "../theme";
import { useComplaints } from "../store/complaints-store";
import { useAuth } from "../store/auth-store";
import { WebDashboardLayout } from "../components/layout/WebDashboardLayout";
import { useNavigation } from "@react-navigation/native";
import { useWindowDimensions } from "react-native";

const CITIZEN_SERVICES = [
  { id: "municipality", title: "شؤون البلدية", desc: "النظافة، الإنارة، والطرق", category: "البلديات", icon: "business" },
  { id: "water", title: "الموارد المائية", desc: "تسربات المياه والتوزيع", category: "المرفق العام للمياه", icon: "water" },
  { id: "electricity", title: "الطاقة والكهرباء", desc: "أعطال الشبكات والإنارة", category: "هيئة الكهرباء", icon: "flash" },
  { id: "health", title: "الصحة العامة", desc: "الرعاية والخدمات الطبية", category: "قطاع الصحة", icon: "medkit" },
  { id: "roads", title: "الأشغال العمومية", desc: "صيانة الطرق والجسور", category: "الأشغال العمومية", icon: "car" },
];

export function WebDashboardScreen() {
  const { filteredComplaints, loading, refresh } = useComplaints();
  const { user } = useAuth();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const total = filteredComplaints.length;
  const pending = filteredComplaints.filter(c => c.status === "submitted" || c.status === "under_review").length;
  const resolved = filteredComplaints.filter(c => c.status === "resolved").length;

  const renderCitizenDash = () => (
    <>
      <View style={[styles.banner, isMobile && { flexDirection: "column" }]}>
        <View style={[styles.bannerContent, isMobile && { marginRight: 0, marginBottom: spacing.lg }]}>
          <Text style={styles.welcomeLabel}>مرحباً بك مجدداً،</Text>
          <Text style={styles.userName}>{user?.full_name}</Text>
          <Text style={styles.bannerSub}>بوابتكم الرقمية للمساهمة في تحسين الخدمات العمومية وتتبع انشغالاتكم.</Text>
        </View>
        <Pressable 
          style={({ hovered }: any) => [styles.mainActionBtn, hovered && styles.mainActionBtnHover]}
          onPress={() => navigation.navigate("Report" as never)}
        >
          <Ionicons name="add-circle" size={20} color={colors.white} style={{ marginLeft: 8 }} />
          <Text style={styles.mainActionText}>تقديم بلاغ جديد</Text>
        </Pressable>
      </View>

      <View style={[styles.statsRow, isMobile && { flexDirection: "column" }]}>
        <StatCard label="بلاغاتي" value={total} color={colors.textPrimary} icon="documents-outline" />
        <StatCard label="قيد المعالجة" value={pending} color={colors.warning} icon="time-outline" />
        <StatCard label="تم الحل" value={resolved} color={colors.primary} icon="checkmark-done-outline" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>الخدمات الأكثر طلباً</Text>
        <View style={styles.servicesGrid}>
          {CITIZEN_SERVICES.map((s) => (
            <Pressable key={s.id} style={[styles.serviceItem, isMobile && { width: "100%" }]} onPress={() => navigation.navigate("Report" as never)}>
              <View style={styles.serviceIconFrame}>
                <Ionicons name={s.icon as any} size={24} color={colors.primary} />
              </View>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceTitle}>{s.title}</Text>
                <Text style={styles.serviceDesc}>{s.desc}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </>
  );

  const renderOfficialDash = () => (
    <>
      {user?.coverUri ? (
        <>
          <View style={styles.coverImageContainer}>
            <Image source={{ uri: user.coverUri }} style={styles.coverImage} resizeMode="cover" />
            <View style={styles.coverOverlay} />
            <View style={styles.coverWatermark}>
              <Image source={require("../../assets/icon.png")} style={styles.watermarkLogo} resizeMode="contain" />
            </View>
          </View>
          <View style={styles.adminHeader}>
            <View style={styles.adminTitleRow}>
              <Text style={styles.adminRoleLabel}>{user?.role === "admin" ? "الإدارة العليا" : "مكتب التسيير"}</Text>
              <Text style={styles.adminOrgName}>{user?.organization || "منصة الرقابة الوطنية"}</Text>
            </View>
            <Pressable onPress={refresh} style={styles.refreshBtn}>
              <Ionicons name="refresh-outline" size={18} color={colors.primary} />
              <Text style={styles.refreshText}>تحديث البيانات</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <View style={styles.adminHeader}>
          <View style={styles.adminTitleRow}>
            <Text style={styles.adminRoleLabel}>{user?.role === "admin" ? "الإدارة العليا" : "مكتب التسيير"}</Text>
            <Text style={styles.adminOrgName}>{user?.organization || "منصة الرقابة الوطنية"}</Text>
          </View>
          <Pressable onPress={refresh} style={styles.refreshBtn}>
            <Ionicons name="refresh-outline" size={18} color={colors.primary} />
            <Text style={styles.refreshText}>تحديث البيانات</Text>
          </Pressable>
        </View>
      )}

      <View style={[styles.statsRow, isMobile && { flexDirection: "column" }]}>
        <StatCard label="إجمالي الوارد" value={total} color={colors.textPrimary} icon="albums-outline" />
        <StatCard label="طلبات معلقة" value={pending} color={colors.danger} icon="alert-circle-outline" />
        <StatCard label="معدل الإنجاز" value={resolved} color={colors.success} icon="stats-chart-outline" />
      </View>
    </>
  );

  return (
    <WebDashboardLayout>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {user?.role === "citizen" ? renderCitizenDash() : renderOfficialDash()}

        <View style={styles.bottomSection}>
          <View style={styles.listCard}>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>{user?.role === "citizen" ? "آخر تحديثات بلاغاتي" : "قائمة المهام القائمة"}</Text>
              <Pressable onPress={() => (navigation as any).navigate(user?.role === "citizen" ? "Tracking" : "Admin")}>
                <Text style={styles.viewMore}>عرض الكل</Text>
              </Pressable>
            </View>

            {filteredComplaints.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="document-text-outline" size={40} color={colors.border} />
                <Text style={styles.emptyText}>لا توجد بيانات ليتم عرضها حالياً.</Text>
              </View>
            ) : (
              filteredComplaints.slice(0, 5).map((c) => (
                <Pressable 
                  key={c.id} 
                  style={({ hovered }: any) => [styles.complaintItem, hovered && styles.complaintItemHover]}
                  onPress={() => (navigation as any).navigate("ComplaintDetail", { complaintId: c.id })}
                >
                  <View style={styles.complaintMain}>
                    <Text style={styles.complaintTitle}>{c.title}</Text>
                    <Text style={styles.complaintMeta}>{c.assigned_dept} • {new Date(c.created_at).toLocaleDateString("ar-DZ")}</Text>
                  </View>
                  <View style={[styles.statusBadge, { borderColor: c.status === 'resolved' ? colors.primary : colors.warning }]}>
                    <Text style={[styles.statusText, { color: c.status === 'resolved' ? colors.primary : colors.warning }]}>
                      {c.status === 'resolved' ? "تم الحل" : "قيد المعالجة"}
                    </Text>
                  </View>
                </Pressable>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </WebDashboardLayout>
  );
}

function StatCard({ label, value, color, icon }: any) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIconContainer}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl },
  banner: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  bannerContent: { flex: 1, alignItems: "flex-start", marginRight: spacing.xl },
  welcomeLabel: { fontSize: 13, fontWeight: "700", color: colors.textSecondary, marginBottom: 4, textAlign: "right" },
  userName: { fontSize: 24, fontWeight: "900", color: colors.primary, textAlign: "right" },
  bannerSub: { fontSize: 14, color: colors.textSecondary, fontWeight: "600", marginTop: 8, textAlign: "right", lineHeight: 22 },
  mainActionBtn: { flexDirection: "row", backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.sm, alignItems: "center", gap: 8, ...shadows.sm },
  mainActionBtnHover: { opacity: 0.9 },
  mainActionText: { color: colors.white, fontSize: 14, fontWeight: "800" },
  
  adminHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.xl },
  adminTitleRow: { alignItems: "flex-start" },
  adminRoleLabel: { fontSize: 12, fontWeight: "700", color: colors.accent, marginBottom: 4, textAlign: "right" },
  adminOrgName: { fontSize: 24, fontWeight: "900", color: colors.textPrimary, textAlign: "right" },
  refreshBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  refreshText: { fontSize: 13, fontWeight: "700", color: colors.primary },

  coverImageContainer: {
    height: 180,
    borderRadius: radius.md,
    marginBottom: spacing.xl,
    overflow: "hidden",
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  coverWatermark: {
    position: "absolute",
    bottom: spacing.lg,
    right: spacing.lg,
    opacity: 0.4,
  },
  watermarkLogo: {
    width: 80,
    height: 80,
    tintColor: colors.white,
  },

  statsRow: { flexDirection: "row", gap: spacing.lg, marginBottom: spacing.xl },
  statCard: { flex: 1, backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.md, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.border, ...shadows.sm },
  statIconContainer: { width: 48, height: 48, borderRadius: radius.sm, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", marginRight: spacing.lg },
  statContent: { alignItems: "flex-start", flex: 1 },
  statLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: "700", marginBottom: 2, textAlign: "right" },
  statValue: { fontSize: 28, fontWeight: "900", textAlign: "right" },
  
  section: { marginBottom: spacing.xl },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: colors.textPrimary, marginBottom: spacing.lg, textAlign: "right" },
  servicesGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.lg },
  serviceItem: { width: "31.5%", backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.md, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.border, ...shadows.sm },
  serviceIconFrame: { width: 44, height: 44, backgroundColor: colors.background, borderRadius: radius.sm, alignItems: "center", justifyContent: "center", marginRight: spacing.md },
  serviceImage: { width: 28, height: 28 },
  serviceInfo: { flex: 1, alignItems: "flex-start" },
  serviceTitle: { fontSize: 14, fontWeight: "800", color: colors.textPrimary, textAlign: "right" },
  serviceDesc: { fontSize: 11, color: colors.textSecondary, marginTop: 4, textAlign: "right" },
  
  bottomSection: { marginTop: spacing.md },
  listCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.xl, borderWidth: 1, borderColor: colors.border, ...shadows.sm },
  listHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: spacing.md },
  listTitle: { fontSize: 16, fontWeight: "900", color: colors.textPrimary, textAlign: "right" },
  viewMore: { color: colors.primary, fontSize: 13, fontWeight: "800" },
  emptyBox: { alignItems: "center", justifyContent: "center", paddingVertical: spacing.huge },
  emptyText: { color: colors.muted, fontSize: 14, fontWeight: "600", marginTop: 12 },
  complaintItem: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderRadius: radius.sm, borderBottomWidth: 1, borderBottomColor: colors.background },
  complaintItemHover: { backgroundColor: colors.background },
  complaintMain: { flex: 1, alignItems: "flex-start" },
  complaintTitle: { fontSize: 14, fontWeight: "800", color: colors.textPrimary, textAlign: "right" },
  complaintMeta: { fontSize: 11, color: colors.muted, marginTop: 4, fontWeight: "600", textAlign: "right" },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.full, borderWidth: 1, marginRight: spacing.lg },
  statusText: { fontSize: 10, fontWeight: "800" },
});
