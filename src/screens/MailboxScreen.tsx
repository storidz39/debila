import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WebDashboardLayout } from "../components/layout/WebDashboardLayout";
import { colors, spacing, radius, shadows } from "../theme";

export function MailboxScreen() {
  return (
    <WebDashboardLayout>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>سجل البريد الداخلي</Text>
          <Text style={styles.subtitle}>المراسلات الرسمية والاتصالات الإدارية مع الهيئات والمواطنين</Text>
        </View>

        <View style={styles.emptyBox}>
          <Ionicons name="mail-open-outline" size={48} color={colors.border} />
          <Text style={styles.emptyText}>صندوق البريد فارغ حالياً.</Text>
        </View>
      </ScrollView>
    </WebDashboardLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    flexGrow: 1,
  },
  header: {
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.primary,
    textAlign: "right",
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600",
    marginTop: 4,
    textAlign: "right",
  },
  emptyBox: {
    padding: spacing.huge,
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    flex: 1,
  },
  emptyText: {
    color: colors.muted,
    fontWeight: "700",
    marginTop: 12,
  },
});
