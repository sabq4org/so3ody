// تعريفات استطلاع رأي منصة سعودي سبورت — مشتركة بين الواجهة والخادم

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

export const ROLE_LABELS: Record<string, string> = Object.fromEntries(
  ROLES.map((r) => [r.key, r.label]),
);
export const FEATURE_LABELS: Record<string, string> = Object.fromEntries(
  FEATURES.map((f) => [f.key, f.label]),
);

export interface SurveyPayload {
  name: string | null;
  contact: string | null;
  role: string;
  overallRating: number; // 1..5
  nps: number | null; // 0..10 (احتمال التوصية)
  features: string[];
  likes: string | null;
  suggestions: string | null;
  consent: boolean;
}

const ROLE_KEYS = new Set(ROLES.map((r) => r.key));
const FEATURE_KEYS = new Set(FEATURES.map((f) => f.key));

const clean = (v: unknown, max: number): string | null => {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s ? s.slice(0, max) : null;
};

export type ValidationResult =
  | { ok: true; value: SurveyPayload }
  | { ok: false; error: string };

/** تحقّق صارم من المدخلات على الخادم */
export function validate(input: unknown): ValidationResult {
  if (!input || typeof input !== "object") return { ok: false, error: "بيانات غير صالحة" };
  const b = input as Record<string, unknown>;

  const role = typeof b.role === "string" ? b.role : "";
  if (!ROLE_KEYS.has(role as RoleKey)) return { ok: false, error: "يرجى اختيار صفتك" };

  const rating = Number(b.overallRating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    return { ok: false, error: "يرجى إعطاء تقييم عام من 1 إلى 5" };

  let nps: number | null = null;
  if (b.nps !== null && b.nps !== undefined && b.nps !== "") {
    const n = Number(b.nps);
    if (!Number.isInteger(n) || n < 0 || n > 10)
      return { ok: false, error: "قيمة التوصية يجب أن تكون بين 0 و 10" };
    nps = n;
  }

  const features = Array.isArray(b.features)
    ? Array.from(new Set(b.features.filter((f): f is string => typeof f === "string" && FEATURE_KEYS.has(f as FeatureKey)))).slice(0, FEATURES.length)
    : [];

  return {
    ok: true,
    value: {
      name: clean(b.name, 120),
      contact: clean(b.contact, 200),
      role,
      overallRating: rating,
      nps,
      features,
      likes: clean(b.likes, 2000),
      suggestions: clean(b.suggestions, 2000),
      consent: b.consent === true,
    },
  };
}
