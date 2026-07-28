"use client";

import { useState } from "react";
import { SurveyForm } from "./SurveyForm";

export function SurveyExperience() {
  const [done, setDone] = useState(false);

  // بعد الإرسال: رسالة شكر فقط (بلا رأس الصفحة)
  if (done) {
    return (
      <div className="sv-wrap" style={{ paddingTop: "9vh" }}>
        <div className="sv-card">
          <div className="sv-thanks">
            <div className="mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h2>وصلنا رأيك — شكرًا لك!</h2>
            <p>
              مساهمتك أصبحت جزءًا من قرارات تطوير سعودي سبورت القادمة. نقرأ كل ردّ بعناية، ونعمل
              على استكمال النجاح بما يليق بروّاد المنصة.
            </p>
            <a href="/">العودة للرئيسية ←</a>
          </div>
        </div>
        <p className="sv-foot">© سعودي سبورت — استطلاع تطوير المنصة</p>
      </div>
    );
  }

  return (
    <>
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
              <b>بدون تسجيل</b>
              <span>الاسم اختياري</span>
            </div>
            <div className="sv-stat">
              <b>مباشر</b>
              <span>يصل الفريق فورًا</span>
            </div>
          </div>
        </div>
      </section>

      <div className="sv-wrap">
        <SurveyForm onSubmitted={() => { setDone(true); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
        <p className="sv-foot">© سعودي سبورت — استطلاع تطوير المنصة</p>
      </div>
    </>
  );
}
