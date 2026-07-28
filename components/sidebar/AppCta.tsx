export function AppCta() {
  return (
    <div className="appcta">
      <h3>حمّل تطبيق سعودي سبورت</h3>
      <p>تابع النتائج المباشرة والأخبار العاجلة أولًا بأول.</p>
      <div className="btns">
        <a className="sbtn" href="#">
          <svg viewBox="0 0 24 24" width="20" fill="currentColor">
            <path d="M17.05 12.5c0-1.6.86-2.9 2.2-3.6-.76-1.1-1.9-1.7-3.4-1.8-1.4-.15-2.9.82-3.5.82s-1.8-.8-3-.78c-1.5.02-2.9.9-3.7 2.2-1.6 2.7-.4 6.7 1.1 8.9.75 1.1 1.6 2.3 2.8 2.25 1.1-.05 1.5-.72 2.9-.72s1.7.72 2.9.7c1.2-.02 2-1.1 2.7-2.2.5-.8.9-1.6 1.1-2.5-1.5-.6-2.3-1.9-2.3-3.5z" />
          </svg>
          <span>
            App Store
            <b>iOS</b>
          </span>
        </a>
        <a className="sbtn" href="#">
          <svg viewBox="0 0 24 24" width="20" fill="currentColor">
            <path d="M3.6 2.3 13 11.6l2.5-2.5L5.4 3.4a1.7 1.7 0 0 0-1.8-1.1zM16.9 10.2 19.9 12c.9.5.9 1.6 0 2.1l-3 1.8-2.7-2.7 2.7-3zM3 3.5v17l9-8.5L3 3.5zm2.4 18.2 10.1-5.8-2.5-2.5-7.6 8.3z" />
          </svg>
          <span>
            Google Play
            <b>Android</b>
          </span>
        </a>
      </div>
    </div>
  );
}
