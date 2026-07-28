import type { Metadata } from "next";
import { SurveyExperience } from "@/components/survey/SurveyExperience";
import "./survey.css";

export const metadata: Metadata = {
  title: "شاركنا رأيك — سعودي سبورت",
  description:
    "منصة سعودي سبورت تستطلع رأي روّادها وأصحاب المصلحة لتشكيل المرحلة القادمة. دقائق قليلة تُحدث فرقًا حقيقيًا.",
  robots: { index: false, follow: false },
};

export default function SurveyPage() {
  return (
    <main className="sv">
      <SurveyExperience />
    </main>
  );
}
