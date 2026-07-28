// نماذج البيانات — تحاكي شكل استجابة الـ API المستقبلي (مركز المباريات + المحتوى)

export interface Team {
  id: string;
  name: string;
  /** اختصار لاتيني للشعار (3 أحرف) */
  abbr: string;
  /** اختصار عربي مصغّر (حرفان) للشارات الصغيرة */
  short: string;
  bg: string; // لون خلفية الشعار
  fg: string; // لون النص داخل الشعار
}

export type MatchStatus = "live" | "done" | "soon";

export interface Match {
  id: string;
  competition: string;
  home: Team;
  away: Team;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  /** الدقيقة الحالية للمباريات المباشرة، مثل "67'" */
  minute?: string;
  /** وقت الانطلاق للمباريات القادمة، مثل "20:00" */
  kickoff?: string;
  venue?: string;
  round?: string;
  note?: string;
}

export type CategoryTone = "green" | "gold" | "live";

export interface Article {
  id: string;
  title: string;
  excerpt?: string;
  category: string;
  /** تصنيف داخلي للفلترة في التبويبات */
  categoryKey: "saudi" | "arab" | "world" | "infographic";
  tone?: CategoryTone;
  team?: Team;
  timeLabel: string;
  views?: number;
  comments?: number;
  size?: "big" | "normal";
  /** تدرّج مؤقّت بدل الصورة (يُستبدل بصورة حقيقية من المزوّد) */
  gradient: string;
}

export interface Report {
  id: string;
  title: string;
  kicker: string;
  timeLabel: string;
  views: number;
  gradient: string;
}

export interface VideoItem {
  id: string;
  title: string;
  duration: string;
  gradient: string;
}

export interface StandingRow {
  rank: number;
  team: Team;
  played: number;
  goalDiff: string;
  points: number;
  qualifying: boolean;
}

export interface MostReadItem {
  rank: number;
  title: string;
}

export type TransferStatus = "confirmed" | "rumor" | "talks";

export interface Transfer {
  team: Team;
  player: string;
  status: TransferStatus;
  incoming: boolean;
}

export interface PollOption {
  label: string;
  pct: number;
  winner?: boolean;
}

export interface Poll {
  question: string;
  options: PollOption[];
  totalVotes: number;
}
