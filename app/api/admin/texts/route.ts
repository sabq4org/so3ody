import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/auth";
import { getTextAnswers } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isAdminAuthed()) {
    return NextResponse.json({ ok: false, error: "غير مصرّح" }, { status: 401 });
  }
  const u = new URL(req.url);
  const field = u.searchParams.get("field") === "likes" ? "likes" : "suggestions";
  const q = u.searchParams.get("q");
  const page = Number(u.searchParams.get("page") || "1");
  const from = u.searchParams.get("from");
  const to = u.searchParams.get("to");
  const role = u.searchParams.get("role");

  const data = await getTextAnswers(
    field,
    { from: from || null, to: to || null, role: role || null },
    q,
    page,
    20,
  );
  return NextResponse.json({ ok: true, field, ...data });
}
