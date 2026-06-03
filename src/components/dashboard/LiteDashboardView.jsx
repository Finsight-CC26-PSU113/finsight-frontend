import { HeroInsight } from "./HeroInsight";
import { SummaryCards } from "./SummaryCards";
import { SpendingChart } from "./SpendingChart";
import { RecentTransactions } from "./RecentTransactions";
import { AiRecommendationFeed } from "./AiRecommendationFeed";
import { AnomalyDetectionWidget } from "./AnomalyDetectionWidget";
import { SavingsOverviewWidget } from "./SavingsOverviewWidget";

/** Dasbor Lite — tidak diubah dari versi awal (ramah pemula). */
export const LiteDashboardView = () => (
  <div className="space-y-6 relative">
    <div id="tour-hero-insight">
      <HeroInsight />
    </div>

    <div id="tour-summary-cards">
      <SummaryCards />
    </div>

    <div className="flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-2/3 flex flex-col gap-6">
        <div id="tour-spending-chart">
          <SpendingChart />
        </div>
        <div id="tour-recent-transactions">
          <RecentTransactions />
        </div>
      </div>

      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        <div id="tour-anomaly-widget">
          <AnomalyDetectionWidget />
        </div>
        <div id="tour-ai-recommendations">
          <AiRecommendationFeed />
        </div>
        <div id="tour-savings-overview">
          <SavingsOverviewWidget />
        </div>
      </div>
    </div>
  </div>
);
