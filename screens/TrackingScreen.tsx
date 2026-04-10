import { useNavigation } from "@react-navigation/native";
import { useState, useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { ComplaintCard } from "../components/ComplaintCard";
import { useComplaints } from "../store/complaints-store";
import { colors, spacing, radius } from "../theme";
import { screenStyles as styles } from "./styles";
import { WebDashboardLayout } from "../components/layout/WebDashboardLayout";

type FilterStatus = "all" | "active" | "resolved";

export function TrackingScreen() {
  const navigation = useNavigation();
  const { filteredComplaints } = useComplaints();
  const [filter, setFilter] = useState<FilterStatus>("all");

  const finalComplaints = useMemo(() => {
    if (filter === "all") return filteredComplaints;
    if (filter === "active") return filteredComplaints.filter(c => c.status !== "resolved");
    return filteredComplaints.filter(c => c.status === "resolved");
  }, [filteredComplaints, filter]);

  const openDetail = (id: string) => {
    (navigation as any).navigate("ComplaintDetail", { complaintId: id });
  };

  const Tab = ({ label, value }: { label: string, value: FilterStatus }) => (
    <Pressable 
      onPress={() => setFilter(value)}
      style={{
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: radius.full,
        backgroundColor: filter === value ? colors.primary : colors.surface,
        borderWidth: 1,
        borderColor: filter === value ? colors.primary : colors.border,
      }}
    >
      <Text style={{ 
        color: filter === value ? colors.white : colors.textSecondary,
        fontWeight: "700",
        fontSize: 13
      }}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <WebDashboardLayout>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
        <View style={{ marginBottom: spacing.md, alignItems: "flex-start" }}>
          <Text style={styles.sectionTitle}>متابعة بلاغاتي</Text>
          <Text style={styles.muted}>تتبع حالة بلاغاتك وجدول المعالجة الزمني</Text>
        </View>

        <View style={{ flexDirection: "row", gap: 10, marginBottom: spacing.lg }}>
          <Tab label="الكل" value="all" />
          <Tab label="قيد المعالجة" value="active" />
          <Tab label="تم الحل" value="resolved" />
        </View>

        {finalComplaints.length === 0 ? (
          <View style={{ alignItems: "center", marginTop: 60, paddingHorizontal: 40 }}>
            <View style={{ width: 64, height: 64, borderRadius: radius.full, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Text style={{ fontSize: 32 }}>📁</Text>
            </View>
            <Text style={[styles.cardTitle, { textAlign: "center" }]}>لا توجد بلاغات حالياً</Text>
            <Text style={[styles.muted, { textAlign: "center", marginTop: 8 }]}>
              لم يتم العثور على بلاغات في هذا التصنيف. يمكنك البدء بإخطارنا عن أي مشكلة من شاشة الإبلاغ.
            </Text>
          </View>
        ) : (
          finalComplaints.map((item) => (
            <ComplaintCard key={item.id} item={item} onPress={() => openDetail(item.id)} />
          ))
        )}
      </ScrollView>
    </WebDashboardLayout>
  );
}

