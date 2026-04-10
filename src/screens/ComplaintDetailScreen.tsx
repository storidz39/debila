import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Platform,
  Pressable,
  useWindowDimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, shadows } from "../theme";
import { Complaint, Message, ComplaintStatus } from "../types";
import { useAuth } from "../store/auth-store";
import { useComplaints } from "../store/complaints-store";
import { WebDashboardLayout } from "../components/layout/WebDashboardLayout";
import type { MainStackParamList } from "../navigation/types";

export function ComplaintDetailScreen() {
  const route = useRoute<RouteProp<MainStackParamList, "ComplaintDetail">>();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { filteredComplaints, updateStatus, sendMessage, refresh } = useComplaints();
  const { complaintId } = route.params;

  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const chatScrollRef = useCallback((node: any) => {
    if (node) {
      setTimeout(() => node.scrollToEnd({ animated: true }), 100);
    }
  }, []);
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  // Find the detail from the store (since it's already partitioned/loaded)
  const detail = filteredComplaints.find(c => c.id === complaintId);

  useEffect(() => {
    if (!detail) refresh();
  }, [complaintId]);

  const handleStatusUpdate = async (status: ComplaintStatus) => {
    setBusy(true);
    try {
      await updateStatus(complaintId, status, "تحديث الحالة من قبل مصلحة المتابعة.");
    } finally {
      setBusy(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    await sendMessage(complaintId, message);
    setMessage("");
  };

  if (!detail) {
    return (
      <WebDashboardLayout>
        <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>
      </WebDashboardLayout>
    );
  }

  const isOfficial = user?.role === "department" || user?.role === "admin";

  return (
    <WebDashboardLayout>
      {/* Image Preview Modal */}
      {selectedImage && (
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalClose} onPress={() => setSelectedImage(null)}>
            <Ionicons name="close-circle" size={40} color={colors.white} />
          </Pressable>
          <Image source={{ uri: selectedImage }} style={styles.fullscreenImage} resizeMode="contain" />
        </View>
      )}

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollArea}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-forward" size={20} color={colors.textPrimary} />
            <Text style={styles.backText}>العودة</Text>
          </Pressable>
          <View style={styles.badgeContainer}>
            <View style={[styles.statusBadge, { backgroundColor: detail.status === 'resolved' ? colors.primary : colors.warning }]}>
              <Text style={styles.statusText}>{detail.status === 'resolved' ? "مُكتمل" : "قيد المعالجة"}</Text>
            </View>
            <Text style={styles.idText}># {detail.id.slice(0, 8)}</Text>
          </View>
        </View>

        <View style={[styles.contentGrid, isMobile && { flexDirection: "column" }]}>
          {/* Main Info Column */}
          <View style={styles.mainCol}>
            <View style={styles.card}>
              <Text style={styles.complaintTitle}>{detail.title}</Text>
              <Text style={styles.complaintDesc}>{detail.description}</Text>
              
              <View style={styles.metaGrid}>
                <View style={styles.metaItem}>
                  <Ionicons name="business-outline" size={16} color={colors.primary} />
                  <Text style={styles.metaLabel}>الهيئة المعنية</Text>
                  <Text style={styles.metaValue}>{detail.assigned_dept}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="location-outline" size={16} color={colors.danger} />
                  <Text style={styles.metaLabel}>الموقع</Text>
                  <Pressable onPress={() => {
                    const latMatch = detail.location.match(/خط العرض:\s*([\d.-]+)/);
                    const lngMatch = detail.location.match(/خط الطول:\s*([\d.-]+)/);
                    if (latMatch && lngMatch) {
                      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${latMatch[1]},${lngMatch[1]}`);
                    } else {
                      if (Platform.OS === 'web') window.alert("الإحداثيات غير متوفرة بشكل دقيق في هذا البلاغ.");
                    }
                  }}>
                    <Text style={[styles.metaValue, { color: colors.primary, textDecorationLine: "underline" }]}>
                      {detail.location}
                    </Text>
                    <Text style={{ fontSize: 10, color: colors.danger, marginTop: 4 }}>اضغط للتوجه عبر GPS</Text>
                  </Pressable>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.metaLabel}>تاريخ التقديم</Text>
                  <Text style={styles.metaValue}>{new Date(detail.created_at).toLocaleDateString("ar-DZ")}</Text>
                </View>
              </View>

              {detail.media_urls && detail.media_urls.length > 0 && (
                <View style={styles.mediaSection}>
                  <Text style={styles.sectionTitle}>المرفقات والتوثيق</Text>
                  <View style={styles.mediaGrid}>
                    {detail.media_urls.map((url, i) => (
                      <Pressable key={i} style={styles.evidenceImageWrapper} onPress={() => setSelectedImage(url)}>
                        <Image source={{ uri: url }} style={styles.evidenceImage} />
                        <View style={styles.evidenceWatermarkWrapper}>
                           <Image source={require("../../assets/icon.png")} style={styles.evidenceWatermarkLogo} resizeMode="contain" />
                        </View>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* Horizontal Tracker */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>متتبع الحالة</Text>
              <View style={styles.horizontalStepper}>
                {[
                  { key: "submitted", icon: "hourglass-outline", label: "قيد الانتظار" },
                  { key: "under_review", icon: "checkmark-outline", label: "تمت الموافقة" },
                  { key: "in_progress", icon: "car-outline", label: "تم الإرسال" },
                  { key: "resolved", icon: "checkmark-done-outline", label: "مكتمل" }
                ].map((step, idx) => {
                  const statuses = ["submitted", "under_review", "in_progress", "resolved"];
                  const currentIndex = statuses.indexOf(detail.status);
                  const stepIndex = statuses.indexOf(step.key);
                  const isActive = stepIndex === currentIndex;
                  const isPast = stepIndex < currentIndex;
                  const isReached = stepIndex <= currentIndex;

                  return (
                    <View key={step.key} style={styles.stepContainer}>
                      <View style={[styles.stepCircle, isReached ? styles.stepCircleActive : styles.stepCircleInactive]}>
                        <Ionicons name={step.icon as any} size={20} color={isReached ? colors.white : colors.muted} />
                      </View>
                      <Text style={[styles.stepLabel, isActive ? styles.stepLabelActive : styles.stepLabelInactive]}>
                        {step.label}
                      </Text>
                      {idx < 3 && (
                        <View style={[styles.stepConnector, stepIndex <= currentIndex - 1 ? styles.stepConnectorActive : styles.stepConnectorInactive]} />
                      )}
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Official History Timeline */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>السجل الزمني الرسمي (Timeline)</Text>
              <View style={styles.timeline}>
                {detail.history.map((step, i) => (
                  <View key={step.id} style={styles.timelineItem}>
                    <View style={styles.timelineMarker}>
                      <View style={[styles.timelineDot, { backgroundColor: i === 0 ? colors.primary : colors.border }]} />
                      {i < detail.history.length - 1 && <View style={styles.timelineLine} />}
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={styles.stepStatus}>{step.note}</Text>
                      <Text style={styles.stepMeta}>{step.actor} • {new Date(step.at).toLocaleString("ar-DZ")}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Reporter Info (Visible to Officials only) */}
            {isOfficial && (
              <View style={[styles.card, { marginTop: spacing.lg, backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={styles.sectionTitle}>معلومات صاحب الطلب</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.lg }}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>الاسم الكامل</Text>
                    <Text style={[styles.metaValue, { fontSize: 14 }]}>{detail.reporter_name || "مواطن مسجل"}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>رقم الهاتف</Text>
                    <Text style={[styles.metaValue, { fontSize: 14 }]}>{detail.reporter_phone || "غير متوفر"}</Text>
                  </View>
                  {detail.reporter_email && (
                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>البريد الإلكتروني</Text>
                      <Text style={[styles.metaValue, { fontSize: 14 }]}>{detail.reporter_email}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>

          {/* Action/Chat Column */}
          <View style={[styles.sideCol, isMobile && { flex: 0 }]}>
            {isOfficial && detail.status !== "resolved" && (
              <View style={[styles.card, styles.actionCard]}>
                <Text style={styles.sectionTitle}>إدارة الطلب</Text>
                <Pressable 
                  style={[styles.resolveBtn, busy && { opacity: 0.7 }]} 
                  onPress={() => handleStatusUpdate("resolved")}
                  disabled={busy}
                >
                  <Ionicons name="checkmark-done-circle" size={20} color={colors.white} style={{ marginLeft: 8 }} />
                  <Text style={styles.resolveText}>تأكيد التسوية والإغلاق</Text>
                </Pressable>
                <Text style={styles.actionHint}>سيؤدي هذا الإجراء إلى إعلام المواطن بنجاح العملية وإغلاق الملف رسمياً.</Text>
              </View>
            )}

            <View style={[styles.card, styles.chatCard, isMobile && { height: 400 }]}>
              <Text style={styles.sectionTitle}>المحادثة المباشرة</Text>
              <ScrollView 
                style={styles.chatScroll}
                ref={chatScrollRef}
              >
                {detail.messages.length === 0 ? (
                   <Text style={styles.emptyChat}>لا توجد رسائل حالياً.</Text>
                ) : (
                  detail.messages.map((m) => (
                    <View key={m.id} style={[styles.msgBubble, m.sender_role === user?.role ? styles.myMsg : styles.otherMsg]}>
                      <Text style={[styles.msgName, m.sender_role !== user?.role && { color: colors.primary }]}>{m.sender_name}</Text>
                      <Text style={[styles.msgText, m.sender_role !== user?.role && { color: colors.textPrimary }]}>{m.text}</Text>
                      <Text style={[styles.msgTime, m.sender_role !== user?.role && { color: colors.muted }]}>{new Date(m.created_at).toLocaleTimeString("ar-DZ")}</Text>
                    </View>
                  ))
                )}
              </ScrollView>
              <View style={styles.inputRow}>
                <TextInput 
                  style={styles.chatInput} 
                  placeholder="اكتب رسالة..." 
                  value={message}
                  onChangeText={setMessage}
                />
                <Pressable style={styles.sendBtn} onPress={handleSendMessage}>
                  <Ionicons name="send" size={20} color={colors.white} />
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </WebDashboardLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollArea: { paddingHorizontal: Platform.OS === 'web' ? spacing.md : 10, paddingVertical: spacing.xl }, // Broaden cards on mobile
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.xl },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 8 },
  backText: { fontSize: 14, fontWeight: "700", color: colors.textPrimary },
  badgeContainer: { flexDirection: "row", alignItems: "center", gap: 12 },
  statusBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: radius.full },
  statusText: { color: colors.white, fontSize: 12, fontWeight: "800" },
  idText: { fontSize: 12, color: colors.muted, fontWeight: "600", fontFamily: Platform.OS === 'web' ? 'monospace' : undefined },

  contentGrid: { flexDirection: "row", gap: spacing.lg },
  mainCol: { flex: 2, gap: spacing.lg },
  sideCol: { flex: 1, gap: spacing.lg },

  card: { backgroundColor: colors.surface, padding: spacing.xl, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, ...shadows.sm },
  actionCard: { backgroundColor: colors.accentSoft, borderColor: colors.primary + '30' },
  chatCard: { height: 500, flexDirection: "column" },

  complaintTitle: { fontSize: 22, fontWeight: "900", color: colors.primary, textAlign: "right", marginBottom: spacing.md },
  complaintDesc: { fontSize: 15, color: colors.textPrimary, lineHeight: 24, textAlign: "right", marginBottom: spacing.xl },
  
  metaGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md, borderTopWidth: 1, borderTopColor: colors.background, paddingTop: spacing.xl },
  metaItem: { alignItems: "flex-end", gap: 4, width: "100%", maxWidth: Platform.OS === 'web' ? 280 : "100%", marginBottom: spacing.md },
  metaLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: "700", textAlign: "right" },
  metaValue: { fontSize: 13, fontWeight: "800", color: colors.textPrimary, flexWrap: "wrap", textAlign: "right", width: "100%" },

  sectionTitle: { fontSize: 16, fontWeight: "800", color: colors.primary, textAlign: "right", marginBottom: spacing.lg },
  mediaSection: { marginTop: spacing.xl },
  mediaGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  evidenceImageWrapper: { width: "48%", height: 180, borderRadius: radius.sm, backgroundColor: colors.background, overflow: "hidden", position: "relative" },
  evidenceImage: { width: "100%", height: "100%", position: "absolute" },
  evidenceWatermarkWrapper: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", backgroundColor: 'rgba(255,255,255,0.15)' },
  evidenceWatermarkLogo: { width: 100, height: 100, opacity: 0.35 },

  timeline: { paddingRight: 10 },
  timelineItem: { flexDirection: "row", gap: spacing.lg, marginBottom: spacing.lg },
  timelineMarker: { alignItems: "center", width: 16 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, zIndex: 1 },
  timelineLine: { width: 2, flex: 1, backgroundColor: colors.border, marginVertical: 2 },
  timelineContent: { flex: 1, alignItems: "flex-start", paddingBottom: 10 },
  stepStatus: { fontSize: 14, fontWeight: "700", color: colors.textPrimary, marginBottom: 2, textAlign: "right" },
  stepMeta: { fontSize: 11, color: colors.muted, fontWeight: "600", textAlign: "right" },

  chatScroll: { flex: 1, marginBottom: spacing.md },
  emptyChat: { textAlign: "center", color: colors.muted, fontSize: 13, marginTop: 40 },
  msgBubble: { padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.sm, maxWidth: "85%" },
  myMsg: { alignSelf: "flex-start", backgroundColor: "#1e5b4b", borderBottomRightRadius: 0 },
  otherMsg: { alignSelf: "flex-end", backgroundColor: "#f1f5f9", borderBottomLeftRadius: 0, borderWidth: 1, borderColor: colors.border },
  msgName: { fontSize: 11, fontWeight: "700", marginBottom: 4, textAlign: "right", color: "#a7f3d0" },
  msgText: { fontSize: 14, textAlign: "right", fontWeight: "600", color: "#ffffff" },
  msgTime: { fontSize: 10, marginTop: 6, textAlign: "left", color: "rgba(255,255,255,0.7)" },
  
  inputRow: { flexDirection: "row", gap: spacing.sm, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.background },
  chatInput: { flex: 1, backgroundColor: colors.background, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 8, textAlign: "right", fontSize: 13 },
  sendBtn: { width: 40, height: 40, borderRadius: radius.sm, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },

  resolveBtn: { flexDirection: "row", backgroundColor: colors.primary, padding: spacing.md, borderRadius: radius.sm, alignItems: "center", justifyContent: "center", marginBottom: spacing.sm, gap: 8 },
  resolveText: { color: colors.white, fontWeight: "800", fontSize: 14 },
  actionHint: { fontSize: 11, color: colors.textSecondary, textAlign: "center", fontWeight: "500" },

  horizontalStepper: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", paddingVertical: spacing.md, paddingHorizontal: 0 },
  stepContainer: { alignItems: "center", flex: 1, position: "relative" },
  stepCircle: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", zIndex: 2 },
  stepCircleActive: { backgroundColor: colors.primary },
  stepCircleInactive: { backgroundColor: colors.background, borderWidth: 2, borderColor: colors.border },
  stepLabel: { fontSize: 10, marginTop: 8, textAlign: "center", fontWeight: "700", width: 60 },
  stepLabelActive: { color: colors.primary },
  stepLabelInactive: { color: colors.muted },
  stepConnector: { position: "absolute", top: 18, left: "-50%", width: "100%", height: 2, zIndex: 1 },
  stepConnectorActive: { backgroundColor: colors.primary },
  stepConnectorInactive: { backgroundColor: colors.border },
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 99999, justifyContent: "center", alignItems: "center" },
  modalClose: { position: "absolute", top: 40, right: 20, zIndex: 100000 },
  fullscreenImage: { width: "95%", height: "80%" },
});
