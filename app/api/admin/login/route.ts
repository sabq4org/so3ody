import { NextResponse } from "next/server";
import {
  checkAdminPassword, createAdminToken, isAdminConfigured, SESSION_COOKIE, sessionCookieOptions,
} from "@/lib/auth";
import { hashIp } from "@/lib/db";
import { rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ ok: false, error: "لوحة الإدارة غير مهيّأة (اضبط ADMIN_PASSWORD)" }, { status: 503 });
  }

  const fwd = req.headers.get("x-forwarded-for");
  const ip = (fwd ? fwd.split(",")[0] : req.headers.get("x-real-ip") || "").trim();
  const rl = rateLimit(`login:${hashIp(ip) ?? "unknown"}`, 8, 10 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json({ ok: false, error: "محاولات دخول كثيرة، انتظر قليلاً" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "طلب غير صالح" }, { status: 400 });
  }
  const password = (body as { password?: unknown } | null)?.password;

  if (!checkAdminPassword(password)) {
    return NextResponse.json({ ok: false, error: "كلمة المرور غير صحيحة" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, createAdminToken(), sessionCookieOptions);
  return res;
}
