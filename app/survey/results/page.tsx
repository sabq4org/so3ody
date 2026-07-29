import { redirect } from "next/navigation";

// صفحة النتائج القديمة (توكن في الرابط) استُبدلت بلوحة إدارة محميّة بجلسة
export default function LegacyResults() {
  redirect("/admin");
}
