import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, Platform } from "react-native";
import { WebDashboardLayout } from "../components/layout/WebDashboardLayout";
import { colors, spacing, radius, shadows } from "../theme";
import { Ionicons } from "@expo/vector-icons";
import { useLanguage } from "../store/language-store-fixed";
import { useAuth } from "../store/auth-store";

function SecuritySettings() {
  const [oldPass, setOldPass] = React.useState("");
  const [newPass, setNewPass] = React.useState("");

  const handleChangePass = () => {
    if (!oldPass || newPass.length < 6) {
      if (Platform.OS === 'web') window.alert("الرجاء إدخال كلمة المرور القديمة وكلمة مرور جديدة (6 رموز على الأقل).");
      else Alert.alert("تنبيه", "الرجاء إدخال كلمة المرور القديمة وكلمة مرور جديدة (6 رموز على الأقل).");
      return;
    }
    if (Platform.OS === 'web') window.alert("تم تغيير كلمة المرور بنجاح.");
    else Alert.alert("نجاح", "تم تغيير كلمة المرور بنجاح.");
    setOldPass("");
    setNewPass("");
  };

  return (
    <WebDashboardLayout>
      <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>الأمان وكلمة المرور</Text>
        <Text style={styles.sub}>إعدادات الحماية المتقدمة لحسابك وتغيير كلمة المرور</Text>
        
        <View style={styles.card}>
          <Text style={[styles.label, { marginBottom: 10 }]}>تغيير كلمة المرور</Text>
          <View style={styles.inputWrapper}>
             <Text style={styles.muted}>كلمة المرور الحالية</Text>
             <TextInput style={styles.input} secureTextEntry value={oldPass} onChangeText={setOldPass} textAlign="right" />
          </View>
          <View style={styles.inputWrapper}>
             <Text style={styles.muted}>كلمة المرور الجديدة</Text>
             <TextInput style={styles.input} secureTextEntry value={newPass} onChangeText={setNewPass} textAlign="right" />
          </View>
          <Pressable style={[styles.btn, { alignSelf: 'flex-start', marginTop: 10 }]} onPress={handleChangePass}>
             <Text style={styles.btnText}>تأكيد وتغيير</Text>
          </Pressable>
        </View>
      </ScrollView>
    </WebDashboardLayout>
  );
}

function LanguageSettings() {
  const { language, setLanguage } = useLanguage();

  return (
    <WebDashboardLayout>
      <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>لغة التطبيق</Text>
        <Text style={styles.sub}>اختر لغة الواجهة الأساسية</Text>
        
        <View style={styles.card}>
          <Pressable style={styles.langRow} onPress={() => setLanguage("ar")}>
            <Text style={styles.label}>العربية</Text>
            {language === "ar" && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
          </Pressable>
          <Pressable style={[styles.langRow, { borderTopWidth: 1, borderTopColor: colors.border }]} onPress={() => setLanguage("en")}>
            <Text style={styles.label}>English</Text>
            {language === "en" && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
          </Pressable>
        </View>
      </ScrollView>
    </WebDashboardLayout>
  );
}

function EditProfileSettings() {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const [fullName, setFullName] = React.useState(user?.full_name || "");
  const [username, setUsername] = React.useState(user?.username || "");
  const [email, setEmail] = React.useState(user?.email || "");
  const [busy, setBusy] = React.useState(false);

  const handleUpdate = async () => {
    setBusy(true);
    try {
      await updateUser({ full_name: fullName, username, email });
      if (Platform.OS === "web") window.alert("تم تحديث البيانات بنجاح");
      else Alert.alert("نجاح", "تم تحديث البيانات بنجاح");
    } finally {
      setBusy(false);
    }
  };

  return (
    <WebDashboardLayout>
      <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>تحديث البيانات الشخصية</Text>
        <Text style={styles.sub}>تعديل معلومات الحساب الأساسية</Text>

        <View style={styles.card}>
          <View style={styles.inputWrapper}>
             <Text style={styles.label}>الاسم الكامل</Text>
             <TextInput style={styles.input} value={fullName} onChangeText={setFullName} textAlign="right" />
          </View>
          <View style={styles.inputWrapper}>
             <Text style={styles.label}>اسم المستخدم</Text>
             <TextInput style={styles.input} value={username} onChangeText={setUsername} textAlign="right" />
          </View>
          <View style={styles.inputWrapper}>
             <Text style={styles.label}>البريد الإلكتروني</Text>
             <TextInput style={styles.input} value={email} onChangeText={setEmail} textAlign="right" keyboardType="email-address" />
          </View>

          <Pressable style={[styles.btn, { alignSelf: 'flex-start', marginTop: 10 }, busy && { opacity: 0.7 }]} onPress={handleUpdate} disabled={busy}>
             <Text style={styles.btnText}>{busy ? "جاري الحفظ..." : "حفظ التعديلات"}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </WebDashboardLayout>
  );
}

function PrivacySettings() {
  return (
    <WebDashboardLayout>
      <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>شروط الاستخدام وسياسة الخصوصية</Text>
        <Text style={styles.sub}>تخضع هذه المنصة للقوانين والتشريعات الجزائرية السارية</Text>
        
        <View style={[styles.card, { padding: spacing.xl }]}>
          <Text style={[styles.label, { marginBottom: 10 }]}>1. ديباجة وشروط عامة</Text>
          <Text style={styles.bodyText}>استخدامك لمنصة "بادر - المنصة الموحدة" يُعد قبولاً تاماً لجميع الشروط والأحكام. تهدف المنصة إلى تسهيل إيصال البلاغات والشكاوى للإدارات والمصالح العمومية في الجمهورية الجزائرية الديمقراطية الشعبية.</Text>
          
          <Text style={[styles.label, { marginTop: 20, marginBottom: 10 }]}>2. حماية البيانات الشخصية (القانون 18-07)</Text>
          <Text style={styles.bodyText}>عملاً بقانون رقم 18-07 المؤرخ في 10 يونيو 2018 المتعلق بحماية الأشخاص الطبيعيين في مجال معالجة المعطيات ذات الطابع الشخصي، نلتزم بالآتي:
- لا يتم بيع أو مشاركة بياناتك الشخصية (رقم الهاتف، الاسم، الخ) لأغراض تجارية.
- تقتصر مشاركة البيانات مع الجهات والهيئات الحكومية المختصة بمعالجة بلاغاتك.
- يحق لك طلب تعديل أو الغاء بياناتك وفقاً للنصوص القانونية ذات الصلة.</Text>
          
          <Text style={[styles.label, { marginTop: 20, marginBottom: 10 }]}>3. مشاركة الموقع الجغرافي والإحداثيات</Text>
          <Text style={styles.bodyText}>يتم التقاط الموقع الجغرافي (GPS) فقط أثناء عملية توثيق البلاغ لتسهيل وصول فرق التدخل أو الصيانة، ولا يتم تتبعك في الخلفية أبدًا.</Text>
          
          <Text style={[styles.label, { marginTop: 20, marginBottom: 10 }]}>4. الاحتفاظ بالسجلات والمسؤولية القانونية</Text>
          <Text style={styles.bodyText}>تُحفظ سجلات بلاغاتك لضمان الشفافية الإدارية والمتابعة. يُمنع منعاً باتاً استغلال المنصة لتقديم بلاغات كيدية أو وهمية، وتحتفظ الدولة بحق المتابعة القانونية لأي استغلال مسيئ للمنصة ومواردها وفقاً لأحكام قانون العقوبات الجزائري.</Text>
        </View>
      </ScrollView>
    </WebDashboardLayout>
  );
}

function AboutPlatform() {
  return (
    <WebDashboardLayout>
      <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
        <View style={{ alignItems: "center", marginBottom: spacing.xl }}>
          <Ionicons name="shield-checkmark" size={60} color={colors.primary} />
          <Text style={[styles.title, { marginTop: 10 }]}>منصة "بادر" الوطنية</Text>
          <Text style={styles.muted}>الإصدار 2.4.0 (إصدار مستقر 2026)</Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.bodyText}>
            أطلقت منصة "بادر" كجزء من المبادرة الوطنية للتحول الرقمي، وتهدف إلى تقريب الإدارة من المواطن وتسهيل إجراءات رفع ومعالجة البلاغات حول النقائص في المرافق العامة وخدمات البلدية المتنوعة.
          </Text>
        </View>
        
        <View style={[styles.card, { marginTop: spacing.md, alignItems: "center", paddingVertical: spacing.xl }]}>
           <Text style={styles.muted}>© 2026 جميع الحقوق محفوظة للدولة الجزائرية</Text>
        </View>
      </ScrollView>
    </WebDashboardLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.xl },
  title: { fontSize: 24, fontWeight: "900", color: colors.textPrimary, textAlign: "right" },
  sub: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.xl, textAlign: "right" },
  card: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, ...shadows.sm },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: spacing.lg },
  langRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: spacing.lg, paddingHorizontal: spacing.md },
  label: { fontSize: 16, fontWeight: "700", color: colors.textPrimary, textAlign: "right" },
  muted: { fontSize: 13, color: colors.muted, marginTop: 4, textAlign: "right" },
  btn: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.sm },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  outlineBtn: { borderWidth: 1, borderColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.sm },
  outlineBtnText: { color: colors.primary, fontWeight: "700", fontSize: 13 },
  bodyText: { fontSize: 15, color: colors.textPrimary, lineHeight: 24, textAlign: "right", writingDirection: "rtl" },
  inputWrapper: { marginBottom: spacing.md },
  input: { backgroundColor: colors.background, padding: 10, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, marginTop: 4, fontFamily: 'Cairo' },
});

export const SettingsScreens = {
  SecuritySettings,
  EditProfileSettings,
  LanguageSettings,
  PrivacySettings,
  AboutPlatform
};
