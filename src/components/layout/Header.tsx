import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, shadows } from "../../theme";
import { useAuth } from "../../store/auth-store";
import { useComplaints } from "../../store/complaints-store";
import { useNavigation } from "@react-navigation/native";
import { useWindowDimensions } from "react-native";

interface Props {
  title?: string;
  onMenuPress?: () => void;
}

export function Header({ title, onMenuPress }: Props) {
  const { user } = useAuth();
  const { filteredComplaints } = useComplaints();
  const navigation = useNavigation();
  const [showNotifications, setShowNotifications] = useState(false);

  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  // Derive dynamic mock notifications based on role
  const isOfficial = user?.role === "admin" || user?.role === "department";
  const recentNotifications = isOfficial 
    ? filteredComplaints.filter(c => c.status === "submitted").slice(0, 3) 
    : filteredComplaints.filter(c => c.history.length > 0).slice(0, 3);

  return (
    <View style={styles.container}>
      {/* Right: User Profile & Notifications */}
      <View style={styles.rightSection}>
        <Pressable style={styles.userProfile} onPress={() => (navigation as any).navigate("Profile")}>
          <View style={styles.avatar}>
            <Ionicons name="person-circle-outline" size={32} color={colors.primary} />
          </View>
          {!isMobile && (
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.full_name || "اسم المستخدم"}</Text>
              <Text style={styles.userType}>{user?.role === "admin" ? "مدير النظام" : user?.role === "department" ? "حساب إداري" : "حساب مواطن"}</Text>
            </View>
          )}
        </Pressable>
        
        <View style={styles.divider} />

        <View style={styles.relativeWrapper}>
          <Pressable style={styles.actionIcon} onPress={() => setShowNotifications(!showNotifications)}>
            <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
            <View style={styles.badge} />
          </Pressable>

          {showNotifications && (
            <View style={styles.dropdown}>
              <View style={styles.dropdownHeaderArea}>
                <Text style={styles.dropdownHeaderTitle}>الإشعارات ({recentNotifications.length})</Text>
              </View>
              
              {recentNotifications.length === 0 ? (
                 <Text style={{ textAlign: "center", padding: spacing.xl, color: colors.muted, fontSize: 13 }}>لا توجد إشعارات حديثة</Text>
              ) : (
                 recentNotifications.map(notif => (
                    <Pressable 
                       key={notif.id} 
                       style={styles.dropdownItem} 
                       onPress={() => { setShowNotifications(false); (navigation as any).navigate("ComplaintDetail", { complaintId: notif.id }) }}
                    >
                      <View style={[styles.dropdownIconBox, { backgroundColor: isOfficial ? 'rgba(0, 98, 51, 0.1)' : 'rgba(59, 130, 246, 0.1)' }]}>
                        <Ionicons name={isOfficial ? "document-text" : "notifications"} size={16} color={isOfficial ? colors.primary : colors.textPrimary} />
                      </View>
                      <View style={styles.dropdownTextInfo}>
                        <Text style={styles.dropdownItemTitle}>{notif.title}</Text>
                        <Text style={styles.dropdownItemSub}>{isOfficial ? `بلاغ جديد رقم ${notif.id}` : `تحديث حالة البلاغ الخاص بك`}</Text>
                      </View>
                      <Text style={styles.dropdownTime}>{new Date(notif.created_at).toLocaleDateString("ar-DZ")}</Text>
                    </Pressable>
                 ))
              )}

              <Pressable 
                style={styles.dropdownFooterBtn}
                onPress={() => {
                   setShowNotifications(false);
                   (navigation as any).navigate(isOfficial ? "Alerts" : "Tracking");
                }}
              >
                <Text style={styles.dropdownFooterText}>عرض جميع التنبيهات</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>

      {/* Center: Dynamic Title + Back Button */}
      <View style={styles.centerSection}>
        <Text style={styles.headerTitle}>{title || "بادر"}</Text>
        {navigation.canGoBack() && (
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
             <Ionicons name="arrow-forward" size={18} color={colors.primary} />
             <Text style={styles.backButtonText}>رجوع</Text>
          </Pressable>
        )}
      </View>

      {/* Left: Search or Menu */}
      <View style={styles.leftSection}>
        {onMenuPress ? (
          <Pressable onPress={onMenuPress} style={styles.menuBtn}>
            <Ionicons name="menu" size={32} color={colors.primary} />
          </Pressable>
        ) : (
          <View style={styles.searchBox}>
            <TextInput 
              placeholder="البحث عن معاملة أو بلاغ..."
              style={styles.searchInput}
              placeholderTextColor={colors.muted}
            />
            <Ionicons name="search-outline" size={18} color={colors.muted} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 64,
    backgroundColor: colors.surface,
    flexDirection: "row", // RTL natural flow Document
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 100,
  },
  rightSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  userProfile: {
    flexDirection: "row",
    alignItems: "center",
  },
  userInfo: {
    marginRight: spacing.sm,
    alignItems: "flex-start", // Under dir=rtl, flex-start is Right. Wait, flex-start corresponds to logical start. So it depends! Better use align-items: "stretch" or just leave it out if not needed. But we'll leave it out, text-align helps.
  },
  userName: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textPrimary,
    textAlign: "right",
  },
  userType: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "700",
    textAlign: "right",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
  },
  actionIcon: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.danger,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  relativeWrapper: {
    position: "relative",
  },
  dropdown: {
    position: "absolute",
    top: 40,
    right: 0,
    width: 320,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.lg,
    zIndex: 9999,
  },
  dropdownHeaderArea: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  dropdownHeaderTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textPrimary,
    textAlign: "right",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  dropdownIconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.md, // RTL Margin
  },
  dropdownTextInfo: {
    flex: 1,
    alignItems: "flex-start",
  },
  dropdownItemTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.textPrimary,
    textAlign: "right",
  },
  dropdownItemSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: "right",
  },
  dropdownTime: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: "600",
  },
  dropdownFooterBtn: {
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    borderBottomLeftRadius: radius.md,
    borderBottomRightRadius: radius.md,
  },
  dropdownFooterText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  centerSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.textPrimary,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    gap: 4,
  },
  backButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  leftSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  searchBox: {
    flexDirection: "row",
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 40,
    alignItems: "center",
    width: 250,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuBtn: {
    padding: spacing.sm,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
  },
  searchInput: {
    flex: 1,
    textAlign: "right", // Arabic text
    fontSize: 14,
    color: colors.textPrimary,
    marginLeft: 10, // Margin on the side opposite to the icon
    fontWeight: "600",
  },
});
