import { transfers } from "@/lib/data";
import type { TransferStatus } from "@/lib/types";
import { Crest } from "./Crest";

const statusLabel: Record<TransferStatus, string> = {
  confirmed: "مؤكد",
  rumor: "شائعة",
  talks: "مفاوضات",
};

export function TransfersTicker() {
  return (
    <div className="transfers">
      <div className="wrap">
        <span className="tlbl">🔁 سوق الانتقالات</span>
        <div className="tlist">
          {transfers.map((t, i) => (
            <span className="tchip" key={i}>
              <Crest team={t.team} size="mini" label="short" />
              {t.player}
              {t.incoming ? (
                <>
                  {" "}
                  <span className="arw">←</span> {t.team.name}
                </>
              ) : null}
              <span className={`st ${t.status}`}>{statusLabel[t.status]}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
