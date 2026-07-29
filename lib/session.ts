import { createHmac, createHash, timingSafeEqual } from "node:crypto";

// دوال جلسة نقيّة (بلا اعتماد على Next) — قابلة للاختبار بحقن السرّ/الوقت.

/** مقارنة ثابتة الزمن مستقلة عن الطول (نُجزّئ الطرفين ثم نقارن) */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(String(a)).digest();
  const hb = createHash("sha256").update(String(b)).digest();
  return timingSafeEqual(ha, hb);
}

/** توكن جلسة موقّع: "<expiry>.<hmac>" */
export function signSession(expiry: number, secret: string): string {
  const sig = createHmac("sha256", secret).update(`admin.${expiry}`).digest("hex");
  return `${expiry}.${sig}`;
}

/** يتحقق من صحة التوكن (التوقيع + عدم انتهاء الصلاحية) */
export function verifySession(token: string | undefined | null, secret: string, now: number = Date.now()): boolean {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const expiry = Number(token.slice(0, dot));
  const sig = token.slice(dot + 1);
  if (!Number.isFinite(expiry) || expiry < now) return false;
  const expected = createHmac("sha256", secret).update(`admin.${expiry}`).digest("hex");
  if (sig.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}
