"use client";

import { useMemo, useState } from "react";
import { ROLES, FEATURES } from "@/lib/survey";

const Check = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.2}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const Star = ({ filled }: { filled: boolean }) => (
  <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.6}>
    <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

export function SurveyForm() {
  const [role, setRole] = useState<string>("");
  const [rating, setRating] = useState<number>(0);
  const [hoverStar, setHoverStar] = useState<number>(0);
  const [nps, setNps] = useState<number | null>(null);
  const [features, setFeatures] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [likes, setLikes] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [consent, setConsent] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const canSubmit = useMemo(() => role !== "" && rating >= 1 && !submitting, [role, rating, submitting]);

  const toggleFeature = (key: string) =>
    setFeatures((prev) => (prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) {
      setError("يرجى اختيار صفتك وإعطاء تقييم عام أولًا.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, contact, role, overallRating: rating, nps, features, likes, suggestions, consent }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "تعذّر الإرسال");
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ، حاول مجددًا");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="sv-card">
        <div className="sv-thanks">
          <div className="mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h2>وصلنا رأيك — شكرًا لك!</h2>
          <p>
            مساهمتك أصبحت جزءًا من قرارات تطوير سعودي سبورت القادمة. نقرأ كل ردّ بعناية، ونعمل على
            استكمال النجاح بما يليق بروّاد المنصة.
          </p>
          <a href="https://www.so3ody.com">تصفّح سعودي سبورت ←</a>
        </div>
      </div>
    );
  }

  return (
    <form className="sv-card sv-form" onSubmit={submit} noValidate>
      {/* الصفة */}
      <div className="sv-field">
        <div className="sv-q">
          صفتك <span className="req">*</span>
        </div>
        <div className="sv-chips">
          {ROLES.map((r) => (
            <button
              type="button"
              key={r.key}
              className={`sv-chip${role === r.key ? " on" : ""}`}
              onClick={() => setRole(r.key)}
              aria-pressed={role === r.key}
            >
              <span className="tick">
                <Check />
              </span>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* التقييم العام */}
      <div className="sv-field">
        <div className="sv-q">
          تقييمك العام لتجربة سعودي سبورت <span className="req">*</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, justifyContent: "space-between", flexWrap: "wrap" }}>
          <span className="sv-scale-label">{rating ? `${rating} من 5` : "اختر تقييمًا"}</span>
          <div className="sv-stars" onMouseLeave={() => setHoverStar(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                type="button"
                key={n}
                className={`sv-star${(hoverStar || rating) >= n ? " lit" : ""}`}
                onMouseEnter={() => setHoverStar(n)}
                onClick={() => setRating(n)}
                aria-label={`${n} نجوم`}
              >
                <Star filled={(hoverStar || rating) >= n} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* التوصية NPS */}
      <div className="sv-field">
        <div className="sv-q">
          ما احتمال أن تنصح صديقًا بسعودي سبورت؟ <span className="opt">(اختياري)</span>
        </div>
        <div className="sv-nps">
          {Array.from({ length: 11 }).map((_, n) => (
            <button
              type="button"
              key={n}
              className={nps === n ? "on" : ""}
              onClick={() => setNps(nps === n ? null : n)}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="sv-nps-ends">
          <span>غير محتمل إطلاقًا</span>
          <span>محتمل جدًا</span>
        </div>
      </div>

      {/* الميزات المطلوب تطويرها */}
      <div className="sv-field">
        <div className="sv-q">
          ما الذي تتمنى أن نطوّره أكثر؟ <span className="opt">(اختر ما يناسبك)</span>
        </div>
        <div className="sv-chips">
          {FEATURES.map((f) => (
            <button
              type="button"
              key={f.key}
              className={`sv-chip${features.includes(f.key) ? " on" : ""}`}
              onClick={() => toggleFeature(f.key)}
              aria-pressed={features.includes(f.key)}
            >
              <span className="tick">
                <Check />
              </span>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* آراء حرة */}
      <div className="sv-field">
        <div className="sv-q">
          ما الذي يعجبك في المنصة حاليًا؟ <span className="opt">(اختياري)</span>
        </div>
        <textarea
          className="sv-textarea"
          value={likes}
          onChange={(e) => setLikes(e.target.value)}
          placeholder="أخبرنا بما تحب أن نحافظ عليه…"
          maxLength={2000}
        />
      </div>

      <div className="sv-field">
        <div className="sv-q">اقتراحك لتطوير سعودي سبورت واستكمال نجاحها</div>
        <textarea
          className="sv-textarea"
          value={suggestions}
          onChange={(e) => setSuggestions(e.target.value)}
          placeholder="فكرة، ميزة تتمناها، أو ملاحظة صريحة…"
          maxLength={2000}
        />
      </div>

      {/* بيانات التواصل */}
      <div className="sv-field">
        <div className="sv-q">
          للتواصل معك <span className="opt">(اختياري)</span>
        </div>
        <p className="sv-hint">نستخدمها فقط للرجوع إليك حول رأيك — لن نشاركها مع أي جهة.</p>
        <div className="sv-two">
          <input
            className="sv-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="الاسم"
            maxLength={120}
          />
          <input
            className="sv-input"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="البريد الإلكتروني أو الجوال"
            maxLength={200}
          />
        </div>
        <label className="sv-consent">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>أوافق على تواصل فريق سعودي سبورت معي بخصوص هذا الرأي عند الحاجة.</span>
        </label>
      </div>

      <div className="sv-actions">
        {error ? <div className="sv-err">{error}</div> : null}
        <button type="submit" className="sv-submit" disabled={!canSubmit}>
          {submitting ? "جارٍ الإرسال…" : "أرسل رأيي"}
        </button>
        <p className="sv-privacy">
          بياناتك تُحفظ بأمان وتُستخدم لأغراض تطوير المنصة فقط. الحقول المعلّمة بـ
          <span style={{ color: "var(--live)" }}> * </span> إلزامية.
        </p>
      </div>
    </form>
  );
}
