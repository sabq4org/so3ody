"use client";

import { useState } from "react";
import { AnalysisView } from "./AnalysisView";
import type { AnalysisResult } from "@/lib/analysis";

export interface AnalysisSnapshot {
  result: AnalysisResult;
  scopeLabel: string;
  responseCount: number;
  provider: string;
  model: string;
  promptVersion: string;
  createdAt: string;
  durationMs: number;
}

function fmtDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("ar", {
      dateStyle: "medium",
      timeStyle: "short",
      calendar: "gregory",
      numberingSystem: "latn",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function AnalyzePanel({
  initial,
  aiConfigured,
}: {
  initial: AnalysisSnapshot | null;
  aiConfigured: boolean;
}) {
  const [current, setCurrent] = useState<AnalysisSnapshot | null>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/analyze", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "تعذّر إنشاء التحليل");
      setCurrent({
        result: data.result,
        scopeLabel: data.scopeLabel,
        responseCount: data.responseCount,
        provider: data.provider,
        model: data.model,
        promptVersion: data.promptVersion,
        createdAt: new Date().toISOString(),
        durationMs: data.durationMs,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="adm-ai">
      <div className="adm-ai-head">
        <div>
          <h3>🤖 تحليل النتائج بالذكاء الاصطناعي</h3>
          {current ? (
            <div className="adm-ai-meta">
              آخر تحليل: {fmtDate(current.createdAt)} · النطاق: {current.scopeLabel}
              <br />
              النموذج: {current.model} · القالب: {current.promptVersion} · المدة: {Math.round(current.durationMs / 100) / 10}ث
            </div>
          ) : (
            <div className="adm-ai-meta">لم يُنشأ تحليل بعد.</div>
          )}
        </div>
        <button className="adm-btn primary" onClick={run} disabled={loading || !aiConfigured}>
          {loading ? "جارٍ التحليل…" : "تشغيل تحليل جديد"}
        </button>
      </div>

      {!aiConfigured && (
        <div className="adm-note warn">خدمة الذكاء الاصطناعي غير مهيّأة — اضبط AI_API_KEY لتفعيل التحليل.</div>
      )}
      {error && (
        <div className="adm-note warn">
          {error}
          <button className="adm-btn" style={{ marginInlineStart: 10 }} onClick={run} disabled={loading}>
            إعادة المحاولة
          </button>
        </div>
      )}

      {current ? (
        <AnalysisView result={current.result} />
      ) : (
        aiConfigured && (
          <div className="adm-empty">اضغط «تشغيل تحليل جديد» لإنشاء قراءة احترافية مدعومة بالأرقام.</div>
        )
      )}
    </div>
  );
}
