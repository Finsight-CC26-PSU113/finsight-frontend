import { useAppContext } from "../context/AppContext";
import { LiteSavingsView } from "../components/savings/LiteSavingsView";
import { ProSavingsView } from "../components/savings/ProSavingsView";

export const SavingsPage = () => {
  const { dashboardMode } = useAppContext();
  return dashboardMode === "pro" ? <ProSavingsView /> : <LiteSavingsView />;
};
