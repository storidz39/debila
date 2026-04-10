import { ScrollView, Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../theme";
import { screenStyles as styles } from "./styles";

export function NotificationsScreen() {
  const notifications = [
    {
      id: "1",
      title: "تحديث على البلاغ #RPT-1021",
      body: "تغيرت حالة بلاغك إلى 'قيد المعالجة الميدانية'. سيتم إبلاغك بأي مستجدات.",
      time: "منذ دقيقتين",
      type: "update",
      unread: true,
    },
    {
      id: "2",
      title: "تم حل البلاغ #RPT-0985",
      body: "نشكرك لمساهمتك. تم إغلاق البلاغ بنجاح بعد معالجة المشكلة.",
      time: "منذ ساعة",
      type: "success",
      unread: false,
    },
    {
      id: "3",
      title: "تنبيه عام: صيانة مجدولة",
      body: "ستجرى أعمال صيانة في حي الياسمين غداً من الساعة 10 صباحاً.",
      time: "منذ 3 ساعات",
      type: "alert",
      unread: false,
    },
  ];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
      <View style={{ marginBottom: spacing.md }}>
        <Text style={styles.sectionTitle}>مركز التنبيهات</Text>
        <Text style={styles.muted}>تابع أحدث المستجدات والإشعارات الخاصة ببلاغاتك</Text>
      </View>

      {notifications.map((item) => (
        <Pressable key={item.id} style={[styles.notificationCard, !item.unread && { borderRightColor: colors.border }]}>
          <View style={{ 
            width: 40, 
            height: 40, 
            borderRadius: radius.md, 
            backgroundColor: item.type === "success" ? colors.success + "15" : item.type === "alert" ? colors.danger + "15" : colors.accent + "15",
            alignItems: "center", 
            justifyContent: "center" 
          }}>
            <Ionicons 
              name={item.type === "success" ? "checkmark-circle" : item.type === "alert" ? "warning" : "information-circle"} 
              size={22} 
              color={item.type === "success" ? colors.success : item.type === "alert" ? colors.danger : colors.accent} 
            />
          </View>
          
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
              <Text style={[styles.cardTitle, { fontSize: 14, fontWeight: "800" }]}>{item.title}</Text>
              {item.unread && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent }} />}
            </View>
            <Text style={[styles.muted, { textAlign: "right", marginTop: 0, fontSize: 12, lineHeight: 18 }]} numberOfLines={2}>
              {item.body}
            </Text>
            <Text style={{ textAlign: "right", fontSize: 10, color: colors.muted, marginTop: 6, fontWeight: "600" }}>{item.time}</Text>
          </View>
        </Pressable>
      ))}

      {notifications.length === 0 && (
        <View style={{ alignItems: "center", marginTop: 100 }}>
          <Ionicons name="notifications-off-outline" size={60} color={colors.border} />
          <Text style={[styles.muted, { marginTop: 16 }]}>لا توجد تنبيهات جديدة حالياً</Text>
        </View>
      )}
    </ScrollView>
  );
}

