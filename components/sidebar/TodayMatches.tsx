import { sidebarMatches } from "@/lib/data";
import type { Match } from "@/lib/types";
import { Crest } from "../Crest";

function label(m: Match) {
  if (m.status === "live") return m.minute;
  if (m.status === "done") return "انتهت";
  return m.kickoff;
}

export function TodayMatches() {
  return (
    <div className="widget">
      <div className="wh">
        <h3>
          <span className="ic">📅</span> مباريات اليوم
        </h3>
        <a href="#">الكل</a>
      </div>
      {sidebarMatches.map((m) => (
        <div className="tmatch" key={m.id}>
          <div className="tteams">
            <div className="tt">
              <Crest team={m.home} size="mini" label="short" />
              {m.home.name}
              <span className="tsc">{m.homeScore ?? "–"}</span>
            </div>
            <div className="tt">
              <Crest team={m.away} size="mini" label="short" />
              {m.away.name}
              <span className="tsc">{m.awayScore ?? "–"}</span>
            </div>
          </div>
          <div className={`tstat${m.status === "live" ? " live" : ""}`}>{label(m)}</div>
        </div>
      ))}
    </div>
  );
}
