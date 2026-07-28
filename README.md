# سعودي سبورت 2.0

إعادة بناء بوابة **سعودي سبورت** (so3ody.com) على نواة حديثة — **Next.js 14 (App Router) + TypeScript**، بهوية خضراء وتصميم متجاوب يدعم الوضعين الفاتح والداكن.

## المحتوى الحالي

| المسار | الوصف |
|---|---|
| `/` | الصفحة الرئيسية (شريط مباريات، أخبار بتبويبات، ترتيب، انتقالات) — بيانات تجريبية حاليًا |
| `/survey` | صفحة استطلاع رأي روّاد المنصة وأصحاب المصلحة حول التطوير |
| `/survey/results?key=…` | لوحة تحليل الردود (محميّة بتوكن) |
| `/api/survey` | استقبال ردود الاستطلاع (POST) وحفظها في Postgres |
| `/api/survey/export?key=…` | تصدير الردود CSV للتحليل (محميّ) |

## التشغيل

```bash
npm install
cp .env.example .env.local   # ثم املأ DATABASE_URL و SURVEY_ADMIN_TOKEN
npm run dev                  # http://localhost:3000
```

## الأوامر

```bash
npm run dev        # خادم التطوير
npm run build      # بناء الإنتاج
npm start          # تشغيل الإنتاج
npm run typecheck  # فحص الأنواع (tsc)
```

## البنية

```
app/                صفحات App Router + مسارات الـ API
  survey/           صفحة الاستطلاع + لوحة النتائج
  api/survey/       استقبال الردود + التصدير
components/         مكوّنات الواجهة (الرئيسية + الاستطلاع)
lib/                types.ts · data.ts (بيانات الواجهة) · survey.ts · db.ts (Neon)
```

## قاعدة البيانات

ردود الاستطلاع تُحفظ في **Neon Postgres** بجدول `so3ody_survey_responses`
(يُنشأ تلقائيًا عند أول طلب). اضبط `DATABASE_URL` في `.env.local`.

> **لا ترفع `.env.local`** — إنه مستبعَد في `.gitignore`.
