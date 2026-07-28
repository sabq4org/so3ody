const COLS: { title: string; links: string[] }[] = [
  { title: "الأقسام", links: ["كرة سعودية", "كرة عربية", "كرة عالمية", "تقارير", "إنفوجرافيك"] },
  { title: "الرياضة", links: ["مباريات اليوم", "البطولات", "الانتقالات", "التوقعات", "الفيديوهات"] },
  { title: "الموقع", links: ["من نحن", "سياسة الاستخدام", "سياسة الخصوصية", "اعلن معنا", "الأرشيف"] },
];

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="fgrid">
          <div className="fcol fabout">
            <a className="brand" href="#">
              <div className="mark">س</div>
              <div className="wm">
                <b>سعودي سبورت</b>
                <span>SO3ODY · 2.0</span>
              </div>
            </a>
            <p>
              بوابة رياضية شاملة تنقل أخبار الكرة السعودية والعربية والعالمية، ونتائج المباريات
              المباشرة والبطولات أولًا بأول.
            </p>
            <div className="social">
              <a href="#" aria-label="X">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.9 2H22l-7.5 8.6L23 22h-6.9l-5.4-7-6.2 7H1.4l8-9.2L1 2h7l4.9 6.5L18.9 2zm-2.4 18h1.9L7.6 4H5.6l10.9 16z" />
                </svg>
              </a>
              <a href="#" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a href="#" aria-label="YouTube">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23 12s0-3.4-.4-5c-.2-.9-.9-1.6-1.8-1.8C19.2 5 12 5 12 5s-7.2 0-8.8.4c-.9.2-1.6.9-1.8 1.8C1 8.6 1 12 1 12s0 3.4.4 5c.2.9.9 1.6 1.8 1.8C4.8 19 12 19 12 19s7.2 0 8.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.6.4-5 .4-5zM9.8 15.3V8.7l5.7 3.3-5.7 3.3z" />
                </svg>
              </a>
              <a href="#" aria-label="TikTok">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 2c.3 2.3 1.7 3.9 4 4v3c-1.5.1-2.9-.4-4-1.2v6.6c0 4-3.3 6.6-6.9 5.9-2.8-.5-4.8-3-4.6-5.9.2-2.9 2.8-5.1 5.7-4.9.3 0 .6.1.9.2v3.1c-.3-.1-.6-.2-1-.2-1.3 0-2.4 1.1-2.4 2.4s1.1 2.4 2.4 2.4 2.4-1.1 2.4-2.4V2h3.5z" />
                </svg>
              </a>
            </div>
          </div>

          {COLS.map((c) => (
            <div className="fcol" key={c.title}>
              <h4>{c.title}</h4>
              <ul>
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="fbar">
          <span>© 2026 سعودي سبورت — جميع الحقوق محفوظة</span>
          <span className="mono">so3ody 2.0 · Next.js · v0.1</span>
        </div>
      </div>
    </footer>
  );
}
