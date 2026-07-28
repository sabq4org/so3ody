"use client";

import { useState } from "react";
import { latestNews, newsTabs } from "@/lib/data";
import { ArticleCard } from "./ArticleCard";

export function LatestNews() {
  const [tab, setTab] = useState<string>("all");
  const items = tab === "all" ? latestNews : latestNews.filter((a) => a.categoryKey === tab);

  return (
    <>
      <div className="section-title">
        <h2>آخر الأخبار</h2>
        <a className="more" href="#">
          عرض الكل ←
        </a>
      </div>

      <div className="tabs" role="tablist" aria-label="تصنيفات الأخبار">
        {newsTabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            className={tab === t.key ? "on" : ""}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="ngrid">
        {items.length ? (
          items.map((a) => <ArticleCard key={a.id} a={a} />)
        ) : (
          <p style={{ color: "var(--muted)" }}>لا توجد أخبار في هذا القسم حاليًا.</p>
        )}
      </div>
    </>
  );
}
