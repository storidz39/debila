import { useState, useMemo } from "react";
import { 
  ScrollView, 
  Text, 
  View, 
  Pressable, 
  ImageBackground, 
  StyleSheet, 
  Dimensions 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { statusColors, statusLabels } from "../data/mock";
import { useComplaints } from "../store/complaints-store";
import { colors, spacing, radius, shadows } from "../theme";
import { screenStyles as styles } from "./styles";
import { Complaint, ComplaintStatus } from "../types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function MapScreen() {
  const navigation = useNavigation();
  const { complaints } = useComplaints();
  const [selected, setSelected] = useState<Complaint | null>(null);

  // خوارزمية بسيطة لمحاكاة توزيع البلاغات على خريطة وهمية
  // في التطبيق الحقيقي سنستخدم إحداثيات حقيقية و مكتبة مثل Leaflet أو Google Maps
  const mappedComplaints = useMemo(() => {
    return complaints.map((c, i) => {
      // محاكاة إحداثيات نسبية لتوزيعها بشكل جمالي على المساحة
      const x = 10 + (i * 27) % 80;
      const y = 15 + (i * 19) % 70;
      return { ...c, x: `${x}%`, y: `${y}%` };
    });
  }, [complaints]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Map Header */}
      <View style={mapStyles.header}>
        <Text style={[styles.sectionTitle, { marginTop: 0 }]}>الخريطة التفاعلية</Text>
        <Text style={[styles.muted, { marginTop: 0 }]}>عرض حي لجميع البلاغات المسجلة في منطقتك</Text>
      </View>

      {/* Map Canvas */}
      <View style={mapStyles.mapContainer}>
        <ImageBackground 
          source={{ uri: "https://api.placeholder.com/1200/800?text=City+Map+Infrastructure" }}
          style={mapStyles.mapImage}
          imageStyle={{ opacity: 0.2, tintColor: colors.primary }}
        >
          {/* Grid lines for professional look */}
          <View style={mapStyles.gridLayer} />
          
          {mappedComplaints.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => setSelected(item)}
              style={[
                mapStyles.pin, 
                { left: item.x as any, top: item.y as any },
                selected?.id === item.id && mapStyles.pinSelected
              ]}
            >
              <View style={[mapStyles.pinContent, { backgroundColor: statusColors[item.status as ComplaintStatus] }]}>
                <Ionicons 
                  name={item.status === "resolved" ? "checkmark" : "alert"} 
                  size={12} 
                  color={colors.white} 
                />
              </View>
              {selected?.id === item.id && <View style={[mapStyles.pinPulse, { borderColor: statusColors[item.status as ComplaintStatus] }]} />}
            </Pressable>
          ))}
        </ImageBackground>

        {/* Legend */}
        <View style={mapStyles.legend}>
          {Object.entries(statusLabels).map(([key, label]) => (
            <View key={key} style={mapStyles.legendItem}>
              <View style={[mapStyles.legendDot, { backgroundColor: statusColors[key as ComplaintStatus] }]} />
              <Text style={mapStyles.legendText}>{label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Selected Info Card */}
      {selected && (
        <View style={mapStyles.bottomSheet}>
          <View style={mapStyles.sheetHeader}>
            <View style={{ flex: 1 }}>
              <Text style={mapStyles.sheetId}>{selected.id}</Text>
              <Text style={mapStyles.sheetTitle} numberOfLines={1}>{selected.title}</Text>
            </View>
            <Pressable onPress={() => setSelected(null)}>
              <Ionicons name="close-circle" size={24} color={colors.muted} />
            </Pressable>
          </View>
          <View style={mapStyles.sheetMeta}>
            <View style={mapStyles.metaItem}>
              <Ionicons name="business-outline" size={14} color={colors.muted} />
              <Text style={mapStyles.metaText}>{selected.department}</Text>
            </View>
            <View style={mapStyles.metaItem}>
              <Ionicons name="time-outline" size={14} color={colors.muted} />
              <Text style={mapStyles.metaText}>{statusLabels[selected.status as ComplaintStatus]}</Text>
            </View>
          </View>
          <Pressable style={styles.primaryButton} onPress={() => (navigation as any).navigate("ComplaintDetail", { complaintId: selected.id })}>
            <Text style={styles.primaryButtonText}>عرض التفاصيل الكاملة</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const mapStyles = StyleSheet.create({
  header: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    ...shadows.sm,
    zIndex: 10,
  },
  mapContainer: {
    flex: 1,
    overflow: "hidden",
  },
  mapImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F1F5F9",
  },
  gridLayer: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 0.5,
    borderColor: "rgba(15, 23, 42, 0.05)",
    // Simulated grid
  },
  pin: {
    position: "absolute",
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },
  pinSelected: {
    zIndex: 10,
    transform: [{ scale: 1.2 }],
  },
  pinContent: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.white,
    ...shadows.sm,
  },
  pinPulse: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    opacity: 0.4,
  },
  legend: {
    position: "absolute",
    bottom: spacing.md,
    right: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: radius.md,
    ...shadows.md,
    gap: 8,
  },
  legendItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.md,
    elevation: 20,
    zIndex: 20,
  },
  sheetHeader: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  sheetId: {
    fontSize: 10,
    color: colors.muted,
    fontWeight: "700",
    textAlign: "right",
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.primary,
    textAlign: "right",
  },
  sheetMeta: {
    flexDirection: "row-reverse",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  metaItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "600",
  }
});
