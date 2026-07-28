import { liveMatches } from "@/lib/data";
import type { Match } from "@/lib/types";
import { Crest } from "./Crest";

function statusLabel(m: Match) {
  if (m.status === "live") return m.minute;
  if (m.status === "done") return "انتهت";
  return m.kickoff;
}

function MatchCard({ m }: { m: Match }) {
  return (
    <div className="mcard">
      <div className="comp">
        <span>{m.competition}</span>
        <span className={`status ${m.status}`}>{statusLabel(m)}</span>
      </div>
      <div className="mrow">
        <Crest team={m.home} />
        <span className="tn">{m.home.name}</span>
        <span className="sc">{m.homeScore ?? "–"}</span>
      </div>
      <div className="mrow">
        <Crest team={m.away} />
        <span className="tn">{m.away.name}</span>
        <span className="sc">{m.awayScore ?? "–"}</span>
      </div>
      <div className="foot">
        <span>{m.venue}</span>
        <span>{m.round ?? m.note}</span>
      </div>
    </div>
  );
}

export function LiveMatchesStrip() {
  return (
    <div className="livewrap">
      <div className="wrap">
        <div className="strip-head">
          <h2>
            مباريات اليوم <span className="tag">مباشر</span>
          </h2>
          <a href="#">كل المباريات ←</a>
        </div>
        <div className="livestrip">
          {liveMatches.map((m) => (
            <MatchCard key={m.id} m={m} />
          ))}
        </div>
      </div>
    </div>
  );
}
