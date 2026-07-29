import { describe, it, expect, beforeEach } from "vitest";
import { rateLimit, _resetRateLimit } from "@/lib/ratelimit";

describe("rateLimit — منع الإساءة/التكرار", () => {
  beforeEach(() => _resetRateLimit());

  it("يسمح حتى الحد ثم يمنع", () => {
    const now = 1000;
    for (let i = 0; i < 3; i++) expect(rateLimit("k", 3, 1000, now).allowed).toBe(true);
    const r = rateLimit("k", 3, 1000, now);
    expect(r.allowed).toBe(false);
    expect(r.retryAfterMs).toBeGreaterThan(0);
  });

  it("يعيد السماح بعد انزلاق النافذة", () => {
    const now = 1000;
    for (let i = 0; i < 3; i++) rateLimit("k2", 3, 1000, now);
    expect(rateLimit("k2", 3, 1000, now).allowed).toBe(false);
    expect(rateLimit("k2", 3, 1000, now + 1001).allowed).toBe(true);
  });

  it("المفاتيح المختلفة مستقلة", () => {
    const now = 1000;
    rateLimit("a", 1, 1000, now);
    expect(rateLimit("a", 1, 1000, now).allowed).toBe(false);
    expect(rateLimit("b", 1, 1000, now).allowed).toBe(true);
  });
});
