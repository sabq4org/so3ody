import type { Metadata } from "next";
import { SurveyForm } from "@/components/survey/SurveyForm";
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
      <section className="sv-hero">
        <div className="sv-wrap">
          <span className="sv-badge">
            <span className="dot" />
            رأيك يصنع الفرق
          </span>
          <h1>
            نُكمِل <span className="g">النجاح</span>،<br />
            ونصنع <span className="g">التطوير</span> القادم — معك
          </h1>
          <p className="lead">
            في سعودي سبورت نؤمن أن روّاد المنصة وأصحاب المصلحة هم بوصلة المرحلة القادمة. شاركنا رأيك
            وتطلّعاتك في دقائق قليلة، لتُبنى قراراتنا على أصواتكم.
          </p>
          <div className="sv-stats">
            <div className="sv-stat">
              <b>~3 دقائق</b>
              <span>وقت التعبئة</span>
            </div>
            <div className="sv-stat">
              <b>مجهول</b>
              <span>البيانات اختيارية</span>
            </div>
            <div className="sv-stat">
              <b>مباشر</b>
              <span>يصل الفريق فورًا</span>
            </div>
          </div>
        </div>
      </section>

      <div className="sv-wrap">
        <SurveyForm />
        <p className="sv-foot">© سعودي سبورت — استطلاع تطوير المنصة</p>
      </div>
    </main>
  );
}
