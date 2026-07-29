// محدّد معدّل بنافذة منزلقة في الذاكرة.
// مناسب لتشغيل Node عملية واحدة دائمة (Railway). ليس بديلاً عن حدّ موزّع،
// لكنه كافٍ لكبح النقر المتكرر والإرسال الآلي على مستوى المثيل الواحد.

const hits = new Map<string, number[]>();

export interface RateResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

/**
 * يتحقق ويسجّل محاولة للمفتاح المعطى.
 * @param key مفتاح (مثل ip_hash أو "login:ip")
 * @param max أقصى عدد محاولات ضمن النافذة
 * @param windowMs طول النافذة بالمللي ثانية
 * @param now الوقت الحالي (قابل للحقن للاختبار)
 */
export function rateLimit(key: string, max: number, windowMs: number, now: number = Date.now()): RateResult {
  const cutoff = now - windowMs;
  const arr = (hits.get(key) ?? []).filter((t) => t > cutoff);

  if (arr.length >= max) {
    const retryAfterMs = arr[0] + windowMs - now;
    hits.set(key, arr);
    return { allowed: false, remaining: 0, retryAfterMs: Math.max(0, retryAfterMs) };
  }

  arr.push(now);
  hits.set(key, arr);

  // تنظيف دوري بسيط لتفادي نمو الخريطة بلا حدود
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      const kept = v.filter((t) => t > cutoff);
      if (kept.length === 0) hits.delete(k);
      else hits.set(k, kept);
    }
  }

  return { allowed: true, remaining: max - arr.length, retryAfterMs: 0 };
}

/** للاختبارات — تصفير الحالة */
export function _resetRateLimit(): void {
  hits.clear();
}
