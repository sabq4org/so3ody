import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { createHash } from "node:crypto";
import type { SurveyPayload } from "./survey";

let _sql: NeonQueryFunction<false, false> | null = null;

function getSql(): NeonQueryFunction<false, false> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL غير مضبوط — أضِفه في .env.local");
  }
  if (!_sql) _sql = neon(process.env.DATABASE_URL);
  return _sql;
}

let ensured = false;
export async function ensureTable(): Promise<void> {
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
    )
  `;
  ensured = true;
}

/** تجزئة عنوان IP (بدون تخزينه صريحًا) لأغراض إزالة التكرار فقط */
export function hashIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  return createHash("sha256").update(`${ip}|so3ody-survey`).digest("hex").slice(0, 16);
}

export interface InsertMeta {
  userAgent: string | null;
  ipHash: string | null;
  source: string;
}

export async function insertResponse(v: SurveyPayload, meta: InsertMeta): Promise<number> {
  const sql = getSql();
  await ensureTable();
  const rows = (await sql`
    INSERT INTO so3ody_survey_responses
      (name, contact, role, overall_rating, nps, features, likes, suggestions, consent, user_agent, ip_hash, source)
    VALUES
      (${v.name}, ${v.contact}, ${v.role}, ${v.overallRating}, ${v.nps},
       ${JSON.stringify(v.features)}::jsonb, ${v.likes}, ${v.suggestions}, ${v.consent},
       ${meta.userAgent}, ${meta.ipHash}, ${meta.source})
    RETURNING id
  `) as { id: number }[];
  return rows[0].id;
}

// ————————————————— التحليل / التجميع —————————————————
export interface Aggregates {
  total: number;
  avgRating: number | null;
  ratingDist: { rating: number; n: number }[];
  roleDist: { role: string; n: number }[];
  nps: { score: number | null; promoters: number; passives: number; detractors: number; answered: number };
  featureCounts: { key: string; n: number }[];
}

export async function getAggregates(): Promise<Aggregates> {
  const sql = getSql();
  await ensureTable();

  const totalRow = (await sql`SELECT count(*)::int AS n, round(avg(overall_rating)::numeric, 2) AS avg FROM so3ody_survey_responses`) as { n: number; avg: string | null }[];
  const ratingDist = (await sql`SELECT overall_rating AS rating, count(*)::int AS n FROM so3ody_survey_responses WHERE overall_rating IS NOT NULL GROUP BY overall_rating ORDER BY overall_rating DESC`) as { rating: number; n: number }[];
  const roleDist = (await sql`SELECT role, count(*)::int AS n FROM so3ody_survey_responses GROUP BY role ORDER BY n DESC`) as { role: string; n: number }[];
  const npsRow = (await sql`
    SELECT
      count(*) FILTER (WHERE nps >= 9)::int AS promoters,
      count(*) FILTER (WHERE nps BETWEEN 7 AND 8)::int AS passives,
      count(*) FILTER (WHERE nps <= 6 AND nps IS NOT NULL)::int AS detractors,
      count(*) FILTER (WHERE nps IS NOT NULL)::int AS answered
    FROM so3ody_survey_responses
  `) as { promoters: number; passives: number; detractors: number; answered: number }[];
  const featureCounts = (await sql`
    SELECT f AS key, count(*)::int AS n
    FROM so3ody_survey_responses, jsonb_array_elements_text(COALESCE(features, '[]'::jsonb)) AS f
    GROUP BY f ORDER BY n DESC
  `) as { key: string; n: number }[];

  const nps = npsRow[0];
  const npsScore = nps.answered > 0 ? Math.round(((nps.promoters - nps.detractors) / nps.answered) * 100) : null;

  return {
    total: totalRow[0].n,
    avgRating: totalRow[0].avg != null ? Number(totalRow[0].avg) : null,
    ratingDist,
    roleDist,
    nps: { score: npsScore, promoters: nps.promoters, passives: nps.passives, detractors: nps.detractors, answered: nps.answered },
    featureCounts,
  };
}

export interface RecentRow {
  id: number;
  created_at: string;
  name: string | null;
  role: string;
  overall_rating: number | null;
  nps: number | null;
  likes: string | null;
  suggestions: string | null;
}

export async function getRecent(limit = 30): Promise<RecentRow[]> {
  const sql = getSql();
  await ensureTable();
  return (await sql`
    SELECT id, created_at, name, role, overall_rating, nps, likes, suggestions
    FROM so3ody_survey_responses
    ORDER BY id DESC
    LIMIT ${limit}
  `) as RecentRow[];
}

export async function getAllForExport(): Promise<Record<string, unknown>[]> {
  const sql = getSql();
  await ensureTable();
  return (await sql`
    SELECT id, created_at, name, contact, role, overall_rating, nps, features, likes, suggestions, consent
    FROM so3ody_survey_responses ORDER BY id DESC
  `) as Record<string, unknown>[];
}
