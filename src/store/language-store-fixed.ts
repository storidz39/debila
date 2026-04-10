import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Language = "ar" | "en";

class LanguageStore {
  language: Language = "ar";
  listeners = new Set<() => void>();

  constructor() {
    AsyncStorage.getItem("app_lang").then(l => {
      if (l === "en" || l === "ar") {
        this.language = l;
        this.notify();
      }
    });
  }

  setLanguage(lang: Language) {
    this.language = lang;
    AsyncStorage.setItem("app_lang", lang);
    this.notify();
  }

  notify() {
    this.listeners.forEach(l => l());
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }
}

export const languageStore = new LanguageStore();

const translations = {
  ar: {
    "login.title": "الجمهورية الجزائرية الديمقراطية الشعبية",
    "login.subtitle": "بوابة المواطن الرقمية الموحدة",
    "login.phone": "رقم الجوال",
    "login.password": "كلمة المرور",
    "login.submit": "دخول آمن",
    "login.register": "إنشاء حساب مواطن جديد",
    "login.hint_phone": "مثال: 05XXXXXXXX أو اسم مستخدم",
    "login.hint_pass": "أدخل كلمة المرور",
    "login.forgot": "نسيت كلمة المرور؟",
    "login.or": "أو",
    "login.agree": "بإكمال تسجيل الدخول، أنت توافق على",
    "login.terms": "شروط الاستخدام وسياسة الخصوصية",
    "nav.home": "الرئيسية",
    "nav.report": "إبلاغ",
    "nav.map": "الخريطة",
    "nav.tracking": "بلاغاتي",
    "nav.notifications": "الإشعارات",
    "nav.admin": "الطلبات الواردة",
    "nav.profile": "الملف الشخصي",
    "profile.logout": "تسجيل الخروج",
    "profile.settings": "إعدادات الحساب",
    "profile.security": "الأمان وكلمة المرور",
    "profile.lang": "لغة التطبيق",
    "profile.privacy": "سياسة الخصوصية",
    "profile.about": "حول منصة بادر",
    "profile.edit": "تحديث البيانات الشخصية",
    "profile.citizen": "مواطن",
    "profile.admin": "مدير النظام",
    "profile.dept": "حساب إداري",
    "profile.verified": "حساب موثق",
    "profile.unified": "منصة بادر الموحدة",
    "sidebar.dept_home": "إحصائيات المصلحة",
    "sidebar.admin_home": "الرقابة العامة",
    "sidebar.dept_admin": "سجل التبليغات العام",
    "sidebar.admin_mgnt": "إدارة الهيئات",
    "sidebar.dept_new": "التبليغات الجديدة",
    "sidebar.dept_done": "التبليغات المنجزة",
    "sidebar.dept_mail": "سجل البريد الداخلي",
    "sidebar.dept_alerts": "تنبيهات النظام",
    "sidebar.admin_stats": "الإحصائيات الوطنية",
    "sidebar.shared_settings": "الإعدادات",
    "sidebar.footer": "منصة بادر للخدمات",
    "home.welcome": "مرحباً",
    "home.citizen": "المواطن",
    "home.summary": "إليك ملخص نشاطك لهذا اليوم",
    "home.active": "بلاغات نشطة",
    "home.resolved": "تم حلها",
    "home.search": "ابحث عن خدمة أو تابع بلاغك...",
    "home.new_report": "إرسال بلاغ جديد",
    "home.categories": "تصنيفات الخدمات",
    "home.latest": "آخر البلاغات",
    "home.view_all": "عرض الكل",
    "report.title": "تقديم بلاغ أو اقتراح عبر بادر",
    "report.sub": "يرجى ملء البيانات بدقة لضمان المعالجة السريعة",
    "report.type": "نوع الطلب",
    "report.complaint": "تبليغ عن خلل",
    "report.suggestion": "تقديم اقتراح",
    "report.category": "القطاع المعني",
    "report.title_label": "عنوان رئيسي",
    "report.location": "الموقع (الولاية، البلدية، الشارع)",
    "report.details": "تفاصيل وملاحظات المستعمل",
    "report.submit": "إرسال بلاغ بادر",
  },
  en: {
    "login.title": "People's Democratic Republic of Algeria",
    "login.subtitle": "Bader Unified Digital Portal",
    "login.phone": "Phone Number",
    "login.password": "Password",
    "login.submit": "Secure Login",
    "login.register": "Create New Bader Account",
    "login.hint_phone": "e.g., 05XXXXXXXX or username",
    "login.hint_pass": "Enter your password",
    "login.forgot": "Forgot Password?",
    "login.or": "OR",
    "login.agree": "By logging in, you agree to the",
    "login.terms": "Terms of Use and Privacy Policy",
    "nav.home": "Home",
    "nav.report": "Report",
    "nav.map": "Map",
    "nav.tracking": "My Reports",
    "nav.notifications": "Notifications",
    "nav.admin": "Incoming Requests",
    "nav.profile": "Profile",
    "profile.logout": "Log Out",
    "profile.settings": "Account Settings",
    "profile.security": "Security & Password",
    "profile.lang": "App Language",
    "profile.privacy": "Privacy Policy",
    "profile.about": "About Bader Platform",
    "profile.edit": "Update Personal Data",
    "profile.citizen": "Citizen",
    "profile.admin": "System Admin",
    "profile.dept": "Department Account",
    "profile.verified": "Verified Account",
    "profile.unified": "Bader Platform",
    "sidebar.dept_home": "Department Stats",
    "sidebar.admin_home": "General Oversight",
    "sidebar.dept_admin": "General Reports Log",
    "sidebar.admin_mgnt": "Departments Management",
    "sidebar.dept_new": "New Reports",
    "sidebar.dept_done": "Resolved Reports",
    "sidebar.dept_mail": "Internal Mail Log",
    "sidebar.dept_alerts": "System Alerts",
    "sidebar.admin_stats": "National Statistics",
    "sidebar.shared_settings": "Settings",
    "sidebar.footer": "Bader Services Platform",
    "home.welcome": "Welcome",
    "home.citizen": "Citizen",
    "home.summary": "Here is a summary of your activity today",
    "home.active": "Active Reports",
    "home.resolved": "Resolved",
    "home.search": "Search for a service or track your report...",
    "home.new_report": "Submit New Report",
    "home.categories": "Service Categories",
    "home.latest": "Latest Reports",
    "home.view_all": "View All",
    "report.title": "Submit via Bader",
    "report.sub": "Please fill out the form accurately to ensure rapid processing",
    "report.type": "Request Type",
    "report.complaint": "Report an Issue",
    "report.suggestion": "Submit a Suggestion",
    "report.category": "Target Department",
    "report.title_label": "Main Title",
    "report.location": "Location (State, Municipality, Street)",
    "report.details": "Details and Notes",
    "report.submit": "Submit Bader Report",
  }
} as const;

export function useLanguage() {
  const [lang, setLang] = useState<Language>(languageStore.language);

  useEffect(() => {
    return languageStore.subscribe(() => setLang(languageStore.language));
  }, []);

  const t = (key: keyof typeof translations["ar"]) => {
    return translations[lang][key] || key;
  };

  return { language: lang, setLanguage: (l: Language) => languageStore.setLanguage(l), t };
}
