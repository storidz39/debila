import React from "react";
import { View, Text, StyleSheet, Pressable, Image, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../../theme";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "../../store/auth-store";
import { useLanguage } from "../../store/language-store-fixed";
import { UserRole } from "../../types";

type NavItem = {
  id: string;
  label: string;
  icon: string;
  roles: UserRole[];
};

export function Sidebar() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  
  const NAV_ITEMS: NavItem[] = [
    { id: "Home", label: user?.role === "citizen" ? t("nav.home") : user?.role === "department" ? t("sidebar.dept_home") : t("sidebar.admin_home"), icon: user?.role === "citizen" ? "home-outline" : user?.role === "department" ? "pie-chart-outline" : "analytics-outline", roles: ["citizen", "department", "admin"] },
    { id: "Report", label: t("nav.report"), icon: "add-circle-outline", roles: ["citizen"] },
    { id: "Tracking", label: t("nav.tracking"), icon: "document-text-outline", roles: ["citizen"] },
    { id: "Admin", label: user?.role === "department" ? t("sidebar.dept_admin") : t("sidebar.admin_mgnt"), icon: user?.role === "department" ? "list-outline" : "business-outline", roles: ["department", "admin"] },
    { id: "AdminNew", label: t("sidebar.dept_new"), icon: "alert-circle-outline", roles: ["department"] },
    { id: "AdminResolved", label: t("sidebar.dept_done"), icon: "checkmark-done-circle-outline", roles: ["department"] },
    { id: "Mailbox", label: t("sidebar.dept_mail"), icon: "mail-unread-outline", roles: ["department"] },
    { id: "Alerts", label: t("sidebar.dept_alerts"), icon: "notifications-outline", roles: ["department"] },
    { id: "Stats", label: t("sidebar.admin_stats"), icon: "pie-chart-outline", roles: ["admin"] },
    { id: "Profile", label: t("nav.profile"), icon: "person-outline", roles: ["citizen", "department", "admin"] },
    { id: "Settings", label: t("sidebar.shared_settings"), icon: "settings-outline", roles: ["citizen", "department", "admin"] },
  ];
  
  const filteredNavItems = NAV_ITEMS.filter(item => 
    item.roles.includes(user?.role || "citizen")
  );

  return (
    <View style={styles.container}>
      <Pressable style={styles.brandWrapper} onPress={() => navigation.navigate("Home" as never)}>
        <Image 
          source={require("../../../assets/icon.png")} 
          style={styles.largeLogo} 
          resizeMode="cover"
        />
      </Pressable>

      <View style={styles.separator} />

      {/* Navigation - Role Based */}
      <View style={styles.navigation}>
        {filteredNavItems.map((item) => {
          const isActive = route.name === item.id;
          return (
            <Pressable
              key={item.id}
              style={({ hovered }: any) => [
                styles.navItem, 
                isActive && styles.navItemActive,
                hovered && !isActive && styles.navItemHover
              ]}
              onPress={() => navigation.navigate(item.id as never)}
            >
              {isActive && <View style={styles.activeMarker} />}
              <Ionicons
                name={item.icon as any}
                size={20}
                color={isActive ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.navText, isActive && styles.navTextActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Official Sidebar Footer */}
      <View style={styles.footer}>
        <Pressable 
          style={styles.logoutBtn} 
          onPress={() => {
            if (Platform.OS === 'web') {
              if (window.confirm("هل أنت متأكد من تسجيل الخروج من النظام الرسمي؟")) logout();
            } else {
               logout();
            }
          }}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.logoutLabel}>{t("profile.logout")}</Text>
        </Pressable>
        <Text style={styles.versionInfo}>{t("sidebar.footer")} • 2026</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 280,
    backgroundColor: colors.surface,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    height: "100%",
    paddingVertical: spacing.xl,
  },
  brandWrapper: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 0,
    paddingVertical: 0,
    marginBottom: spacing.md,
    width: "100%",
  },
  largeLogo: {
    width: "100%",
    height: 120,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  navigation: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  navItem: {
    flexDirection: "row", // Standard flow
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginBottom: 4,
    gap: 12,
    position: "relative",
  },
  navItemActive: {
    backgroundColor: "rgba(0, 98, 51, 0.08)",
  },
  navItemHover: {
    backgroundColor: colors.background,
  },
  navText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textSecondary,
    textAlign: "right",
    flex: 1,
  },
  navTextActive: {
    color: colors.primary,
    fontWeight: "800",
  },
  activeMarker: {
    position: "absolute",
    right: 0, // Align right works perfectly since sidebar is on the right
    width: 4,
    height: "80%",
    backgroundColor: colors.primary,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 8,
    marginBottom: spacing.sm,
  },
  logoutLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.danger,
    textAlign: "right",
    flex: 1,
  },
  versionInfo: {
    fontSize: 10,
    color: colors.muted,
    textAlign: "right",
    marginTop: 8,
    fontWeight: "500",
  },
});
