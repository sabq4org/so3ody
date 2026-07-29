import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/auth";
import { runAnalysis, aiConfigured, AnalysisError } from "@/lib/analysis";
import { getLastAnalysisAt } from "@/lib/db";
import { AIError } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// قفل داخل المثيل لمنع التشغيل المتزامن + فترة تهدئة
let running = false;
const COOLDOWN_MS = 60 * 1000;

export async function POST() {
  if (!isAdminAuthed()) {
    return NextResponse.json({ ok: false, error: "غير مصرّح" }, { status: 401 });
  }
  if (!aiConfigured()) {
    return NextResponse.json(
      { ok: false, error: "خدمة الذكاء الاصطناعي غير مهيّأة (اضبط AI_API_KEY)" },
      { status: 503 },
    );
  }
  if (running) {
    return NextResponse.json({ ok: false, error: "هناك تحليل قيد التشغيل بالفعل" }, { status: 409 });
  }
  const last = await getLastAnalysisAt();
  if (last && Date.now() - last < COOLDOWN_MS) {
    return NextResponse.json(
      { ok: false, error: "يرجى الانتظار دقيقة قبل تشغيل تحليل جديد" },
      { status: 429 },
    );
  }

  running = true;
  try {
    const out = await runAnalysis();
    return NextResponse.json({ ok: true, ...out });
  } catch (err) {
    // فشل الذكاء الاصطناعي لا يؤثر على حفظ الردود أو اللوحة
    if (err instanceof AnalysisError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 422 });
    }
    if (err instanceof AIError) {
      return NextResponse.json({ ok: false, error: err.message, code: err.code }, { status: 502 });
    }
    console.error("[analyze] failed:", err instanceof Error ? err.message : "unknown");
    return NextResponse.json({ ok: false, error: "تعذّر إنشاء التحليل حاليًا" }, { status: 500 });
  } finally {
    running = false;
  }
}
