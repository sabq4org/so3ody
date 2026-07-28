import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: {
    default: "سعودي سبورت — الرياضة السعودية والعربية والعالمية",
    template: "%s | سعودي سبورت",
  },
  description:
    "تابع أخبار الكرة السعودية والعربية والعالمية، نتائج المباريات المباشرة، البطولات، والانتقالات أولًا بأول.",
  metadataBase: new URL("https://www.so3ody.com"),
};

export const viewport: Viewport = {
  themeColor: "#0E7A43",
};

// يضبط المظهر قبل الرسم لتفادي وميض الوضع الفاتح/الداكن
const noFlash = `(function(){try{var t=localStorage.getItem('theme');if(t){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlash }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
