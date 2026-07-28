import type { Article } from "@/lib/types";

const fmt = (n: number) => n.toLocaleString("en-US");

/** بطاقة خبر — تُستعمل في الخبر المميّز وشبكة آخر الأخبار */
export function ArticleCard({ a }: { a: Article }) {
  return (
    <a className={`art${a.size === "big" ? " big" : ""}`} href="#">
      <div className="thumb" style={{ background: a.gradient }}>
        <span className={`cat${a.tone ? ` ${a.tone}` : ""}`}>{a.category}</span>
        <div className="ph">
          {a.team ? (
            <span className="crest-lg" style={{ background: a.team.bg, color: a.team.fg }} aria-hidden>
              {a.team.abbr}
            </span>
          ) : (
            <span
              className="crest-lg"
              style={{ background: "rgba(255,255,255,.92)", color: "#0a5a31" }}
              aria-hidden
            >
              {a.categoryKey === "infographic" ? "📊" : "⚽"}
            </span>
          )}
        </div>
      </div>
      <div className="body">
        <h3>{a.title}</h3>
        {a.excerpt ? <p>{a.excerpt}</p> : null}
        <div className="meta">
          <span className="v">{a.timeLabel}</span>
          {a.views != null ? <span className="v">👁 {fmt(a.views)}</span> : null}
          {a.comments != null ? <span className="v">💬 {a.comments}</span> : null}
        </div>
      </div>
    </a>
  );
}
