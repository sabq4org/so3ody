import { NextResponse } from "next/server";
import { validate } from "@/lib/survey";
import { insertResponse, hashIp } from "@/lib/db";
import { rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0] : req.headers.get("x-real-ip") || "").trim();
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "طلب غير صالح" }, { status: 400 });
  }

  const result = validate(body);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 422 });
  }

  const ipHash = hashIp(clientIp(req));

  // كبح الإساءة/الإرسال الآلي (النقر المتكرر يُعالَج أيضًا بالـ idempotency)
  const rl = rateLimit(`survey:${ipHash ?? "unknown"}`, 6, 10 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "محاولات كثيرة خلال فترة قصيرة، انتظر قليلاً ثم أعد المحاولة" },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } },
    );
  }

  try {
    const r = await insertResponse(result.value, {
      userAgent: req.headers.get("user-agent")?.slice(0, 300) || null,
      ipHash,
      source: "web",
    });
    // duplicate=true يعني أن نفس المشاركة سُجّلت سابقًا — نُعيد نجاحًا دون تكرار
    return NextResponse.json({ ok: true, id: r.id, duplicate: r.duplicate });
  } catch (err) {
    console.error("[survey] insert failed:", err instanceof Error ? err.message : "unknown");
    return NextResponse.json(
      { ok: false, error: "تعذّر حفظ ردّك حاليًا، يرجى المحاولة مجددًا" },
      { status: 500 },
    );
  }
}
