"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ROLES } from "@/lib/survey";

const PERIODS: [string, string][] = [
  ["all", "الكل"],
  ["7d", "آخر 7 أيام"],
  ["30d", "آخر 30 يومًا"],
];

export function FilterBar() {
  const router = useRouter();
  const sp = useSearchParams();
  const period = sp.get("period") || "all";
  const role = sp.get("role") || "";

  function update(next: Record<string, string>) {
    const p = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) p.set(k, v);
      else p.delete(k);
    }
    router.push(`/admin?${p.toString()}`);
  }

  return (
    <div className="adm-filters">
      <label>الفترة:</label>
      <div className="grp">
        {PERIODS.map(([k, l]) => (
          <button
            key={k}
            className={period === k ? "on" : ""}
            onClick={() => update({ period: k === "all" ? "" : k })}
            type="button"
          >
            {l}
          </button>
        ))}
      </div>
      <label>الصفة:</label>
      <select value={role} onChange={(e) => update({ role: e.target.value })}>
        <option value="">جميع الصفات</option>
        {ROLES.map((r) => (
          <option key={r.key} value={r.key}>
            {r.label}
          </option>
        ))}
      </select>
    </div>
  );
}
