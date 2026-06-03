import { useAppContext } from "../context/AppContext";
import { LiteInsightsView } from "../components/insights/LiteInsightsView";
import { ProInsightsView } from "../components/insights/ProInsightsView";

export const InsightsPage = () => {
  const { dashboardMode } = useAppContext();
  return dashboardMode === "pro" ? <ProInsightsView /> : <LiteInsightsView />;
};
