import type { Team } from "@/lib/types";

/** شارة الفريق — دائرة ملوّنة بحروف الاختصار (بديل مؤقّت عن شعار حقيقي) */
export function Crest({
  team,
  size = "md",
  label = "abbr",
}: {
  team: Team;
  size?: "md" | "mini";
  label?: "abbr" | "short";
}) {
  return (
    <span
      className={`crest${size === "mini" ? " mini" : ""}`}
      style={{ background: team.bg, color: team.fg }}
      aria-hidden
    >
      {label === "short" ? team.short : team.abbr}
    </span>
  );
}
