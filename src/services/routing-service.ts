/**
 * National Digital Platform - Smart Routing Service
 * Logic to automatically assign complaints to the correct administrative department.
 */

const CATEGORY_MAP: Record<string, string> = {
  "الماء": "مصلحة الموارد المائية",
  "الطرق": "مديرية الأشغال العمومية",
  "الكهرباء": "شركة سونلغاز للصيانة",
  "النظافة": "مصلحة تطهير البيئة",
  "الصحة": "مستشفى المنطقة الجراحي",
  "التعليم": "مديرية التربية والتعليم",
  "الأمن": "مقر الأمن الوطني",
};

export function getAssignedDepartment(category: string, title?: string, description?: string): string {
  // 1. Check exact category match
  if (CATEGORY_MAP[category]) {
    return CATEGORY_MAP[category];
  }

  // 2. Simple keyword analysis for fallback
  const text = `${title} ${description}`.toLowerCase();
  
  if (text.includes("ماسوره") || text.includes("تسرب") || text.includes("ماء")) return CATEGORY_MAP["الماء"];
  if (text.includes("حفره") || text.includes("رصيف") || text.includes("شارع")) return CATEGORY_MAP["الطرق"];
  if (text.includes("عمود") || text.includes("انقطاع") || text.includes("كهربا")) return CATEGORY_MAP["الكهرباء"];
  if (text.includes("زباله") || text.includes("نفايه") || text.includes("روائح")) return CATEGORY_MAP["النظافة"];

  // 3. Default to general administration if no match
  return "الأمانة العامة للولاية";
}
