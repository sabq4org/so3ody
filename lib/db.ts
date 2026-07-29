import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { createHash } from "node:crypto";
import type { SurveyPayload } from "./survey";
import { SURVEY_ID, SURVEY_VERSION } from "./survey";

let _sql: NeonQueryFunction<false, false> | null = null;

function getSql(): NeonQueryFunction<false, false> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL غير مضبوط — أضِفه في .env.local");
  }
  if (!_sql) _sql = neon(process.env.DATABASE_URL);
  return _sql;
}

// ————————————————— الهجرة (إضافية فقط، غير مدمّرة) —————————————————
let ensured = false;
export async function ensureSchema(): Promise<void> {
  if (ensured) return;
  const sql = getSql();

  await sql`
    CREATE TABLE IF NOT EXISTS so3ody_survey_responses (
      id             BIGSERIAL PRIMARY KEY,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
      name           TEXT,
      contact        TEXT,
      role           TEXT NOT NULL,
      overall_rating SMALLINT,
      nps            SMALLINT,
      features       JSONB,
      likes          TEXT,
      suggestions    TEXT,
      consent        BOOLEAN DEFAULT false,
      user_agent     TEXT,
      ip_hash        TEXT,
      source         TEXT
    )`;
  // أعمدة جديدة (متوافقة مع البيانات القائمة)
  await sql`ALTER TABLE so3ody_survey_responses ADD COLUMN IF NOT EXISTS participation_id UUID`;
  await sql`ALTER TABLE so3ody_survey_responses ADD COLUMN IF NOT EXISTS survey_version SMALLINT`;
  // تعبئة معرّف المشاركة للصفوف القديمة قبل فرض التفرّد
  await sql`UPDATE so3ody_survey_responses SET participation_id = gen_random_uuid() WHERE participation_id IS NULL`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS so3ody_survey_participation_uidx ON so3ody_survey_responses (participation_id)`;
  await sql`CREATE INDEX IF NOT EXISTS so3ody_survey_created_idx ON so3ody_survey_responses (created_at)`;

  // سجل تحليلات الذكاء الاصطناعي (تاريخي)
  await sql`
    CREATE TABLE IF NOT EXISTS so3ody_ai_analyses (
      id             BIGSERIAL PRIMARY KEY,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
      survey_id      TEXT NOT NULL,
      data_from      TIMESTAMPTZ,
      data_to        TIMESTAMPTZ,
      response_count INT NOT NULL,
      scope_label    TEXT,
      prompt_version TEXT NOT NULL,
      provider       TEXT NOT NULL,
      model          TEXT NOT NULL,
      duration_ms    INT,
      result         JSONB NOT NULL
    )`;

  ensured = true;
}

/** تجزئة IP (لا نخزّن العنوان الكامل) — لإزالة التكرار والحدّ من الإساءة فقط */
export function hashIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  return createHash("sha256").update(`${ip}|so3ody-survey`).digest("hex").slice(0, 16);
}

export interface InsertMeta {
  userAgent: string | null;
  ipHash: string | null;
  source: string;
}

export interface InsertResult {
  id: number;
  duplicate: boolean;
}

/** إدراج idempotent: نفس participationId لا يُنشئ صفًّا جديدًا */
export async function insertResponse(v: SurveyPayload, meta: InsertMeta): Promise<InsertResult> {
  const sql = getSql();
  await ensureSchema();
  const rows = (await sql`
    INSERT INTO so3ody_survey_responses
      (participation_id, survey_version, name, contact, role, overall_rating, nps, features, likes, suggestions, consent, user_agent, ip_hash, source)
    VALUES
      (${v.participationId}::uuid, ${SURVEY_VERSION}, ${v.name}, ${v.contact}, ${v.role}, ${v.overallRating}, ${v.nps},
       ${JSON.stringify(v.features)}::jsonb, ${v.likes}, ${v.suggestions}, ${v.consent},
       ${meta.userAgent}, ${meta.ipHash}, ${meta.source})
    ON CONFLICT (participation_id) DO NOTHING
    RETURNING id`) as { id: number }[];

  if (rows.length > 0) return { id: rows[0].id, duplicate: false };

  const existing = (await sql`
    SELECT id FROM so3ody_survey_responses WHERE participation_id = ${v.participationId}::uuid
  `) as { id: number }[];
  return { id: existing[0]?.id ?? -1, duplicate: true };
}

// ————————————————— الفلاتر والتجميع —————————————————
export interface Filters {
  from: string | null; // ISO
  to: string | null; // ISO
  role: string | null;
}

export interface Aggregates {
  total: number;
  avgRating: number | null;
  ratingDist: { rating: number; n: number }[];
  roleDist: { role: string; n: number }[];
  npsDist: { nps: number; n: number }[];
  nps: { score: number | null; promoters: number; passives: number; detractors: number; answered: number };
  featureCounts: { key: string; n: number }[];
}

export async function getAggregates(f: Filters): Promise<Aggregates> {
  const sql = getSql();
  await ensureSchema();
  const { from, to, role } = f;

  const totalRow = (await sql`
    SELECT count(*)::int AS n, round(avg(overall_rating)::numeric, 2) AS avg
    FROM so3ody_survey_responses
    WHERE (${from}::timestamptz IS NULL OR created_at >= ${from}::timestamptz)
      AND (${to}::timestamptz IS NULL OR created_at <= ${to}::timestamptz)
      AND (${role}::text IS NULL OR role = ${role})
  `) as { n: number; avg: string | null }[];

  const ratingDist = (await sql`
    SELECT overall_rating AS rating, count(*)::int AS n
    FROM so3ody_survey_responses
    WHERE overall_rating IS NOT NULL
      AND (${from}::timestamptz IS NULL OR created_at >= ${from}::timestamptz)
      AND (${to}::timestamptz IS NULL OR created_at <= ${to}::timestamptz)
      AND (${role}::text IS NULL OR role = ${role})
    GROUP BY overall_rating ORDER BY overall_rating DESC
  `) as { rating: number; n: number }[];

  const roleDist = (await sql`
    SELECT role, count(*)::int AS n
    FROM so3ody_survey_responses
    WHERE (${from}::timestamptz IS NULL OR created_at >= ${from}::timestamptz)
      AND (${to}::timestamptz IS NULL OR created_at <= ${to}::timestamptz)
      AND (${role}::text IS NULL OR role = ${role})
    GROUP BY role ORDER BY n DESC
  `) as { role: string; n: number }[];

  const npsDist = (await sql`
    SELECT nps, count(*)::int AS n
    FROM so3ody_survey_responses
    WHERE nps IS NOT NULL
      AND (${from}::timestamptz IS NULL OR created_at >= ${from}::timestamptz)
      AND (${to}::timestamptz IS NULL OR created_at <= ${to}::timestamptz)
      AND (${role}::text IS NULL OR role = ${role})
    GROUP BY nps ORDER BY nps
  `) as { nps: number; n: number }[];

  const npsRow = (await sql`
    SELECT
      count(*) FILTER (WHERE nps >= 9)::int AS promoters,
      count(*) FILTER (WHERE nps BETWEEN 7 AND 8)::int AS passives,
      count(*) FILTER (WHERE nps <= 6 AND nps IS NOT NULL)::int AS detractors,
      count(*) FILTER (WHERE nps IS NOT NULL)::int AS answered
    FROM so3ody_survey_responses
    WHERE (${from}::timestamptz IS NULL OR created_at >= ${from}::timestamptz)
      AND (${to}::timestamptz IS NULL OR created_at <= ${to}::timestamptz)
      AND (${role}::text IS NULL OR role = ${role})
  `) as { promoters: number; passives: number; detractors: number; answered: number }[];

  const featureCounts = (await sql`
    SELECT f AS key, count(*)::int AS n
    FROM so3ody_survey_responses, jsonb_array_elements_text(COALESCE(features, '[]'::jsonb)) AS f
    WHERE (${from}::timestamptz IS NULL OR created_at >= ${from}::timestamptz)
      AND (${to}::timestamptz IS NULL OR created_at <= ${to}::timestamptz)
      AND (${role}::text IS NULL OR role = ${role})
    GROUP BY f ORDER BY n DESC
  `) as { key: string; n: number }[];

  const nps = npsRow[0];
  const npsScore = nps.answered > 0 ? Math.round(((nps.promoters - nps.detractors) / nps.answered) * 100) : null;

  return {
    total: totalRow[0].n,
    avgRating: totalRow[0].avg != null ? Number(totalRow[0].avg) : null,
    ratingDist,
    roleDist,
    npsDist,
    nps: { score: npsScore, promoters: nps.promoters, passives: nps.passives, detractors: nps.detractors, answered: nps.answered },
    featureCounts,
  };
}

export interface Meta {
  totalAll: number;
  lastUpdated: string | null;
}

export async function getMeta(): Promise<Meta> {
  const sql = getSql();
  await ensureSchema();
  const row = (await sql`SELECT count(*)::int AS n, max(created_at) AS last FROM so3ody_survey_responses`) as {
    n: number;
    last: string | null;
  }[];
  return { totalAll: row[0].n, lastUpdated: row[0].last };
}

// ————————————————— الإجابات النصية (ترقيم + بحث في الخادم) —————————————————
export interface TextAnswer {
  id: number;
  created_at: string;
  role: string;
  text: string;
}
export interface TextPage {
  rows: TextAnswer[];
  total: number;
  page: number;
  pageSize: number;
}

export async function getTextAnswers(
  field: "likes" | "suggestions",
  f: Filters,
  q: string | null,
  page: number,
  pageSize: number,
): Promise<TextPage> {
  const sql = getSql();
  await ensureSchema();
  const safePage = Math.max(1, Math.floor(page) || 1);
  const safeSize = Math.min(50, Math.max(5, Math.floor(pageSize) || 20));
  const offset = (safePage - 1) * safeSize;
  const like = q && q.trim() ? `%${q.trim()}%` : null;
  const { from, to, role } = f;

  // العمود مُقيّد بقيمتين معروفتين — نتفرّع لتفادي إقحام أسماء أعمدة
  if (field === "likes") {
    const rows = (await sql`
      SELECT id, created_at, role, likes AS text FROM so3ody_survey_responses
      WHERE likes IS NOT NULL AND (${like}::text IS NULL OR likes ILIKE ${like})
        AND (${from}::timestamptz IS NULL OR created_at >= ${from}::timestamptz)
        AND (${to}::timestamptz IS NULL OR created_at <= ${to}::timestamptz)
        AND (${role}::text IS NULL OR role = ${role})
      ORDER BY id DESC LIMIT ${safeSize} OFFSET ${offset}
    `) as TextAnswer[];
    const cnt = (await sql`
      SELECT count(*)::int AS n FROM so3ody_survey_responses
      WHERE likes IS NOT NULL AND (${like}::text IS NULL OR likes ILIKE ${like})
        AND (${from}::timestamptz IS NULL OR created_at >= ${from}::timestamptz)
        AND (${to}::timestamptz IS NULL OR created_at <= ${to}::timestamptz)
        AND (${role}::text IS NULL OR role = ${role})
    `) as { n: number }[];
    return { rows, total: cnt[0].n, page: safePage, pageSize: safeSize };
  }
  const rows = (await sql`
    SELECT id, created_at, role, suggestions AS text FROM so3ody_survey_responses
    WHERE suggestions IS NOT NULL AND (${like}::text IS NULL OR suggestions ILIKE ${like})
      AND (${from}::timestamptz IS NULL OR created_at >= ${from}::timestamptz)
      AND (${to}::timestamptz IS NULL OR created_at <= ${to}::timestamptz)
      AND (${role}::text IS NULL OR role = ${role})
    ORDER BY id DESC LIMIT ${safeSize} OFFSET ${offset}
  `) as TextAnswer[];
  const cnt = (await sql`
    SELECT count(*)::int AS n FROM so3ody_survey_responses
    WHERE suggestions IS NOT NULL AND (${like}::text IS NULL OR suggestions ILIKE ${like})
      AND (${from}::timestamptz IS NULL OR created_at >= ${from}::timestamptz)
      AND (${to}::timestamptz IS NULL OR created_at <= ${to}::timestamptz)
      AND (${role}::text IS NULL OR role = ${role})
  `) as { n: number }[];
  return { rows, total: cnt[0].n, page: safePage, pageSize: safeSize };
}

/** عيّنات نصية منزوعة الهوية للتحليل (تُمرَّر لطبقة إزالة PII قبل الإرسال) */
export async function getTextSamples(field: "likes" | "suggestions", limit: number): Promise<string[]> {
  const sql = getSql();
  await ensureSchema();
  const cap = Math.min(60, Math.max(1, limit));
  const rows =
    field === "likes"
      ? ((await sql`SELECT likes AS text FROM so3ody_survey_responses WHERE likes IS NOT NULL ORDER BY id DESC LIMIT ${cap}`) as { text: string }[])
      : ((await sql`SELECT suggestions AS text FROM so3ody_survey_responses WHERE suggestions IS NOT NULL ORDER BY id DESC LIMIT ${cap}`) as { text: string }[]);
  return rows.map((r) => r.text);
}

// ————————————————— سجل تحليلات AI —————————————————
export interface AnalysisRecord {
  dataFrom: string | null;
  dataTo: string | null;
  responseCount: number;
  scopeLabel: string;
  promptVersion: string;
  provider: string;
  model: string;
  durationMs: number;
  result: unknown;
}

export interface StoredAnalysis extends AnalysisRecord {
  id: number;
  createdAt: string;
  surveyId: string;
}

export async function insertAnalysis(rec: AnalysisRecord): Promise<number> {
  const sql = getSql();
  await ensureSchema();
  const rows = (await sql`
    INSERT INTO so3ody_ai_analyses
      (survey_id, data_from, data_to, response_count, scope_label, prompt_version, provider, model, duration_ms, result)
    VALUES
      (${SURVEY_ID}, ${rec.dataFrom}, ${rec.dataTo}, ${rec.responseCount}, ${rec.scopeLabel},
       ${rec.promptVersion}, ${rec.provider}, ${rec.model}, ${rec.durationMs}, ${JSON.stringify(rec.result)}::jsonb)
    RETURNING id`) as { id: number }[];
  return rows[0].id;
}

export async function getLatestAnalysis(): Promise<StoredAnalysis | null> {
  const sql = getSql();
  await ensureSchema();
  const rows = (await sql`
    SELECT id, created_at, survey_id, data_from, data_to, response_count, scope_label, prompt_version, provider, model, duration_ms, result
    FROM so3ody_ai_analyses ORDER BY id DESC LIMIT 1
  `) as Record<string, unknown>[];
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id as number,
    createdAt: String(r.created_at),
    surveyId: r.survey_id as string,
    dataFrom: r.data_from ? String(r.data_from) : null,
    dataTo: r.data_to ? String(r.data_to) : null,
    responseCount: r.response_count as number,
    scopeLabel: (r.scope_label as string) ?? "",
    promptVersion: r.prompt_version as string,
    provider: r.provider as string,
    model: r.model as string,
    durationMs: (r.duration_ms as number) ?? 0,
    result: r.result,
  };
}

/** آخر وقت تشغيل تحليل — لتطبيق فترة تهدئة */
export async function getLastAnalysisAt(): Promise<number | null> {
  const sql = getSql();
  await ensureSchema();
  const rows = (await sql`SELECT max(created_at) AS last FROM so3ody_ai_analyses`) as { last: string | null }[];
  return rows[0].last ? new Date(rows[0].last).getTime() : null;
}

// ————————————————— تصدير CSV (بلا بيانات شخصية أو حقول داخلية) —————————————————
export async function getExportRows(): Promise<Record<string, unknown>[]> {
  const sql = getSql();
  await ensureSchema();
  return (await sql`
    SELECT id, created_at, role, overall_rating, nps, features, likes, suggestions, consent
    FROM so3ody_survey_responses ORDER BY id DESC
  `) as Record<string, unknown>[];
}
