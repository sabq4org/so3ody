import { standings } from "@/lib/data";
import { Crest } from "../Crest";

export function Standings() {
  return (
    <div className="widget">
      <div className="wh">
        <h3>
          <span className="ic">🏆</span> ترتيب دوري روشن
        </h3>
        <a href="#">التفاصيل</a>
      </div>
      <table className="stbl">
        <thead>
          <tr>
            <th>#</th>
            <th>الفريق</th>
            <th>لعب</th>
            <th>+/−</th>
            <th>نقاط</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((r) => (
            <tr key={r.team.id} className={r.qualifying ? "qual" : ""}>
              <td className="rk">{r.rank}</td>
              <td className="team">
                <Crest team={r.team} size="mini" label="short" />
                {r.team.name}
              </td>
              <td className="mono">{r.played}</td>
              <td className="mono">{r.goalDiff}</td>
              <td className="pts">{r.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
