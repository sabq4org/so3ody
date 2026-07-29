import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { safeEqual, signSession, verifySession } from "./session";

export const SESSION_COOKIE = "so3ody_admin";
const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 أيام

function adminPassword(): string | null {
  return process.env.ADMIN_PASSWORD || process.env.SURVEY_ADMIN_TOKEN || null;
}

function sessionSecret(): string {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  // اشتقاق سرّ من كلمة المرور إن لم يُضبط SESSION_SECRET (تغيير الكلمة يُبطل الجلسات)
  return createHash("sha256").update(`so3ody-session|${adminPassword() ?? "unset"}`).digest("hex");
}

export function isAdminConfigured(): boolean {
  return !!adminPassword();
}

export function checkAdminPassword(input: unknown): boolean {
  const pw = adminPassword();
  if (!pw || typeof input !== "string" || input.length === 0) return false;
  return safeEqual(input, pw);
}

export function createAdminToken(now: number = Date.now(), ttlMs: number = DEFAULT_TTL_MS): string {
  return signSession(now + ttlMs, sessionSecret());
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: Math.floor(DEFAULT_TTL_MS / 1000),
};

/** فحص خادمي للجلسة — يُستخدم في صفحات ومسارات الإدارة */
export function isAdminAuthed(): boolean {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return verifySession(token, sessionSecret());
}
