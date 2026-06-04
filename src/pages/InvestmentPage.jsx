import { useAppContext } from "../context/AppContext";
import { LiteInvestmentView } from "../components/investment/LiteInvestmentView";
import { ProInvestmentView } from "../components/investment/ProInvestmentView";

export const InvestmentPage = () => {
  const { dashboardMode } = useAppContext();
  return dashboardMode === "pro" ? <ProInvestmentView /> : <LiteInvestmentView />;
};
