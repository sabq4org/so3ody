import type {
  Team, Match, Article, Report, VideoItem,
  StandingRow, MostReadItem, Transfer, Poll,
} from "./types";

// ————————————————————————— الفرق —————————————————————————
export const teams: Record<string, Team> = {
  hilal:    { id: "hilal",    name: "الهلال",    abbr: "HIL", short: "هل", bg: "#15489C", fg: "#ffffff" },
  nassr:    { id: "nassr",    name: "النصر",     abbr: "NAS", short: "نص", bg: "#F9D616", fg: "#0a2f6b" },
  ittihad:  { id: "ittihad",  name: "الاتحاد",   abbr: "ITT", short: "ات", bg: "#111111", fg: "#F9D616" },
  ahli:     { id: "ahli",     name: "الأهلي",    abbr: "AHL", short: "أه", bg: "#0a6b3b", fg: "#ffffff" },
  shabab:   { id: "shabab",   name: "الشباب",    abbr: "SHB", short: "شب", bg: "#111111", fg: "#ffffff" },
  taawoun:  { id: "taawoun",  name: "التعاون",   abbr: "TAA", short: "تع", bg: "#1a4fa0", fg: "#ffffff" },
  qadisiya: { id: "qadisiya", name: "القادسية",  abbr: "QAD", short: "قا", bg: "#F5C518", fg: "#111111" },
  fateh:    { id: "fateh",    name: "الفتح",     abbr: "FAT", short: "فت", bg: "#D23B26", fg: "#ffffff" },
  ettifaq:  { id: "ettifaq",  name: "الاتفاق",   abbr: "ETT", short: "اف", bg: "#1a4fa0", fg: "#ffffff" },
  khaleej:  { id: "khaleej",  name: "الخليج",    abbr: "KHA", short: "خل", bg: "#0a6b3b", fg: "#ffffff" },
  persepolis:{id: "persepolis",name:"برسبوليس",  abbr: "PER", short: "بر", bg: "#e30613", fg: "#ffffff" },
};

// ————————————————————————— مباريات اليوم —————————————————————————
export const liveMatches: Match[] = [
  { id: "m1", competition: "دوري روشن", home: teams.hilal, away: teams.nassr, homeScore: 2, awayScore: 1, status: "live", minute: "67'", venue: "المملكة أرينا", round: "الجولة 3" },
  { id: "m2", competition: "دوري روشن", home: teams.ittihad, away: teams.ahli, homeScore: 0, awayScore: 0, status: "live", minute: "30'", venue: "الجوهرة المشعة", round: "الشوط الأول" },
  { id: "m3", competition: "دوري روشن", home: teams.shabab, away: teams.taawoun, homeScore: 1, awayScore: 2, status: "done", venue: "الأمير فيصل بن فهد", round: "الجولة 3" },
  { id: "m4", competition: "دوري روشن", home: teams.qadisiya, away: teams.fateh, homeScore: null, awayScore: null, status: "soon", kickoff: "20:00", venue: "الأمير سعود بن جلوي", note: "لم تبدأ" },
  { id: "m5", competition: "أبطال آسيا", home: teams.hilal, away: teams.persepolis, homeScore: null, awayScore: null, status: "soon", kickoff: "22:00", venue: "دور المجموعات", note: "غدًا" },
];

// مباريات مصغّرة للشريط الجانبي
export const sidebarMatches: Match[] = [
  liveMatches[0], liveMatches[1], liveMatches[3],
  { id: "m6", competition: "دوري روشن", home: teams.ettifaq, away: teams.khaleej, homeScore: null, awayScore: null, status: "soon", kickoff: "22:00" },
];

// ————————————————————————— الأخبار —————————————————————————
export const featured: Article = {
  id: "a1", size: "big", category: "كرة سعودية", categoryKey: "saudi", tone: "green", team: teams.hilal,
  title: "أخبار الهلال: تطور هام في الصفقات وإنزاغي يرفع المعدل البدني بمعسكر النمسا",
  excerpt: "كشفت مصادر مقربة عن اقتراب الهلال من إتمام صفقتين جديدتين قبل انطلاق الموسم، فيما يواصل الجهاز الفني رفع الجاهزية البدنية للاعبين في المعسكر التحضيري.",
  timeLabel: "قبل 12 دقيقة", views: 24180, comments: 96,
  gradient: "linear-gradient(135deg,#15489C,#0a2f6b)",
};

export const featuredSecondary: Article[] = [
  { id: "a2", category: "انتقالات", categoryKey: "saudi", tone: "gold", team: teams.nassr,
    title: "النصر يقترب من حسم صفقة مدافع دولي قبل انطلاق الموسم",
    timeLabel: "قبل 40 دقيقة", views: 11540, gradient: "linear-gradient(135deg,#F9D616,#c9a800)" },
  { id: "a3", category: "كرة سعودية", categoryKey: "saudi", team: teams.ittihad,
    title: "الاتحاد يجدد عقد نجمه حتى 2028 بشروط جديدة",
    timeLabel: "قبل ساعة", views: 8920, gradient: "linear-gradient(135deg,#111,#333)" },
];

export const latestNews: Article[] = [
  { id: "n1", category: "أبطال آسيا", categoryKey: "world", team: teams.ahli,
    title: "الأهلي يستهل مشواره الآسيوي بمواجهة قوية أمام بطل أوزبكستان",
    timeLabel: "قبل 20 د", views: 6410, gradient: "linear-gradient(135deg,#0a6b3b,#064023)" },
  { id: "n2", category: "مباشر", categoryKey: "saudi", tone: "live", team: teams.nassr,
    title: "رونالدو يقود تدريبات النصر ويؤكد جاهزيته للموسم الجديد",
    timeLabel: "قبل 35 د", views: 19730, gradient: "linear-gradient(135deg,#e30613,#8a0009)" },
  { id: "n3", category: "كرة عالمية", categoryKey: "world",
    title: "ريال مدريد يحسم صفقة الصيف الكبرى ويعلن التعاقد رسميًا",
    timeLabel: "قبل ساعة", views: 14200, gradient: "linear-gradient(135deg,#5b21b6,#2e1065)" },
  { id: "n4", category: "دوري روشن", categoryKey: "saudi", team: teams.qadisiya,
    title: "القادسية يعزز صفوفه بمهاجم أوروبي استعدادًا للمنافسة",
    timeLabel: "قبل ساعتين", views: 5120, gradient: "linear-gradient(135deg,#F5C518,#b8900a)" },
  { id: "n5", category: "إنفوجرافيك", categoryKey: "infographic", tone: "gold",
    title: "بالأرقام: أغلى صفقات الدوري السعودي هذا الصيف",
    timeLabel: "قبل 3 س", views: 9880, gradient: "linear-gradient(135deg,#1a4fa0,#0d2a5c)" },
  { id: "n6", category: "كرة عربية", categoryKey: "arab",
    title: "الزمالك المصري يقترب من ضم لاعب سعودي في صفقة مفاجئة",
    timeLabel: "قبل 4 س", views: 7340, gradient: "linear-gradient(135deg,#0a6b3b,#043d21)" },
];

export const newsTabs = [
  { key: "all", label: "الكل" },
  { key: "saudi", label: "كرة سعودية" },
  { key: "arab", label: "كرة عربية" },
  { key: "world", label: "كرة عالمية" },
  { key: "infographic", label: "إنفوجرافيك" },
] as const;

export const reports: Report[] = [
  { id: "r1", kicker: "تقرير خاص", title: "تحليل: كيف غيّر إنزاغي طريقة لعب الهلال في الموسم الجديد؟", timeLabel: "قبل 30 د", views: 4120, gradient: "linear-gradient(135deg,#15489C,#0a2f6b)" },
  { id: "r2", kicker: "تقرير", title: "قراءة في مستقبل صفقات الاتحاد: من يبقى ومن يرحل؟", timeLabel: "قبل ساعة", views: 3540, gradient: "linear-gradient(135deg,#111,#333)" },
  { id: "r3", kicker: "تقرير", title: "أرقام مرشحة للتحطم: ماذا ينتظر النصر ورونالدو هذا الموسم؟", timeLabel: "قبل 3 س", views: 6780, gradient: "linear-gradient(135deg,#F9D616,#c9a800)" },
];

export const videos: VideoItem[] = [
  { id: "v1", title: "أهداف مباراة الهلال والنصر في الجولة الثالثة", duration: "2:14", gradient: "linear-gradient(135deg,#15489C,#0a2f6b)" },
  { id: "v2", title: "أجمل لقطات تدريبات الأهلي قبل انطلاق أبطال آسيا", duration: "1:47", gradient: "linear-gradient(135deg,#0a6b3b,#043d21)" },
  { id: "v3", title: "مؤتمر رونالدو الصحفي كاملًا قبل الموسم الجديد", duration: "3:02", gradient: "linear-gradient(135deg,#e30613,#8a0009)" },
  { id: "v4", title: "هدف قاتل يمنح التعاون الفوز على الشباب", duration: "0:58", gradient: "linear-gradient(135deg,#111,#333)" },
];

// ————————————————————————— ترتيب دوري روشن —————————————————————————
export const standings: StandingRow[] = [
  { rank: 1, team: teams.ittihad,  played: 3, goalDiff: "+7", points: 9, qualifying: true },
  { rank: 2, team: teams.hilal,    played: 3, goalDiff: "+5", points: 7, qualifying: true },
  { rank: 3, team: teams.nassr,    played: 3, goalDiff: "+4", points: 6, qualifying: true },
  { rank: 4, team: teams.ahli,     played: 3, goalDiff: "+2", points: 5, qualifying: false },
  { rank: 5, team: teams.qadisiya, played: 3, goalDiff: "0",  points: 4, qualifying: false },
];

export const mostRead: MostReadItem[] = [
  { rank: 1, title: "كواليس مثيرة: كيف تسببت علاقة شراحيلي مع فهد المفرج في رحيله عن الهلال؟" },
  { rank: 2, title: "رسميًا: النصر يعلن التعاقد مع نجم الدوري البرتغالي" },
  { rank: 3, title: "الاتحاد يصدم جماهيره بقرار مفاجئ بشأن قائد الفريق" },
  { rank: 4, title: "موعد قرعة دوري أبطال آسيا للنخبة والأندية المتأهلة" },
  { rank: 5, title: "تعرف على جدول مباريات الجولة الرابعة من دوري روشن" },
];

export const transfers: Transfer[] = [
  { team: teams.hilal,    player: "يوسف أكتشيتشيك", status: "confirmed", incoming: true },
  { team: teams.nassr,    player: "مدافع دولي",     status: "rumor",     incoming: true },
  { team: teams.ahli,     player: "جناح برازيلي",   status: "confirmed", incoming: true },
  { team: teams.ittihad,  player: "تجديد عقد النجم", status: "confirmed", incoming: false },
  { team: teams.qadisiya, player: "مهاجم أوروبي",   status: "talks",     incoming: true },
];

export const homePoll: Poll = {
  question: "من يحسم لقب دوري روشن هذا الموسم؟",
  totalVotes: 12480,
  options: [
    { label: "الهلال",  pct: 41, winner: true },
    { label: "الاتحاد", pct: 28 },
    { label: "النصر",   pct: 21 },
    { label: "الأهلي",  pct: 10 },
  ],
};

export const breakingNews = [
  { time: "الآن",  text: "إنزاغي يعلن قائمة الهلال لمعسكر النمسا ويستبعد ثلاثة لاعبين" },
  { time: "16:40", text: "النصر يقترب من حسم صفقة مدافع دولي قبل انطلاق الموسم" },
  { time: "15:12", text: "الاتحاد يجدد عقد نجمه حتى 2028 بشروط جديدة" },
];
