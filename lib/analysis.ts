import {
  getAggregates, getMeta, getTextSamples, insertAnalysis, type Aggregates,
} from "./db";
import { callAIJson, getAIConfig } from "./ai";
import { redactPII } from "./redact";
import { SURVEY_ID, ROLE_LABELS, FEATURE_LABELS } from "./survey";

export const ANALYSIS_PROMPT_VERSION = "analysis-v1";
export const MIN_RESPONSES_FOR_ANALYSIS = 3;
export const SMALL_SAMPLE_THRESHOLD = 20;

export type Level = "high" | "medium" | "low";
export interface Evidence {
  metric: string;
  value: number;
}
export interface Recommendation {
  title: string;
  rationale: string;
  impact: Level;
  confidence: Level;
  evidence: Evidence[];
  verified: boolean;
}
export interface TopRequest {
  feature: string;
  evidence: Evidence[];
  confidence: Level;
  verified: boolean;
}
export interface AnalysisResult {
  executiveSummary: string;
  trends: string[];
  satisfaction: { positives: string[]; negatives: string[] };
  topRequests: TopRequest[];
  segments: string[];
  recommendations: Recommendation[];
  quotes: string[];
  caveats: string[];
  followUpQuestions: string[];
  overallConfidence: Level;
  verification: { evidenceChecked: number; evidenceUnsupported: number; allSupported: boolean };
  smallSample: boolean;
}

// ————————————————— بناء مدخلات مجمّعة ومجهولة —————————————————
export function buildAnalysisInput(agg: Aggregates, likes: string[], suggestions: string[]) {
  const pct = (n: number) => (agg.total > 0 ? Math.round((n / agg.total) * 100) : 0);
  return {
    surveyId: SURVEY_ID,
    totalResponses: agg.total,
    rating: {
      averageOutOf5: agg.avgRating,
      distribution: agg.ratingDist.map((r) => ({ stars: r.rating, count: r.n, percent: pct(r.n) })),
    },
    nps: {
      score: agg.nps.score,
      promoters: agg.nps.promoters,
      passives: agg.nps.passives,
      detractors: agg.nps.detractors,
      answered: agg.nps.answered,
    },
    roles: agg.roleDist.map((r) => ({ role: ROLE_LABELS[r.role] || r.role, count: r.n, percent: pct(r.n) })),
    featureDemand: agg.featureCounts.map((f) => ({ feature: FEATURE_LABELS[f.key] || f.key, count: f.n, percent: pct(f.n) })),
    textSamples: {
      likes: likes.slice(0, 30),
      suggestions: suggestions.slice(0, 30),
    },
  };
}

const SYSTEM_PROMPT = `أنت محلّل بيانات استفتاءات محترف. تحصل على ملخّص مجمّع ومجهول لنتائج استفتاء منصة رياضية عربية.
مهمّتك إنتاج قراءة عربية احترافية تساعد فريق المنتج على تحديد أولويات التطوير.

قواعد صارمة:
- استخدم فقط الأرقام الموجودة في المدخلات. ممنوع منعًا باتًا اختراع أي نسبة أو رقم غير مذكور.
- كل استنتاج رقمي يجب أن يرفق evidence كمصفوفة من { "metric": "وصف", "value": رقم } حيث value رقم موجود فعلًا في المدخلات.
- إن كانت العينة صغيرة أو المشاركون منحازين، اذكر ذلك في caveats.
- اكتب بالعربية الفصحى الواضحة. الاقتباسات في quotes يجب أن تكون قصيرة ومجهولة (بلا أسماء أو بيانات تواصل).
- أعد كائن JSON فقط بالبنية التالية بالضبط (لا نص خارج JSON):

{
  "executiveSummary": "ملخّص تنفيذي (2-4 جمل)",
  "trends": ["أبرز التوجهات والأنماط"],
  "satisfaction": { "positives": ["نقاط الرضا"], "negatives": ["نقاط عدم الرضا"] },
  "topRequests": [{ "feature": "اسم الميزة", "evidence": [{"metric":"...","value":0}], "confidence": "high|medium|low" }],
  "segments": ["اختلافات بين الشرائح إن دعمتها البيانات، وإلا اترك المصفوفة فارغة"],
  "recommendations": [{ "title": "توصية", "rationale": "المبرّر", "impact": "high|medium|low", "confidence": "high|medium|low", "evidence": [{"metric":"...","value":0}] }],
  "quotes": ["اقتباسات قصيرة مجهولة من الإجابات النصية عند الحاجة"],
  "caveats": ["التحفظات الإحصائية مثل صغر العينة أو انحياز المشاركين"],
  "followUpQuestions": ["أسئلة متابعة مقترحة للاستفتاء القادم"],
  "overallConfidence": "high|medium|low"
}`;

// ————————————————— تحليل الاستجابة (نقيّ) —————————————————
function asLevel(v: unknown): Level {
  return v === "high" || v === "medium" || v === "low" ? v : "low";
}
function asStrArr(v: unknown, cap = 20): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string" && x.trim().length > 0).slice(0, cap);
}
function asEvidence(v: unknown): Evidence[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((e) => (e && typeof e === "object" ? (e as Record<string, unknown>) : null))
    .filter((e): e is Record<string, unknown> => !!e && typeof e.value === "number" && Number.isFinite(e.value))
    .map((e) => ({ metric: typeof e.metric === "string" ? e.metric.slice(0, 120) : "", value: e.value as number }))
    .slice(0, 10);
}

export function parseAnalysis(text: string): AnalysisResult {
  let raw = text.trim();
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) raw = fence[1].trim();
  let obj: Record<string, unknown>;
  try {
    obj = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    throw new Error("تعذّر تحليل استجابة النموذج (JSON غير صالح)");
  }
  const sat = (obj.satisfaction && typeof obj.satisfaction === "object" ? obj.satisfaction : {}) as Record<string, unknown>;
  return {
    executiveSummary: typeof obj.executiveSummary === "string" ? obj.executiveSummary.slice(0, 1500) : "",
    trends: asStrArr(obj.trends),
    satisfaction: { positives: asStrArr(sat.positives), negatives: asStrArr(sat.negatives) },
    topRequests: Array.isArray(obj.topRequests)
      ? obj.topRequests.slice(0, 12).map((t) => {
          const o = (t && typeof t === "object" ? t : {}) as Record<string, unknown>;
          return {
            feature: typeof o.feature === "string" ? o.feature.slice(0, 120) : "",
            evidence: asEvidence(o.evidence),
            confidence: asLevel(o.confidence),
            verified: true,
          };
        })
      : [],
    segments: asStrArr(obj.segments),
    recommendations: Array.isArray(obj.recommendations)
      ? obj.recommendations.slice(0, 12).map((r) => {
          const o = (r && typeof r === "object" ? r : {}) as Record<string, unknown>;
          return {
            title: typeof o.title === "string" ? o.title.slice(0, 200) : "",
            rationale: typeof o.rationale === "string" ? o.rationale.slice(0, 600) : "",
            impact: asLevel(o.impact),
            confidence: asLevel(o.confidence),
            evidence: asEvidence(o.evidence),
            verified: true,
          };
        })
      : [],
    quotes: asStrArr(obj.quotes, 12).map((q) => q.slice(0, 240)),
    caveats: asStrArr(obj.caveats),
    followUpQuestions: asStrArr(obj.followUpQuestions),
    overallConfidence: asLevel(obj.overallConfidence),
    verification: { evidenceChecked: 0, evidenceUnsupported: 0, allSupported: true },
    smallSample: false,
  };
}

// ————————————————— التحقق الرقمي (نقيّ) —————————————————
/** مجموعة الأرقام المسموح بها المشتقّة من التجميعات الفعلية */
export function collectAllowedNumbers(agg: Aggregates): number[] {
  const s = new Set<number>();
  const add = (n: number | null | undefined) => {
    if (n != null && Number.isFinite(n)) s.add(Math.round(n));
  };
  const pct = (n: number) => (agg.total > 0 ? (n / agg.total) * 100 : 0);
  add(agg.total);
  add(agg.avgRating);
  for (let i = 0; i <= 10; i++) add(i); // نقاط المقاييس 0..10 (تشمل التقييم 1..5)
  agg.ratingDist.forEach((r) => { add(r.n); add(pct(r.n)); });
  agg.roleDist.forEach((r) => { add(r.n); add(pct(r.n)); });
  agg.featureCounts.forEach((f) => { add(f.n); add(pct(f.n)); });
  agg.npsDist.forEach((d) => { add(d.n); add(pct(d.n)); });
  add(agg.nps.promoters); add(agg.nps.passives); add(agg.nps.detractors); add(agg.nps.answered); add(agg.nps.score);
  return [...s];
}

export function isSupported(value: number, allowed: number[], tol = 1): boolean {
  return allowed.some((a) => Math.abs(a - value) <= tol);
}

/** يتحقق من كل evidence؛ يعلّم غير المدعوم ويخفّض ثقته */
export function verifyNumbers(result: AnalysisResult, allowed: number[]): AnalysisResult {
  let checked = 0;
  let unsupported = 0;

  const verifyList = <T extends { evidence: Evidence[]; verified: boolean; confidence: Level }>(items: T[]) =>
    items.map((it) => {
      let ok = true;
      for (const ev of it.evidence) {
        checked++;
        if (!isSupported(ev.value, allowed)) {
          ok = false;
          unsupported++;
        }
      }
      return ok ? it : { ...it, verified: false, confidence: "low" as Level };
    });

  const recommendations = verifyList(result.recommendations);
  const topRequests = verifyList(result.topRequests);

  return {
    ...result,
    recommendations,
    topRequests,
    verification: { evidenceChecked: checked, evidenceUnsupported: unsupported, allSupported: unsupported === 0 },
  };
}

// ————————————————— التنسيق (يلمس DB + AI) —————————————————
export class AnalysisError extends Error {}

export interface RunAnalysisOutput {
  analysisId: number;
  result: AnalysisResult;
  scopeLabel: string;
  responseCount: number;
  provider: string;
  model: string;
  promptVersion: string;
  durationMs: number;
  dataTo: string | null;
}

export async function runAnalysis(): Promise<RunAnalysisOutput> {
  const filters = { from: null, to: null, role: null };
  const agg = await getAggregates(filters); // التحليل دائمًا على كل الردود (v1) — نطاق مستقل عن فلاتر اللوحة
  if (agg.total < MIN_RESPONSES_FOR_ANALYSIS) {
    throw new AnalysisError(`عدد الردود غير كافٍ للتحليل (الحد الأدنى ${MIN_RESPONSES_FOR_ANALYSIS})`);
  }
  const meta = await getMeta();
  const likes = (await getTextSamples("likes", 30)).map(redactPII).filter(Boolean);
  const suggestions = (await getTextSamples("suggestions", 30)).map(redactPII).filter(Boolean);

  const input = buildAnalysisInput(agg, likes, suggestions);
  const started = Date.now();
  const ai = await callAIJson([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: JSON.stringify(input) },
  ]);
  const durationMs = Date.now() - started;

  const parsed = parseAnalysis(ai.text);
  const allowed = collectAllowedNumbers(agg);
  let result = verifyNumbers(parsed, allowed);
  result = { ...result, smallSample: agg.total < SMALL_SAMPLE_THRESHOLD };

  const scopeLabel = `كل الردود (${agg.total}) حتى ${meta.lastUpdated ?? "الآن"}`;
  const analysisId = await insertAnalysis({
    dataFrom: null,
    dataTo: meta.lastUpdated,
    responseCount: agg.total,
    scopeLabel,
    promptVersion: ANALYSIS_PROMPT_VERSION,
    provider: ai.provider,
    model: ai.model,
    durationMs,
    result,
  });

  return {
    analysisId,
    result,
    scopeLabel,
    responseCount: agg.total,
    provider: ai.provider,
    model: ai.model,
    promptVersion: ANALYSIS_PROMPT_VERSION,
    durationMs,
    dataTo: meta.lastUpdated,
  };
}

export function aiConfigured(): boolean {
  return !!getAIConfig();
}
