// عميل ذكاء اصطناعي متوافق مع OpenAI عبر fetch — كل الإعدادات من متغيّرات البيئة.
// لا نثبّت مفتاحًا أو نموذجًا في الكود. لا نسجّل جسم الطلب/الاستجابة (قد يحوي بيانات).

export type AIErrorCode = "AI_NOT_CONFIGURED" | "AI_HTTP" | "AI_TIMEOUT" | "AI_BAD_RESPONSE" | "AI_NETWORK";

export class AIError extends Error {
  code: AIErrorCode;
  status?: number;
  constructor(code: AIErrorCode, message: string, status?: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export interface AIConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
  provider: string;
}

export function getAIConfig(): AIConfig | null {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) return null;
  return {
    apiKey,
    model: process.env.AI_MODEL || "gpt-4o-mini",
    baseUrl: (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, ""),
    provider: process.env.AI_PROVIDER || "openai",
  };
}

export function isAIConfigured(): boolean {
  return !!process.env.AI_API_KEY;
}

export interface ChatMessage {
  role: "system" | "user";
  content: string;
}

export interface AIResult {
  text: string;
  model: string;
  provider: string;
}

/** يطلب من النموذج ردًّا نصيًا (JSON) — مع مهلة وإعادة محاولة واحدة */
export async function callAIJson(
  messages: ChatMessage[],
  opts: { timeoutMs?: number; retries?: number } = {},
): Promise<AIResult> {
  const cfg = getAIConfig();
  if (!cfg) throw new AIError("AI_NOT_CONFIGURED", "لم يُضبط مفتاح الذكاء الاصطناعي (AI_API_KEY)");

  const timeoutMs = opts.timeoutMs ?? 45_000;
  const retries = opts.retries ?? 1;
  let lastErr: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${cfg.apiKey}` },
        body: JSON.stringify({
          model: cfg.model,
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages,
        }),
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (!res.ok) {
        // نسجّل الحالة فقط، لا الجسم
        throw new AIError("AI_HTTP", `تعذّر الاتصال بالنموذج (HTTP ${res.status})`, res.status);
      }
      const data = (await res.json()) as { choices?: { message?: { content?: unknown } }[] };
      const text = data?.choices?.[0]?.message?.content;
      if (typeof text !== "string" || !text.trim()) {
        throw new AIError("AI_BAD_RESPONSE", "استجابة النموذج غير متوقعة");
      }
      return { text, model: cfg.model, provider: cfg.provider };
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
      if (err instanceof AIError && err.code === "AI_NOT_CONFIGURED") throw err;
      // 4xx غير قابلة لإعادة المحاولة
      if (err instanceof AIError && err.status && err.status >= 400 && err.status < 500) throw err;
      const aborted = err instanceof Error && err.name === "AbortError";
      if (attempt === retries) {
        if (aborted) throw new AIError("AI_TIMEOUT", "انتهت مهلة الاتصال بالنموذج");
        if (err instanceof AIError) throw err;
        throw new AIError("AI_NETWORK", "تعذّر الوصول لخدمة الذكاء الاصطناعي");
      }
    }
  }
  throw lastErr instanceof Error ? lastErr : new AIError("AI_NETWORK", "خطأ غير معروف");
}
