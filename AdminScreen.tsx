import { useNavigation, useFocusEffect, useRoute } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View, ActivityIndicator, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ComplaintCard } from "../components/ComplaintCard";
import { colors, spacing, radius, shadows } from "../theme";
import { Complaint, ComplaintStatus } from "../types";
import { useComplaints } from "../store/complaints-store";
import { getDepartmentsFromApi } from "../services/api";
import { useAuth } from "../store/auth-store";
import { WebDashboardLayout } from "../components/layout/WebDashboardLayout";
import { useWindowDimensions } from "react-native";

export function AdminScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const filterParam = (route.params as any)?.filter;
  const { filteredComplaints, updateStatus, loading, refresh } = useComplaints();
  const { user } = useAuth();
  const [depts, setDepts] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getDepartmentsFromApi().then(data => {
        console.log("DEBUG: Departments from Cloud:", data.length);
        if (active) setDepts(data);
      });
      return () => { active = false; };
    }, [])
  );

  const kpis = useMemo(() => {
    const total = filteredComplaints.length;
    const inProg = filteredComplaints.filter((c) => c.status === "in_progress").length;
    const done = filteredComplaints.filter((c) => c.status === "resolved").length;
    const pending = filteredComplaints.filter(
      (c) => c.status === "submitted" || c.status === "under_review"
    ).length;
    return { total, inProg, done, pending };
  }, [filteredComplaints]);

  const handleStatusUpdate = async (id: string, status: ComplaintStatus) => {
    const note = status === "resolved" ? "تمت معالجة الانشغال بنجاح." : "بدأ العمل على معالجة هذا البلاغ.";
    await updateStatus(id, status, note);
  };

  const displayedComplaints = useMemo(() => {
    if (filterParam === "new") return filteredComplaints.filter(c => c.status === "submitted" || c.status === "under_review");
    if (filterParam === "resolved") return filteredComplaints.filter(c => c.status === "resolved");
    return filteredComplaints;
  }, [filteredComplaints, filterParam]);

  return (
    <WebDashboardLayout>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, isMobile && { flexDirection: "column", alignItems: "flex-start", gap: spacing.md }]}>
          <View style={styles.headerText}>
            <Text style={styles.title}>
              {user?.role === "department" ? `إدارة: ${user.organization}` : "مركز الرقابة الإدارية (سحابي v2.0)"}
            </Text>
            <Text style={styles.subtitle}>
              {user?.role === "department" ? "معالجة الطلبات الموكلة للمصلحة" : "المتابعة المركزية لكافة إدارات ومصالح الولاية"}
            </Text>
          </View>
          
          <View style={styles.headerActions}>
             {user?.role === "admin" && (
              <Pressable 
                style={styles.addBtn}
                onPress={() => (navigation as any).navigate("AddDepartment")}
              >
                <Ionicons name="business-outline" size={18} color={colors.white} style={{ marginLeft: 8 }} />
                <Text style={styles.addBtnText}>إضافة مصلحة</Text>
              </Pressable>
            )}
            <Pressable onPress={refresh} style={styles.refreshBtn}>
              <Ionicons name="refresh" size={18} color={colors.primary} />
            </Pressable>
          </View>
        </View>

        {/* KPI Stats */}
        <View style={[styles.statsRow, isMobile && { flexDirection: "column", gap: spacing.md }]}>
          <StatCard label="إجمالي البلاغات" value={kpis.total} color={colors.textPrimary} />
          <StatCard label="قيد المعالجة" value={kpis.inProg} color={colors.warning} />
          <StatCard label="بلاغات منتهية" value={kpis.done} color={colors.primary} />
          <StatCard label="متأخرة" value={kpis.pending} color={colors.danger} />
        </View>

        {/* Department Management */}
        {user?.role === "admin" && depts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>الهيئات والمؤسسات العمومية</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.deptList}>
              {depts.map((d) => (
                <Pressable 
                  key={d.id} 
                  style={styles.deptCard}
                  onPress={() => (navigation as any).navigate("AddDepartment", { departmentId: d.id })}
                >
                  <View style={styles.deptLogoFrame}>
                    {d.logo_uri ? (
                      <Image source={{ uri: d.logo_uri }} style={styles.deptLogo} resizeMode="contain" />
                    ) : (
                      <Ionicons name="business-outline" size={20} color={colors.muted} />
                    )}
                  </View>
                  <Text style={styles.deptName} numberOfLines={1}>{d.name || d.organization}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
             جدول المهام والمتابعة الميدانية
          </Text>
          
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <View style={styles.complaintLog}>
              {displayedComplaints.length === 0 ? (
                <View style={styles.emptyBox}>
                   <Text style={styles.emptyText}>لا توجد بيانات حالياً.</Text>
                </View>
              ) : (
                displayedComplaints.map((item) => (
                  <View key={item.id} style={styles.adminCard}>
                    <ComplaintCard 
                      item={item} 
                      onPress={() => (navigation as any).navigate("ComplaintDetail", { complaintId: item.id })} 
                    />
                  </View>
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </WebDashboardLayout>
  );
}

function StatCard({ label, value, color }: any) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollArea: { padding: spacing.xl },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.xl },
  headerText: { alignItems: "flex-end" },
  headerActions: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  title: { fontSize: 24, fontWeight: "900", color: colors.primary, textAlign: "right" },
  subtitle: { fontSize: 13, color: colors.textSecondary, textAlign: "right", marginTop: 4 },
  addBtn: { flexDirection: "row", backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.sm, alignItems: "center" },
  addBtnText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  refreshBtn: { width: 40, height: 40, borderRadius: radius.sm, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border },
  statsRow: { flexDirection: "row", gap: spacing.lg, marginBottom: spacing.xxl },
  statCard: { flex: 1, backgroundColor: colors.surface, padding: spacing.xl, borderRadius: radius.md, alignItems: "flex-end", borderWidth: 1, borderColor: colors.border, ...shadows.sm },
  statLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: "700", marginBottom: 4 },
  statValue: { fontSize: 32, fontWeight: "900" },
  section: { marginBottom: spacing.huge },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: colors.primary, marginBottom: spacing.lg, textAlign: "right" },
  deptList: { flexDirection: "row", paddingBottom: spacing.md },
  deptCard: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md, marginRight: spacing.lg, alignItems: "center", width: 120, borderWidth: 1, borderColor: colors.border, ...shadows.sm },
  deptLogoFrame: { width: 50, height: 50, backgroundColor: colors.background, borderRadius: radius.full, alignItems: "center", justifyContent: "center", marginBottom: spacing.sm, overflow: "hidden" },
  deptLogo: { width: "100%", height: "100%" },
  deptName: { fontSize: 11, fontWeight: "700", color: colors.textPrimary, textAlign: "center" },
  adminCard: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg },
  complaintLog: { gap: spacing.md },
  emptyBox: { padding: spacing.huge, alignItems: "center" },
  emptyText: { color: colors.muted, fontWeight: "700" },
});
