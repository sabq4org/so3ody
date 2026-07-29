import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthed, isAdminConfigured } from "@/lib/auth";
import { LoginForm } from "@/components/admin/LoginForm";
import "../admin.css";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata: Metadata = { robots: { index: false, follow: false }, title: "دخول الإدارة" };

export default function LoginPage() {
  if (isAdminAuthed()) redirect("/admin");
  return <LoginForm configured={isAdminConfigured()} />;
}
