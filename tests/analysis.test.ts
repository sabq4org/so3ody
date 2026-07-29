import { describe, it, expect } from "vitest";
import {
  collectAllowedNumbers, isSupported, parseAnalysis, verifyNumbers, buildAnalysisInput,
  type AnalysisResult,
} from "@/lib/analysis";
import type { Aggregates } from "@/lib/db";

const agg: Aggregates = {
  total: 10,
  avgRating: 4.2,
  ratingDist: [
    { rating: 5, n: 6 },
    { rating: 4, n: 2 },
    { rating: 3, n: 2 },
  ],
  roleDist: [
    { role: "user", n: 7 },
    { role: "owner", n: 3 },
  ],
  npsDist: [
    { nps: 9, n: 5 },
    { nps: 6, n: 5 },
  ],
  nps: { score: 0, promoters: 5, passives: 0, detractors: 5, answered: 10 },
  featureCounts: [
    { key: "live", n: 8 },
    { key: "news", n: 4 },
  ],
};

describe("collectAllowedNumbers + isSupported — التحقق الرقمي", () => {
  const allowed = collectAllowedNumbers(agg);
  it("يشمل الأعداد والنسب الفعلية", () => {
    expect(isSupported(10, allowed)).toBe(true); // الإجمالي
    expect(isSupported(8, allowed)).toBe(true); // عدد طلب live
    expect(isSupported(80, allowed)).toBe(true); // نسبة live = 8/10
    expect(isSupported(70, allowed)).toBe(true); // نسبة user = 7/10
  });
  it("يرفض الأرقام الملفّقة", () => {
    expect(isSupported(93, allowed)).toBe(false);
    expect(isSupported(45, allowed)).toBe(false);
  });
});

describe("parseAnalysis — استجابة منظمة", () => {
  it("يحلّل JSON صحيح", () => {
    const r = parseAnalysis(JSON.stringify({ executiveSummary: "ملخّص", trends: ["أ", "ب"] }));
    expect(r.executiveSummary).toBe("ملخّص");
    expect(r.trends).toEqual(["أ", "ب"]);
  });
  it("يزيل أسوار الكود", () => {
    const r = parseAnalysis('```json\n{"executiveSummary":"x"}\n```');
    expect(r.executiveSummary).toBe("x");
  });
  it("يرمي خطأ على JSON غير صالح", () => {
    expect(() => parseAnalysis("ليس JSON")).toThrow();
  });
});

describe("verifyNumbers — رفض الاستنتاجات غير المدعومة", () => {
  const allowed = collectAllowedNumbers(agg);
  const mk = (value: number): AnalysisResult => ({
    executiveSummary: "",
    trends: [],
    satisfaction: { positives: [], negatives: [] },
    topRequests: [],
    segments: [],
    recommendations: [
      { title: "توصية", rationale: "مبرّر", impact: "high", confidence: "high", evidence: [{ metric: "m", value }], verified: true },
    ],
    quotes: [],
    caveats: [],
    followUpQuestions: [],
    overallConfidence: "high",
    verification: { evidenceChecked: 0, evidenceUnsupported: 0, allSupported: true },
    smallSample: false,
  });

  it("يمرّر الأرقام المدعومة", () => {
    const v = verifyNumbers(mk(80), allowed);
    expect(v.verification.allSupported).toBe(true);
    expect(v.recommendations[0].verified).toBe(true);
  });

  it("يعلّم الأرقام غير المدعومة ويخفّض الثقة", () => {
    const v = verifyNumbers(mk(93), allowed);
    expect(v.verification.allSupported).toBe(false);
    expect(v.verification.evidenceUnsupported).toBe(1);
    expect(v.recommendations[0].verified).toBe(false);
    expect(v.recommendations[0].confidence).toBe("low");
  });
});

describe("buildAnalysisInput — لا بيانات شخصية", () => {
  it("يستخدم العيّنات المنزوعة والأعداد المجمّعة فقط", () => {
    const input = buildAnalysisInput(agg, ["نص لطيف"], ["اقتراح مفيد"]);
    const json = JSON.stringify(input);
    expect(json).not.toContain("@");
    expect(input.totalResponses).toBe(10);
    expect(input.featureDemand[0]).toMatchObject({ count: 8, percent: 80 });
    expect(input.textSamples.likes).toEqual(["نص لطيف"]);
  });
});
