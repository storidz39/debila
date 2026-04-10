import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, shadows } from "../theme";
import { useAuth } from "../store/auth-store";

export function AppHeader() {
  const { user } = useAuth();
  
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.actions}>
          <Pressable style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
            <View style={styles.badge} />
          </Pressable>
          <Pressable style={styles.iconButton}>
            <Ionicons name="person-circle-outline" size={26} color={colors.textPrimary} />
          </Pressable>
        </View>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Ionicons name="shield-checkmark" size={24} color={colors.white} />
          </View>
          <View>
            <Text style={styles.title}>منصة بادر</Text>
            <Text style={styles.subtitle}>بوابة المواطن الرقمية الموحدة</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: spacing.md,
    ...shadows.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.primary,
    textAlign: "right",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "right",
    marginTop: -2,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
    borderWidth: 2,
    borderColor: colors.white,
  },
});
