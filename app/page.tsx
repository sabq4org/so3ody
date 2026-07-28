import type { Metadata } from "next";
import "./splash.css";

export const metadata: Metadata = {
  title: "سعودي سبورت — والقادم أجمل",
  description:
    "تجربة سعودي سبورت تُبنى من جديد. رحلة من الشغف الرياضي نُكملها معكم — والقادم أجمل.",
};

export default function Home() {
  return (
    <main className="splash">
      <div className="splash-inner">
        <div className="splash-brand">
          <div className="mark">س</div>
          <div>
            <b>سعودي سبورت</b>
            <span>SO3ODY</span>
          </div>
        </div>

        <span className="splash-eyebrow">
          <span className="dot" />
          نُجدّد التجربة من أجلكم
        </span>

        <h1>
          شغفٌ لا يتوقّف،
          <br />
          و<span className="g">القادم أجمل</span>
        </h1>

        <p className="lead">
          خلال سنواتٍ من الشغف الرياضي، كنتم أنتم القصة. واليوم نُعيد بناء تجربة سعودي سبورت
          بروحٍ أحدث وأسرع وأقرب إليكم — لنُكمل النجاح ونصنع القادم معًا.
        </p>

        <a className="splash-cta" href="/survey">
          شاركنا رأيك في المرحلة القادمة
          <span aria-hidden>←</span>
        </a>

        <p className="splash-note">
          رأيك يصنع الفرق — <a href="/survey">دقائق قليلة</a> تُشكّل ملامح ما هو قادم.
        </p>

        <div className="splash-social">
          <a href="https://twitter.com/So3odysports1" aria-label="X" target="_blank" rel="noreferrer">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.9 2H22l-7.5 8.6L23 22h-6.9l-5.4-7-6.2 7H1.4l8-9.2L1 2h7l4.9 6.5L18.9 2zm-2.4 18h1.9L7.6 4H5.6l10.9 16z" />
            </svg>
          </a>
          <a href="https://instagram.com/so3odysport" aria-label="Instagram" target="_blank" rel="noreferrer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
          </a>
          <a href="https://www.youtube.com/channel/UCuPAgmGuWqU7SSB6-PYTqGg" aria-label="YouTube" target="_blank" rel="noreferrer">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M23 12s0-3.4-.4-5c-.2-.9-.9-1.6-1.8-1.8C19.2 5 12 5 12 5s-7.2 0-8.8.4c-.9.2-1.6.9-1.8 1.8C1 8.6 1 12 1 12s0 3.4.4 5c.2.9.9 1.6 1.8 1.8C4.8 19 12 19 12 19s7.2 0 8.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.6.4-5 .4-5zM9.8 15.3V8.7l5.7 3.3-5.7 3.3z" />
            </svg>
          </a>
        </div>
      </div>

      <div className="splash-foot">© {new Date().getFullYear()} سعودي سبورت — قريبًا بحُلّة جديدة</div>
    </main>
  );
}
