"use client";

import { useState } from "react";
import { homePoll } from "@/lib/data";

const fmt = (n: number) => n.toLocaleString("en-US");

export function Poll() {
  const [voted, setVoted] = useState<string | null>(null);

  return (
    <div className="widget poll">
      <h3>استطلاع الرأي</h3>
      <div className="pq">{homePoll.question}</div>
      {homePoll.options.map((o) => (
        <button
          key={o.label}
          type="button"
          className={`popt${o.winner ? " win" : ""}`}
          onClick={() => setVoted(o.label)}
        >
          <div className="prow">
            <span>
              {o.label}
              {voted === o.label ? " ✓" : ""}
            </span>
            <span className="pn">{o.pct}%</span>
          </div>
          <div className="pbar">
            <i style={{ width: `${o.pct}%` }} />
          </div>
        </button>
      ))}
      <div className="pfoot">{fmt(homePoll.totalVotes)} صوتًا · شارك برأيك</div>
    </div>
  );
}
