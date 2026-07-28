import { breakingNews } from "@/lib/data";

export function BreakingTicker() {
  return (
    <div className="breaking">
      <div className="wrap">
        <span className="lbl">عاجل</span>
        <div className="track">
          {breakingNews.map((b, i) => (
            <span key={i}>
              <b>{b.time}</b>
              {b.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
