import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, shadows } from "../theme";
import { useComplaints } from "../store/complaints-store";
import { getDepartmentsFromApi } from "../services/api";
import { WebDashboardLayout } from "../components/layout/WebDashboardLayout";

export function StatsScreen() {
  const { complaints } = useComplaints();
  const [departments, setDepartments] = React.useState<any[]>([]);

  React.useEffect(() => {
    getDepartmentsFromApi().then(setDepartments);
  }, []);

  const total = complaints.length;
  const resolved = complaints.filter(c => c.status === "resolved").length;
  const inProgress = complaints.filter(c => c.status === "in_progress" || c.status === "under_review").length;
  const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // Calculate stats per department dynamically
  const deptStats = React.useMemo(() => {
    const stats: Record<string, { incoming: number, resolved: number }> = {};
    const defaultDepts = ["البلدية", "الأشغال العمومية", "الموارد المائية", "الكهرباء والغاز", "الصحة"];
    
    // Initialize
    [...defaultDepts, ...departments.map(d => d.name)].forEach(d => {
      stats[d] = { incoming: 0, resolved: 0 };
    });

    complaints.forEach(c => {
      const dept = c.assigned_dept || "أخرى";
      if (!stats[dept]) stats[dept] = { incoming: 0, resolved: 0 };
      stats[dept].incoming++;
      if (c.status === "resolved") stats[dept].resolved++;
    });

    // Sort by incoming descending and take top
    return Object.entries(stats)
      .filter(([_, data]) => data.incoming > 0)
      .sort((a, b) => b[1].incoming - a[1].incoming)
      .slice(0, 7);
  }, [complaints, departments]);

  return (
    <WebDashboardLayout>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollArea}>
        <View style={styles.header}>
          <Text style={styles.title}>مركز الإحصائيات والتحليل الوطني</Text>
          <Text style={styles.subtitle}>بيانات الأداء الميداني للهيئات والمؤسسات العمومية عبر التراب الوطني.</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>إجمالي البلاغات المسجلة</Text>
            <Text style={styles.cardValue}>{total}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>نسبة التصفية (Resolution Rate)</Text>
            <Text style={[styles.cardValue, { color: colors.primary }]}>{rate}%</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>قيد المعالجة حالياً</Text>
            <Text style={[styles.cardValue, { color: colors.warning }]}>{inProgress}</Text>
          </View>
        </View>

        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>توزيع البلاغات حسب القطاعات (Web Analytics)</Text>
          
          <View style={styles.chartContainer}>
            {deptStats.slice(0, 4).map(([name, data], i) => {
              const colorsList = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6"];
              const pct = total > 0 ? Math.round((data.incoming / total) * 100) : 0;
              return <ChartBar key={name} label={name} value={pct} color={colorsList[i % 4]} />;
            })}
            {deptStats.length === 0 && <Text style={{ textAlign: "center", color: colors.muted }}>لا توجد بيانات</Text>}
          </View>
        </View>

        <View style={styles.tableCard}>
          <Text style={styles.sectionTitle}>أداء الهيئات الأكثر تفاعلاً</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.headerCell, { flex: 2 }]}>الهيئة الإدارية</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>الوارد</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>المُنتهي</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>الأداء</Text>
          </View>
          
          {deptStats.length === 0 && <Text style={{ textAlign: "center", marginTop: 20, color: colors.muted }}>لا توجد بيانات كافية</Text>}
          
          {deptStats.map(([name, data]) => {
            const perf = data.incoming > 0 ? Math.round((data.resolved / data.incoming) * 100) + "%" : "0%";
            return (
              <TableRow key={name} name={name} incoming={data.incoming} resolved={data.resolved} perf={perf} />
            );
          })}
        </View>
      </ScrollView>
    </WebDashboardLayout>
  );
}

function ChartBar({ label, value, color }: any) {
  return (
    <View style={styles.barItem}>
      <Text style={styles.barLabel}>{label}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${value}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.barValue}>{value}%</Text>
    </View>
  );
}

function TableRow({ name, incoming, resolved, perf }: any) {
  return (
    <View style={styles.tableRow}>
      <Text style={[styles.tableCell, { flex: 2, fontWeight: "800", color: colors.primary }]}>{name}</Text>
      <Text style={styles.tableCell}>{incoming}</Text>
      <Text style={styles.tableCell}>{resolved}</Text>
      <Text style={[styles.tableCell, { fontWeight: "900", color: colors.success }]}>{perf}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollArea: { padding: spacing.xl },
  header: { marginBottom: spacing.huge, alignItems: "flex-end" },
  title: { fontSize: 24, fontWeight: "900", color: colors.primary },
  subtitle: { fontSize: 13, color: colors.textSecondary, fontWeight: "600", marginTop: 4 },

  statsGrid: { flexDirection: "row-reverse", gap: spacing.lg, marginBottom: spacing.xxl },
  card: { flex: 1, backgroundColor: colors.surface, padding: spacing.xl, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, ...shadows.sm, alignItems: "flex-end" },
  cardLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: "700", marginBottom: 8 },
  cardValue: { fontSize: 32, fontWeight: "900", color: colors.textPrimary },

  chartSection: { backgroundColor: colors.surface, padding: spacing.xl, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.xl, ...shadows.sm },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: colors.primary, marginBottom: spacing.xl, textAlign: "right" },
  chartContainer: { gap: spacing.lg },
  
  barItem: { flexDirection: "row-reverse", alignItems: "center", gap: 12 },
  barLabel: { width: 150, textAlign: "right", fontSize: 12, fontWeight: "700", color: colors.textPrimary },
  barTrack: { flex: 1, height: 10, backgroundColor: colors.background, borderRadius: 5, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 5 },
  barValue: { width: 40, textAlign: "left", fontSize: 12, fontWeight: "800", color: colors.textSecondary },

  tableCard: { backgroundColor: colors.surface, padding: spacing.xl, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, ...shadows.sm },
  tableHeader: { flexDirection: "row-reverse", borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: spacing.md, marginBottom: spacing.sm },
  tableRow: { flexDirection: "row-reverse", paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.background },
  tableCell: { flex: 1, textAlign: "right", fontSize: 13, color: colors.textPrimary, fontWeight: "600" },
  headerCell: { color: colors.textSecondary, fontWeight: "800" },
});
