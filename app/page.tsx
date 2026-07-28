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

export default function Home() {
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
