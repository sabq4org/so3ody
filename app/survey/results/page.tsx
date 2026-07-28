import type { Metadata } from "next";
import { getAggregates, getRecent } from "@/lib/db";
import { ROLE_LABELS, FEATURE_LABELS } from "@/lib/survey";
import "./results.css";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata: Metadata = {
  title: "تحليل الاستطلاع — سعودي سبورت",
  robots: { index: false, follow: false },
};

const fmt = (n: number) => n.toLocaleString("en-US");
const fmtDate = (iso: string) => {
  try {
    return new Intl.DateTimeFormat("ar", {
      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
      calendar: "gregory", numberingSystem: "latn",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: { key?: string };
}) {
  const token = process.env.SURVEY_ADMIN_TOKEN;
  const key = searchParams?.key;

  if (!token || key !== token) {
    return (
      <main className="rz">
        <div className="rz-deny">
          <h2>صفحة محمية</h2>
          <p>
            هذه لوحة تحليل داخلية. أضِف مفتاح الوصول إلى الرابط:
            <br />
            <code>/survey/results?key=YOUR_TOKEN</code>
          </p>
        </div>
      </main>
    );
  }

  const agg = await getAggregates();
  const recent = await getRecent(30);
  const maxRole = Math.max(1, ...agg.roleDist.map((r) => r.n));
  const maxFeat = Math.max(1, ...agg.featureCounts.map((f) => f.n));
  const npsColor =
    agg.nps.score == null ? "var(--muted)" : agg.nps.score >= 0 ? "var(--green)" : "var(--live)";

  return (
    <main className="rz">
      <div className="rz-wrap">
        <div className="rz-head">
          <div>
            <h1>تحليل استطلاع سعودي سبورت</h1>
            <div className="sub">آراء المهتمين وأصحاب المنصة — محدّث لحظيًا</div>
          </div>
          <a className="rz-export" href={`/api/survey/export?key=${encodeURIComponent(key)}`}>
            ⬇ تصدير CSV
          </a>
        </div>

        {/* بطاقات ملخّص */}
        <div className="rz-tiles">
          <div className="rz-tile">
            <div className="k g">{fmt(agg.total)}</div>
            <div className="l">إجمالي الردود</div>
          </div>
          <div className="rz-tile">
            <div className="k">{agg.avgRating != null ? agg.avgRating.toFixed(2) : "—"}</div>
            <div className="l">متوسط التقييم (من 5)</div>
          </div>
          <div className="rz-tile">
            <div className="k" style={{ color: npsColor }}>
              {agg.nps.score != null ? agg.nps.score : "—"}
            </div>
            <div className="l">صافي الترويج NPS</div>
            <div className="sub">
              مروّجون {agg.nps.promoters} · محايدون {agg.nps.passives} · منتقدون {agg.nps.detractors}
            </div>
          </div>
          <div className="rz-tile">
            <div className="k">{fmt(agg.nps.answered)}</div>
            <div className="l">مجاوبون على التوصية</div>
          </div>
        </div>

        <div className="rz-grid">
          {/* توزيع التقييم */}
          <div className="rz-panel">
            <h3>توزيع التقييم العام</h3>
            {[5, 4, 3, 2, 1].map((star) => {
              const n = agg.ratingDist.find((r) => r.rating === star)?.n ?? 0;
              const pct = agg.total ? Math.round((n / agg.total) * 100) : 0;
              return (
                <div className="rz-bar" key={star}>
                  <div className="row">
                    <span className="nm">{"★".repeat(star)}</span>
                    <span className="n">{n} ({pct}%)</span>
                  </div>
                  <div className="rz-track gold">
                    <i style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* توزيع الصفة */}
          <div className="rz-panel">
            <h3>من شارك؟ (الصفة)</h3>
            {agg.roleDist.length === 0 ? (
              <div className="rz-empty">لا بيانات بعد</div>
            ) : (
              agg.roleDist.map((r) => (
                <div className="rz-bar" key={r.role}>
                  <div className="row">
                    <span className="nm">{ROLE_LABELS[r.role] || r.role}</span>
                    <span className="n">{r.n}</span>
                  </div>
                  <div className="rz-track">
                    <i style={{ width: `${Math.round((r.n / maxRole) * 100)}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* الميزات المطلوبة */}
        <div className="rz-panel" style={{ marginTop: 20 }}>
          <h3>أولويات التطوير الأكثر طلبًا</h3>
          {agg.featureCounts.length === 0 ? (
            <div className="rz-empty">لا بيانات بعد</div>
          ) : (
            agg.featureCounts.map((f) => (
              <div className="rz-bar" key={f.key}>
                <div className="row">
                  <span className="nm">{FEATURE_LABELS[f.key] || f.key}</span>
                  <span className="n">{f.n}</span>
                </div>
                <div className="rz-track">
                  <i style={{ width: `${Math.round((f.n / maxFeat) * 100)}%` }} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* أحدث الردود */}
        <div className="rz-recent">
          <div className="rz-tbl-wrap">
            <table className="rz-tbl">
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>الصفة</th>
                  <th>التقييم</th>
                  <th>NPS</th>
                  <th>الاقتراح / الملاحظة</th>
                </tr>
              </thead>
              <tbody>
                {recent.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="rz-empty">لا توجد ردود بعد.</td>
                  </tr>
                ) : (
                  recent.map((r) => (
                    <tr key={r.id}>
                      <td className="date">{fmtDate(r.created_at)}</td>
                      <td>
                        <span className="role">{ROLE_LABELS[r.role] || r.role}</span>
                      </td>
                      <td className="rate">{r.overall_rating != null ? `${r.overall_rating}★` : "—"}</td>
                      <td className="date">{r.nps != null ? r.nps : "—"}</td>
                      <td className="txt">{r.suggestions || r.likes || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
