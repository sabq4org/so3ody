import { reports } from "@/lib/data";

const fmt = (n: number) => n.toLocaleString("en-US");

export function Reports() {
  return (
    <>
      <div className="section-title">
        <h2>تقارير</h2>
        <a className="more" href="#">
          كل التقارير ←
        </a>
      </div>
      <div className="rlist">
        {reports.map((r) => (
          <a className="ritem" href="#" key={r.id}>
            <div className="rthumb" style={{ background: r.gradient }} />
            <div className="rbody">
              <h4>{r.title}</h4>
              <div className="rmeta">
                <span>{r.kicker}</span>
                <span>{r.timeLabel}</span>
                <span>👁 {fmt(r.views)}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
