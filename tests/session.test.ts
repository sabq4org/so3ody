import { describe, it, expect } from "vitest";
import { signSession, verifySession, safeEqual } from "@/lib/session";

describe("session — صلاحيات الإدارة", () => {
  const secret = "test-secret-123";

  it("يتحقق من توكن صالح", () => {
    const t = signSession(Date.now() + 10_000, secret);
    expect(verifySession(t, secret)).toBe(true);
  });

  it("يرفض توقيعًا معدّلاً", () => {
    const t = signSession(Date.now() + 10_000, secret);
    const tampered = t.slice(0, -1) + (t.endsWith("a") ? "b" : "a");
    expect(verifySession(tampered, secret)).toBe(false);
  });

  it("يرفض سرًّا مختلفًا", () => {
    const t = signSession(Date.now() + 10_000, secret);
    expect(verifySession(t, "another-secret")).toBe(false);
  });

  it("يرفض توكنًا منتهيًا", () => {
    const t = signSession(1000, secret);
    expect(verifySession(t, secret, 2000)).toBe(false);
  });

  it("يرفض الفارغ/العشوائي", () => {
    expect(verifySession("", secret)).toBe(false);
    expect(verifySession("garbage", secret)).toBe(false);
    expect(verifySession(null, secret)).toBe(false);
  });

  it("safeEqual ثابت وصحيح", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abd")).toBe(false);
    expect(safeEqual("abc", "abcd")).toBe(false);
  });
});
