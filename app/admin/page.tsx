import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/auth";
import { getAggregates, getMeta, getLatestAnalysis } from "@/lib/db";
import { ROLE_LABELS, FEATURE_LABELS } from "@/lib/survey";
import { aiConfigured, type AnalysisResult } from "@/lib/analysis";
import { FilterBar } from "@/components/admin/FilterBar";
import { TextBrowser } from "@/components/admin/TextBrowser";
import { AnalyzePanel, type AnalysisSnapshot } from "@/components/admin/AnalyzePanel";
import { LogoutButton } from "@/components/admin/LogoutButton";
import "./admin.css";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata: Metadata = { robots: { index: false, follow: false }, title: "لوحة إدارة الاستفتاء" };

const DAY = 86_400_000;

function computeFilters(sp: Record<string, string | string[] | undefined>) {
  const period = typeof sp.period === "string" ? sp.period : "all";
  const role = typeof sp.role === "string" && sp.role ? sp.role : null;
  let from: string | null = null;
  const to: string | null = null;
  if (period === "7d") from = new Date(Date.now() - 7 * DAY).toISOString();
  else if (period === "30d") from = new Date(Date.now() - 30 * DAY).toISOString();
  return { period, from, to, role };
}

const fmtDate = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat("ar", { dateStyle: "medium", timeStyle: "short", calendar: "gregory", numberingSystem: "latn" }).format(new Date(iso))
    : "—";
const num = (n: number) => n.toLocaleString("en-US");

function Bars({ items, gold = false }: { items: { label: string; n: number; pct: number }[]; gold?: boolean }) {
  if (items.length === 0) return <div className="adm-empty">لا بيانات في هذا النطاق</div>;
  return (
    <>
      {items.map((it, i) => (
        <div className="adm-bar" key={i}>
          <div className="row">
            <span className="nm">{it.label}</span>
            <span className="n">{it.n} ({it.pct}%)</span>
          </div>
          <div className={`adm-track ${gold ? "gold" : ""}`}>
            <i style={{ width: `${it.pct}%` }} />
          </div>
        </div>
      ))}
    </>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  if (!isAdminAuthed()) redirect("/admin/login");

  const f = computeFilters(searchParams);
  const filters = { from: f.from, to: f.to, role: f.role };
  const [agg, meta, latest] = await Promise.all([getAggregates(filters), getMeta(), getLatestAnalysis()]);
  const pct = (n: number) => (agg.total > 0 ? Math.round((n / agg.total) * 100) : 0);

  const initial: AnalysisSnapshot | null = latest
    ? {
        result: latest.result as AnalysisResult,
        scopeLabel: latest.scopeLabel,
        responseCount: latest.responseCount,
        provider: latest.provider,
        model: latest.model,
        promptVersion: latest.promptVersion,
        createdAt: latest.createdAt,
        durationMs: latest.durationMs,
      }
    : null;

  const periodLabel = f.period === "7d" ? "آخر 7 أيام" : f.period === "30d" ? "آخر 30 يومًا" : "كل الفترة";

  return (
    <main className="adm">
      <div className="adm-wrap">
        <div className="adm-head">
          <div>
            <h1>لوحة إدارة الاستفتاء</h1>
            <div className="sub">آخر تحديث للبيانات: {fmtDate(meta.lastUpdated)}</div>
          </div>
          <div className="tools">
            <a className="adm-btn" href="/api/admin/export">⬇ تصدير CSV</a>
            <LogoutButton />
          </div>
        </div>

        {meta.totalAll === 0 && (
          <div className="adm-note warn">لا توجد ردود بعد — ستظهر الأرقام والتحليل فور وصول أول مشاركة.</div>
        )}

        <div className="adm-tiles">
          <div className="adm-tile"><div className="k g">{num(meta.totalAll)}</div><div className="l">إجمالي المشاركات المكتملة</div></div>
          <div className="adm-tile"><div className="k">{num(agg.total)}</div><div className="l">خلال {periodLabel}</div></div>
          <div className="adm-tile"><div className="k na">غير متاح</div><div className="l">معدل الإكمال</div><div className="hint">لا نتتبّع البدء (خصوصية)</div></div>
          <div className="adm-tile"><div className="k">{agg.avgRating != null ? agg.avgRating.toFixed(2) : "—"}</div><div className="l">متوسط التقييم / 5</div></div>
          <div className="adm-tile"><div className="k">{agg.nps.score != null ? agg.nps.score : "—"}</div><div className="l">صافي الترويج NPS</div><div className="hint">مروّجون {agg.nps.promoters} · محايدون {agg.nps.passives} · منتقدون {agg.nps.detractors}</div></div>
        </div>

        <FilterBar />

        <div className="adm-grid">
          <div className="adm-panel">
            <h3>توزيع التقييم العام</h3>
            <Bars gold items={[5, 4, 3, 2, 1].map((s) => { const n = agg.ratingDist.find((r) => r.rating === s)?.n ?? 0; return { label: "★".repeat(s), n, pct: pct(n) }; })} />
          </div>
          <div className="adm-panel">
            <h3>من شارك؟ (الصفة)</h3>
            <Bars items={agg.roleDist.map((r) => ({ label: ROLE_LABELS[r.role] || r.role, n: r.n, pct: pct(r.n) }))} />
          </div>
          <div className="adm-panel">
            <h3>احتمال التوصية (0–10)</h3>
            <Bars items={Array.from({ length: 11 }).map((_, i) => { const n = agg.npsDist.find((d) => d.nps === i)?.n ?? 0; return { label: String(i), n, pct: agg.nps.answered > 0 ? Math.round((n / agg.nps.answered) * 100) : 0 }; })} />
          </div>
          <div className="adm-panel">
            <h3>أولويات التطوير الأكثر طلبًا</h3>
            <Bars items={agg.featureCounts.map((fc) => ({ label: FEATURE_LABELS[fc.key] || fc.key, n: fc.n, pct: pct(fc.n) }))} />
          </div>
        </div>

        <div className="adm-section-title">تحليل الذكاء الاصطناعي</div>
        <AnalyzePanel initial={initial} aiConfigured={aiConfigured()} />

        <div className="adm-section-title">الإجابات النصية</div>
        <TextBrowser filters={filters} />
      </div>
    </main>
  );
}
