import { TodayMatches } from "./TodayMatches";
import { Standings } from "./Standings";
import { MostRead } from "./MostRead";
import { Poll } from "./Poll";
import { AppCta } from "./AppCta";

export function Sidebar() {
  return (
    <aside className="side">
      <TodayMatches />
      <Standings />
      <MostRead />
      <Poll />
      <AppCta />
    </aside>
  );
}
