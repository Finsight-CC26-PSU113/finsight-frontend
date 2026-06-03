import { useAppContext } from "../context/AppContext";
import { LiteTransactionView } from "../components/transactions/LiteTransactionView";
import { ProTransactionView } from "../components/transactions/ProTransactionView";

export const TransactionPage = () => {
  const { dashboardMode } = useAppContext();
  return dashboardMode === "pro" ? <ProTransactionView /> : <LiteTransactionView />;
};
