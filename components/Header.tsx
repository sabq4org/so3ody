import { ThemeToggle } from "./ThemeToggle";

const NAV: { label: string; active?: boolean; md?: boolean }[] = [
  { label: "الرئيسية", active: true },
  { label: "أخبار" },
  { label: "مباريات اليوم" },
  { label: "البطولات" },
  { label: "فيديوهات" },
  { label: "الانتقالات", md: true },
  { label: "التوقعات", md: true },
  { label: "كرة سعودية", md: true },
  { label: "إنفوجرافيك", md: true },
];

export function Header() {
  return (
    <header className="header">
      <div className="wrap">
        <a className="brand" href="#" aria-label="سعودي سبورت — الرئيسية">
          <div className="mark">س</div>
          <div className="wm">
            <b>سعودي سبورت</b>
            <span>SO3ODY · 2.0</span>
          </div>
        </a>

        <nav className="nav" aria-label="التنقّل الرئيسي">
          {NAV.map((n) => (
            <a
              key={n.label}
              href="#"
              className={`${n.active ? "active" : ""}${n.md ? " hide-md" : ""}`.trim()}
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="hactions">
          <button className="icon-btn" aria-label="بحث">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>
          <ThemeToggle />
          <button className="icon-btn" aria-label="حسابي">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20a8 8 0 0 1 16 0" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
