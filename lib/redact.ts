// إزالة البيانات الشخصية المحتملة من النصوص المفتوحة قبل إرسالها لأي طرف خارجي (AI).
// نهج تحفّظي: نُفضّل حجب أكثر من اللازم على تسريب بيانات شخصية.

const EMAIL = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const URL = /\b(?:https?:\/\/|www\.)[^\s]+/gi;
const HANDLE = /(^|\s)@[A-Za-z0-9_]{2,}/g;
// أرقام هواتف/تسلسلات رقمية طويلة (سعودية ودولية) — 7 خانات فأكثر مع فواصل اختيارية
const PHONE = /(?:(?:\+|00)?\d[\d\s().-]{6,}\d)/g;

/** يُعيد النص بعد استبدال البيانات الشخصية بعلامات محايدة */
export function redactPII(input: string | null | undefined): string {
  if (!input) return "";
  let t = String(input);
  t = t.replace(EMAIL, "[بريد]");
  t = t.replace(URL, "[رابط]");
  t = t.replace(PHONE, "[رقم]");
  t = t.replace(HANDLE, (_m, p1) => `${p1}[حساب]`);
  return t.replace(/\s+/g, " ").trim();
}

/** true إذا احتوى النص على مؤشّر بيانات شخصية (للاختبار/الرقابة) */
export function hasPII(input: string | null | undefined): boolean {
  if (!input) return false;
  return [EMAIL, URL, PHONE, HANDLE].some((re) => {
    re.lastIndex = 0;
    return re.test(input);
  });
}
