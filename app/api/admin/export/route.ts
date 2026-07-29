import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/auth";
import { getExportRows } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const csvCell = (v: unknown): string => {
  if (v == null) return "";
  const s = v instanceof Date ? v.toISOString() : typeof v === "object" ? JSON.stringify(v) : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// تصدير CSV — محميّ بجلسة الإدارة، بلا اسم/تواصل/IP/user-agent
export async function GET() {
  if (!isAdminAuthed()) {
    return NextResponse.json({ ok: false, error: "غير مصرّح" }, { status: 401 });
  }
  const rows = await getExportRows();
  const headers = ["id", "created_at", "role", "overall_rating", "nps", "features", "likes", "suggestions", "consent"];
  const lines = [
    "﻿" + headers.join(","), // BOM لدعم العربية في Excel
    ...rows.map((r) => headers.map((h) => csvCell(r[h])).join(",")),
  ];
  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="so3ody-survey.csv"',
      "Cache-Control": "no-store",
    },
  });
}
