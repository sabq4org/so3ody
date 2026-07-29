import { describe, it, expect } from "vitest";
import { redactPII, hasPII } from "@/lib/redact";

describe("redactPII — منع تسريب البيانات الشخصية", () => {
  it("يحجب البريد الإلكتروني", () => {
    expect(redactPII("راسلني على ali@example.com شكرًا")).not.toContain("ali@example.com");
  });
  it("يحجب أرقام الهواتف", () => {
    expect(redactPII("جوالي 0501234567")).not.toContain("0501234567");
    expect(redactPII("اتصل +966501234567")).not.toContain("966501234567");
  });
  it("يحجب الروابط", () => {
    expect(redactPII("شاهد https://twitter.com/user")).not.toContain("twitter.com/user");
  });
  it("يحجب الحسابات (@)", () => {
    expect(redactPII("تابعني @my_handle")).not.toContain("@my_handle");
  });
  it("يُبقي النص العربي العادي", () => {
    const t = "الموقع سريع وممتاز";
    expect(redactPII(t)).toBe(t);
  });
  it("hasPII يكشف بدقّة", () => {
    expect(hasPII("ali@example.com")).toBe(true);
    expect(hasPII("نص عادي بلا بيانات")).toBe(false);
  });
});
