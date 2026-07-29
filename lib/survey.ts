// تعريف استفتاء منصة سعودي سبورت — مصدر الحقيقة للأسئلة والخيارات (مشترك واجهة/خادم).
// الاستفتاء ثابت ومُعرّف في الكود؛ أي تغيير في الأسئلة يرفع SURVEY_VERSION.

export const SURVEY_ID = "so3ody-platform-dev-2026";
export const SURVEY_VERSION = 1;
export const TEXT_MAX = 2000;

export const ROLES = [
  { key: "fan", label: "مهتم بالرياضة" },
  { key: "user", label: "مستخدم للمنصة" },
  { key: "owner", label: "صاحب / شريك في المنصة" },
  { key: "media", label: "إعلامي / صحفي" },
  { key: "advertiser", label: "معلن / شريك تجاري" },
  { key: "other", label: "أخرى" },
] as const;

export const FEATURES = [
  { key: "news", label: "تغطية أعمق للأخبار" },
  { key: "live", label: "البث المباشر والنتائج اللحظية" },
  { key: "predictions", label: "التوقعات والمسابقات" },
  { key: "video", label: "الفيديو والملخصات" },
  { key: "apps", label: "تطبيقات الجوال (iOS / Android)" },
  { key: "notifications", label: "الإشعارات الفورية" },
  { key: "speed", label: "سرعة الموقع وسهولة الاستخدام" },
  { key: "analysis", label: "المحتوى التحليلي والتقارير" },
  { key: "data", label: "الإحصائيات وبيانات المباريات" },
] as const;

export type RoleKey = (typeof ROLES)[number]["key"];
export type FeatureKey = (typeof FEATURES)[number]["key"];

export const ROLE_LABELS: Record<string, string> = Object.fromEntries(ROLES.map((r) => [r.key, r.label]));
export const FEATURE_LABELS: Record<string, string> = Object.fromEntries(FEATURES.map((f) => [f.key, f.label]));

/** وصف الأسئلة (يُستخدم في لوحة الإدارة والتحليل) */
export const QUESTIONS = [
  { id: "role", type: "single", label: "الصفة", required: true },
  { id: "overallRating", type: "scale", label: "التقييم العام (1–5)", required: true, min: 1, max: 5 },
  { id: "nps", type: "scale", label: "احتمال التوصية (0–10)", required: false, min: 0, max: 10 },
  { id: "features", type: "multi", label: "أولويات التطوير", required: false },
  { id: "likes", type: "text", label: "ما يعجبك في المنصة", required: false },
  { id: "suggestions", type: "text", label: "اقتراح للتطوير", required: false },
] as const;

export interface SurveyPayload {
  participationId: string; // UUID فريد لكل مشاركة — لمنع التكرار (idempotency)
  name: string | null;
  contact: string | null;
  role: string;
  overallRating: number; // 1..5 (إلزامي)
  nps: number | null; // 0..10 (اختياري)
  features: string[];
  likes: string | null;
  suggestions: string | null;
  consent: boolean;
}

const ROLE_KEYS = new Set<string>(ROLES.map((r) => r.key));
const FEATURE_KEYS = new Set<string>(FEATURES.map((f) => f.key));

// الحقول المسموح بها فقط — أي مفتاح آخر يُرفض الطلب
const ALLOWED_KEYS = new Set([
  "participationId", "name", "contact", "role",
  "overallRating", "nps", "features", "likes", "suggestions", "consent",
]);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const clean = (v: unknown, max: number): string | null => {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s ? s.slice(0, max) : null;
};

export type ValidationResult =
  | { ok: true; value: SurveyPayload }
  | { ok: false; error: string };

/** تحقّق صارم من المدخلات على الخادم (لا يُعتمد على الواجهة) */
export function validate(input: unknown): ValidationResult {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, error: "بيانات غير صالحة" };
  }
  const b = input as Record<string, unknown>;

  // رفض الحقول غير المعروفة
  for (const key of Object.keys(b)) {
    if (!ALLOWED_KEYS.has(key)) return { ok: false, error: `حقل غير معروف: ${key}` };
  }

  // معرّف المشاركة (لمنع التكرار)
  const participationId = typeof b.participationId === "string" ? b.participationId : "";
  if (!UUID_RE.test(participationId)) return { ok: false, error: "معرّف مشاركة غير صالح" };

  const role = typeof b.role === "string" ? b.role : "";
  if (!ROLE_KEYS.has(role)) return { ok: false, error: "يرجى اختيار صفتك" };

  const rating = Number(b.overallRating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, error: "يرجى إعطاء تقييم عام من 1 إلى 5" };
  }

  let nps: number | null = null;
  if (b.nps !== null && b.nps !== undefined && b.nps !== "") {
    const n = Number(b.nps);
    if (!Number.isInteger(n) || n < 0 || n > 10) {
      return { ok: false, error: "قيمة التوصية يجب أن تكون بين 0 و 10" };
    }
    nps = n;
  }

  const features = Array.isArray(b.features)
    ? Array.from(new Set(b.features.filter((f): f is string => typeof f === "string" && FEATURE_KEYS.has(f)))).slice(0, FEATURES.length)
    : [];

  const consent = b.consent === true;

  // خصوصية: لا نحتفظ بالاسم/التواصل إلا مع موافقة صريحة
  const name = consent ? clean(b.name, 120) : null;
  const contact = consent ? clean(b.contact, 200) : null;

  return {
    ok: true,
    value: {
      participationId,
      name,
      contact,
      role,
      overallRating: rating,
      nps,
      features,
      likes: clean(b.likes, TEXT_MAX),
      suggestions: clean(b.suggestions, TEXT_MAX),
      consent,
    },
  };
}
