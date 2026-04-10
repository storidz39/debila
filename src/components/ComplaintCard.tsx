import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Complaint } from "../types";
import { statusColors, statusLabels } from "../data/mock";
import { colors, spacing, radius, shadows } from "../theme";

export function ComplaintCard({
  item,
  onPress,
}: {
  item: Complaint;
  onPress?: () => void;
}) {
  const statusBg = item.status === "resolved" ? "#D1FAE5" : 
                    item.status === "in_progress" ? "#FEF3C7" : 
                    "#FEE2E2";
  
  const statusIcon = item.status === "resolved" ? "checkmark-circle" : 
                      item.status === "in_progress" ? "time" : 
                      "alert-circle";

  const content = (
    <View style={styles.inner}>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: statusBg }]}>
          <Ionicons name={statusIcon as any} size={14} color={statusColors[item.status]} />
          <Text style={[styles.statusText, { color: statusColors[item.status] }]}>
            {statusLabels[item.status]}
          </Text>
        </View>
        <Text style={styles.id}>{item.id}</Text>
      </View>
      
      <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
      
      <View style={styles.footer}>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{item.department}</Text>
          <Ionicons name="business-outline" size={14} color={colors.muted} />
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{item.location}</Text>
          <Ionicons name="location-outline" size={14} color={colors.muted} />
        </View>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable 
        onPress={onPress} 
        style={({ pressed }) => [
          styles.card, 
          pressed && styles.pressed
        ]}
      >
        {content}
      </Pressable>
    );
  }
  return <View style={styles.card}>{content}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.6)",
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  inner: {
    padding: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  id: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    fontFamily: "monospace",
  },
  badge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "800",
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "right",
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.background,
    paddingTop: spacing.sm,
  },
  metaRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "500",
  },
});

