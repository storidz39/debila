import { Complaint, ComplaintStatus, TabKey } from "../types";

export const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "home", label: "الرئيسية" },
  { key: "report", label: "إبلاغ" },
  { key: "map", label: "الخريطة" },
  { key: "tracking", label: "بلاغاتي" },
  { key: "notifications", label: "الإشعارات" },
  { key: "admin", label: "الإدارة" },
];

export const serviceCategories = [
  { id: "MUNI", title: "البلديات والشؤون القروية", icon: "business-outline" },
  { id: "WATER", title: "مرفق إدارة المياه والصرف", icon: "water-outline" },
  { id: "ELEC", title: "هيئة الكهرباء والإنارة", icon: "flash-outline" },
  { id: "ROADS", title: "وزارة الأشغال والطرق", icon: "construct-outline" },
  { id: "HEALTH", title: "هيئة الصحة والرقابة البيئية", icon: "medkit-outline" },
  { id: "SEC", title: "الأمن والسلامة والطوارئ", icon: "shield-half-outline" },
  { id: "TELE", title: "وزارة الاتصالات والتحول الرقمي", icon: "cellular-outline" },
  { id: "TRANS", title: "هيئة النقل العام والمواصلات", icon: "bus-outline" },
];

export const complaints: Complaint[] = [
  {
    id: "#WAT-7821",
    title: "انكسار خط مياه رئيسي",
    location: "حي العليا، تقاطع التخصصي",
    department: "مرفق إدارة المياه والصرف",
    status: "in_progress",
    coordinates: { lat: 24.7088, lng: 46.6712 },
    media_urls: ["https://images.unsplash.com/photo-1542013936693-884638324262?q=80&w=400"],
  },
  {
    id: "#ELC-9022",
    title: "محول كهربائي يصدر أصواتاً",
    location: "حي السليمانية، خلف البريد",
    department: "هيئة الكهرباء والإنارة",
    status: "under_review",
    coordinates: { lat: 24.7121, lng: 46.6854 },
  },
  {
    id: "#RDS-1021",
    title: "هبوط وحفرة طريق عميقة",
    location: "طريق الملك فهد، حي المربع",
    department: "وزارة الأشغال والطرق",
    status: "in_progress",
    coordinates: { lat: 24.6821, lng: 46.7121 },
  },
  {
    id: "#MUN-3341",
    title: "تجمع نفايات خلف المحلات",
    location: "حي الصحافة، شارع الثمامة",
    department: "البلديات والشؤون القروية",
    status: "submitted",
    coordinates: { lat: 24.8123, lng: 46.6432 },
  },
  {
    id: "#TEL-4410",
    title: "كابل اتصالات مكشوف",
    location: "حي الياسمين، المربع الرابع",
    department: "وزارة الاتصالات والتحول الرقمي",
    status: "resolved",
    coordinates: { lat: 24.8211, lng: 46.6312 },
  },
];

export const statusLabels: Record<ComplaintStatus, string> = {
  submitted: "تم الإرسال",
  under_review: "قيد المراجعة",
  in_progress: "قيد المعالجة",
  resolved: "تم الحل",
};

export const statusColors: Record<ComplaintStatus, string> = {
  submitted: "#94A3B8",
  under_review: "#F59E0B",
  in_progress: "#2563EB",
  resolved: "#16A34A",
};

