"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm({ configured }: { configured: boolean }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "فشل الدخول");
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
      setLoading(false);
    }
  }

  return (
    <div className="adm-login">
      <form onSubmit={submit}>
        <h1>لوحة إدارة الاستفتاء</h1>
        <p>أدخل كلمة مرور الإدارة للمتابعة.</p>
        {!configured && <div className="err">لم تُضبط كلمة مرور الإدارة (ADMIN_PASSWORD) على الخادم.</div>}
        {error && <div className="err">{error}</div>}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="كلمة المرور"
          autoComplete="current-password"
          autoFocus
        />
        <button type="submit" disabled={loading || !password || !configured}>
          {loading ? "جارٍ الدخول…" : "دخول"}
        </button>
      </form>
    </div>
  );
}
