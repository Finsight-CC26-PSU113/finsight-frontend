import { useAppContext } from "../context/AppContext";
import { LiteBudgetView } from "../components/budget/LiteBudgetView";
import { ProBudgetView } from "../components/budget/ProBudgetView";

export const BudgetPage = () => {
  const { dashboardMode } = useAppContext();
  return dashboardMode === "pro" ? <ProBudgetView /> : <LiteBudgetView />;
};
