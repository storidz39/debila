import { useNavigation } from "@react-navigation/native";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ComplaintCard } from "../components/ComplaintCard";
import { serviceCategories } from "../data/mock";
import { useComplaints } from "../store/complaints-store";
import { useAuth } from "../store/auth-store";
import { useLanguage } from "../store/language-store-fixed";
import { colors, spacing, radius } from "../theme";
import { screenStyles as styles } from "./styles";

export function HomeScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { complaints } = useComplaints();
  const { t } = useLanguage();
  
  const openDetail = (id: string) => {
    (navigation.getParent() as any)?.navigate("ComplaintDetail", { complaintId: id });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
      {/* Dynamic Header with Greeting */}
      <View style={{ marginBottom: spacing.lg, marginTop: spacing.sm }}>
        <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
          <View>
             <Text style={[styles.sectionTitle, { fontSize: 24, marginBottom: 2 }]}>{t("home.welcome")}، {user?.full_name?.split(" ")[0] || t("home.citizen")}</Text>
             <Text style={[styles.muted, { fontSize: 14 }]}>نحن هنا لخدمتك والاستماع لانشغالاتك</Text>
          </View>
          <Pressable style={styles.profileBadge} onPress={() => navigation.navigate("Profile" as never)}>
             <Ionicons name="person" size={20} color={colors.primary} />
          </Pressable>
        </View>
      </View>

      {/* Statistics Mini Dashboard */}
      <View style={styles.kpiRow}>
        <View style={[styles.kpiCard, { borderRightWidth: 4, borderRightColor: colors.warning }]}>
          <Text style={styles.kpiValue}>{complaints.filter(c => c.status !== "resolved").length}</Text>
          <Text style={styles.muted}>{t("home.active")}</Text>
        </View>
        <View style={[styles.kpiCard, { borderRightWidth: 4, borderRightColor: colors.primary }]}>
          <Text style={styles.kpiValue}>{complaints.filter(c => c.status === "resolved").length}</Text>
          <Text style={styles.muted}>{t("home.resolved")}</Text>
        </View>
      </View>

      {/* Unified Search & Action */}
      <View style={{ marginVertical: spacing.md }}>
        <View style={{ position: "relative" }}>
          <TextInput
            style={styles.search}
            placeholder={t("home.search")}
            placeholderTextColor={colors.muted}
          />
          <View style={{ position: "absolute", left: 16, top: 14 }}>
            <Ionicons name="search" size={20} color={colors.muted} />
          </View>
        </View>
      </View>

      <Pressable 
        style={({ pressed }: any) => [styles.primaryButton, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
        onPress={() => navigation.navigate("Report" as never)}
      >
        <Ionicons name="add-circle" size={24} color={colors.white} />
        <Text style={styles.primaryButtonText}>{t("home.new_report")}</Text>
      </Pressable>

      <View style={{ marginTop: spacing.xl }}>
        <Text style={[styles.sectionTitle, { marginBottom: spacing.md }]}>{t("home.categories")}</Text>
        <View style={styles.grid}>
          {serviceCategories.map((category) => (
            <Pressable key={category.title} style={styles.card}>
              <View style={styles.categoryIconFrame}>
                <Ionicons name={category.icon as any} size={24} color={colors.primary} />
              </View>
              <Text style={styles.cardTitle}>{category.title}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginTop: spacing.xl, marginBottom: spacing.md }}>
        <Text style={styles.sectionTitle}>{t("home.latest")}</Text>
        <Pressable onPress={() => navigation.navigate("Tracking" as never)}>
          <Text style={{ color: colors.primary, fontWeight: "800", fontSize: 13 }}>{t("home.view_all")}</Text>
        </Pressable>
      </View>

      {complaints.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={48} color={colors.border} />
          <Text style={styles.emptyText}>لا توجد بلاغات مسجلة حالياً</Text>
        </View>
      ) : (
        complaints.slice(0, 3).map((item) => (
          <ComplaintCard key={item.id} item={item} onPress={() => openDetail(item.id)} />
        ))
      )}
    </ScrollView>
  );
}

