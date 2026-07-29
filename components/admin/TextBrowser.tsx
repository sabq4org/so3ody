"use client";

import { useCallback, useEffect, useState } from "react";
import { ROLE_LABELS } from "@/lib/survey";

interface Row {
  id: number;
  created_at: string;
  role: string;
  text: string;
}
interface Filters {
  from: string | null;
  to: string | null;
  role: string | null;
}

function fmtDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("ar", {
      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
      calendar: "gregory", numberingSystem: "latn",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function TextBrowser({ filters }: { filters: Filters }) {
  const [field, setField] = useState<"suggestions" | "likes">("suggestions");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ rows: Row[]; total: number; page: number; pageSize: number } | null>(null);
  const [loading, setLoading] = useState(false);

  // debounce البحث
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 400);
    return () => clearTimeout(t);
  }, [q]);

  // إعادة الصفحة للأولى عند تغيير الحقل/البحث
  useEffect(() => {
    setPage(1);
  }, [field, debouncedQ]);

  const load = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams();
    p.set("field", field);
    if (debouncedQ) p.set("q", debouncedQ);
    p.set("page", String(page));
    if (filters.from) p.set("from", filters.from);
    if (filters.to) p.set("to", filters.to);
    if (filters.role) p.set("role", filters.role);
    try {
      const res = await fetch(`/api/admin/texts?${p.toString()}`);
      const d = await res.json().catch(() => ({}));
      if (d.ok) setData(d);
    } finally {
      setLoading(false);
    }
  }, [field, debouncedQ, page, filters]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div>
      <div className="adm-textbar">
        <div className="grp" style={{ display: "inline-flex", gap: 4, background: "var(--panel)", borderRadius: 100, padding: 3 }}>
          <button className={field === "suggestions" ? "on" : ""} onClick={() => setField("suggestions")} type="button"
            style={btn(field === "suggestions")}>الاقتراحات</button>
          <button className={field === "likes" ? "on" : ""} onClick={() => setField("likes")} type="button"
            style={btn(field === "likes")}>ما يعجبهم</button>
        </div>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث في النصوص…"
        />
        <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)" }}>
          {data ? `${data.total} نتيجة` : ""}
        </span>
      </div>

      {loading && !data ? (
        <div className="adm-empty">جارٍ التحميل…</div>
      ) : data && data.rows.length > 0 ? (
        <>
          <div className="adm-textlist">
            {data.rows.map((r) => (
              <div className="adm-textitem" key={r.id}>
                <div className="meta">
                  <span className="role">{ROLE_LABELS[r.role] || r.role}</span>
                  <span>{fmtDate(r.created_at)}</span>
                </div>
                <p>{r.text}</p>
              </div>
            ))}
          </div>
          <div className="adm-pager">
            <button className="adm-btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>السابق</button>
            <span>صفحة {page} من {totalPages}</span>
            <button className="adm-btn" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>التالي</button>
          </div>
        </>
      ) : (
        <div className="adm-empty">لا توجد إجابات نصية مطابقة.</div>
      )}
    </div>
  );
}

function btn(on: boolean): React.CSSProperties {
  return {
    border: "none",
    background: on ? "var(--surface)" : "transparent",
    color: on ? "var(--green)" : "var(--muted)",
    fontFamily: "inherit",
    fontSize: 13,
    fontWeight: 700,
    padding: "6px 14px",
    borderRadius: 100,
    cursor: "pointer",
    boxShadow: on ? "var(--shadow)" : "none",
  };
}
