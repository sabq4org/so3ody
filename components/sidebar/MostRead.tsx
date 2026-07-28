import { mostRead } from "@/lib/data";

export function MostRead() {
  return (
    <div className="widget">
      <div className="wh">
        <h3>
          <span className="ic">🔥</span> الأكثر قراءة
        </h3>
        <a href="#">اليوم</a>
      </div>
      <div className="mread">
        {mostRead.map((m) => (
          <a className="mr" href="#" key={m.rank}>
            <span className="no">{m.rank}</span>
            <h4>{m.title}</h4>
          </a>
        ))}
      </div>
    </div>
  );
}
