import { describe, it, expect } from "vitest";
import { validate } from "@/lib/survey";

const base = () => ({
  participationId: "11111111-1111-4111-8111-111111111111",
  role: "user",
  overallRating: 4,
  nps: 8,
  features: ["news", "apps"],
  likes: "الموقع جيد",
  suggestions: "أضيفوا إشعارات",
  consent: false,
});

describe("validate — مسار الحفظ", () => {
  it("يقبل مدخلات صحيحة", () => {
    const r = validate(base());
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.role).toBe("user");
      expect(r.value.overallRating).toBe(4);
      expect(r.value.features).toEqual(["news", "apps"]);
    }
  });

  it("يرفض صفة غير معروفة", () => {
    expect(validate({ ...base(), role: "hacker" }).ok).toBe(false);
  });

  it("يرفض تقييمًا خارج النطاق", () => {
    expect(validate({ ...base(), overallRating: 6 }).ok).toBe(false);
    expect(validate({ ...base(), overallRating: 0 }).ok).toBe(false);
  });

  it("يرفض NPS خارج النطاق ويقبل null", () => {
    expect(validate({ ...base(), nps: 11 }).ok).toBe(false);
    const r = validate({ ...base(), nps: null });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.nps).toBeNull();
  });

  it("يرفض الحقول غير المعروفة", () => {
    expect(validate({ ...base(), evilField: 1 }).ok).toBe(false);
  });

  it("يرفض معرّف مشاركة غير صالح", () => {
    expect(validate({ ...base(), participationId: "not-a-uuid" }).ok).toBe(false);
    const { participationId: _omit, ...noId } = base();
    void _omit;
    expect(validate(noId).ok).toBe(false);
  });

  it("لا يخزّن الاسم/التواصل بلا موافقة", () => {
    const r = validate({ ...base(), name: "علي", contact: "a@b.com", consent: false });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.name).toBeNull();
      expect(r.value.contact).toBeNull();
    }
  });

  it("يحفظ الاسم/التواصل مع الموافقة", () => {
    const r = validate({ ...base(), name: "علي", contact: "0500000000", consent: true });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.name).toBe("علي");
      expect(r.value.contact).toBe("0500000000");
    }
  });

  it("يقصّ النصوص الطويلة عند 2000", () => {
    const r = validate({ ...base(), suggestions: "ا".repeat(5000) });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.suggestions?.length).toBe(2000);
  });

  it("يصفّي مفاتيح الميزات غير المعروفة", () => {
    const r = validate({ ...base(), features: ["news", "___bad___", "news"] });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.features).toEqual(["news"]);
  });
});
