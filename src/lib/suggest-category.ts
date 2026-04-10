export function suggestCategoryFromText(
  text: string
): { category: string; confidence: number } {
  const t = text.toLowerCase();
  if (/مياه|تسرب|صرف|انقطاع/.test(t)) return { category: "water", confidence: 92 };
  if (/حريق|طوارئ|حماية\s*مدنية|إنقاذ/.test(t)) return { category: "civil_protection", confidence: 94 };
  if (/مستشفى|صحة|عيادة|إسعاف/.test(t)) return { category: "health", confidence: 90 };
  if (/كهرباء|أعمدة|انقطاع\s*كه/.test(t)) return { category: "electricity", confidence: 88 };
  if (/حفرة|طريق|إنارة|رصف|أشغال/.test(t)) return { category: "public_works", confidence: 87 };
  if (/نفايات|نظافة|بلدية|مخالفة/.test(t)) return { category: "municipality", confidence: 86 };
  if (/زحام|إشارة|مرور/.test(t)) return { category: "roads", confidence: 82 };
  return { category: "municipality", confidence: 55 };
}

export function categoryLabelAr(code: string): string {
  const map: Record<string, string> = {
    water: "خدمات المياه",
    civil_protection: "الحماية المدنية",
    health: "الصحة",
    electricity: "الكهرباء",
    public_works: "الأشغال العمومية",
    municipality: "البلدية",
    roads: "الطرق والمرور",
  };
  return map[code] ?? "خدمات عامة";
}
