import type { Metadata } from "next";
import { UtilityBar } from "@/components/UtilityBar";
import { Header } from "@/components/Header";
import { BreakingTicker } from "@/components/BreakingTicker";
import { LiveMatchesStrip } from "@/components/LiveMatchesStrip";
import { HeroFeature } from "@/components/HeroFeature";
import { LatestNews } from "@/components/LatestNews";
import { Reports } from "@/components/Reports";
import { Videos } from "@/components/Videos";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { TransfersTicker } from "@/components/TransfersTicker";
import { Footer } from "@/components/Footer";

// نموذج الصفحة الرئيسية (محجوب عن الزوّار/الفهرسة — للمعاينة فقط)
export const metadata: Metadata = {
  title: "معاينة الصفحة الرئيسية — سعودي سبورت",
  robots: { index: false, follow: false },
};

export default function HomePreview() {
  return (
    <>
      <UtilityBar />
      <Header />
      <BreakingTicker />
      <LiveMatchesStrip />

      <div className="wrap">
        <div className="layout">
          <main>
            <HeroFeature />
            <LatestNews />
            <Reports />
            <Videos />
          </main>
          <Sidebar />
        </div>
      </div>

      <TransfersTicker />
      <Footer />
    </>
  );
}
