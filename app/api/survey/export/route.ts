import { NextResponse } from "next/server";
import { getAllForExport } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const csvCell = (v: unknown): string => {
  if (v == null) return "";
  const s =
    v instanceof Date ? v.toISOString() : typeof v === "object" ? JSON.stringify(v) : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// تصدير CSV للتحليل — محميّ بتوكن الإدارة
export async function GET(req: Request) {
  const token = process.env.SURVEY_ADMIN_TOKEN;
  const key = new URL(req.url).searchParams.get("key");
  if (!token || key !== token) {
    return NextResponse.json({ ok: false, error: "غير مصرّح" }, { status: 401 });
  }

  const rows = await getAllForExport();
  const headers = [
    "id", "created_at", "name", "contact", "role",
    "overall_rating", "nps", "features", "likes", "suggestions", "consent",
  ];
  const lines = [
    "﻿" + headers.join(","), // BOM لدعم العربية في Excel
    ...rows.map((r) => headers.map((h) => csvCell(r[h])).join(",")),
  ];

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="so3ody-survey.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
