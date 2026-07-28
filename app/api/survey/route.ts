import { NextResponse } from "next/server";
import { validate } from "@/lib/survey";
import { insertResponse, hashIp } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  try {
    const fwd = req.headers.get("x-forwarded-for");
    const ip = (fwd ? fwd.split(",")[0] : req.headers.get("x-real-ip") || "").trim();
    const id = await insertResponse(result.value, {
      userAgent: req.headers.get("user-agent")?.slice(0, 300) || null,
      ipHash: hashIp(ip),
      source: "web",
    });
    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error("[survey] insert failed:", err);
    return NextResponse.json(
      { ok: false, error: "تعذّر حفظ ردّك حاليًا، يرجى المحاولة مجددًا" },
      { status: 500 },
    );
  }
}
