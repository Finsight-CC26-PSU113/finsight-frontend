import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { TransactionPage } from "./pages/TransactionPage";
import { BudgetPage } from "./pages/BudgetPage";
import { InsightsPage } from "./pages/InsightsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SettingsPage } from "./pages/SettingsPage";
import { InvestmentPage } from "./pages/InvestmentPage";
import { useAppContext } from "./context/AppContext";

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isAuthReady } = useAppContext();

  if (!isAuthReady) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="transactions" element={<TransactionPage />} />
          <Route path="budget" element={<BudgetPage />} />
          <Route path="insights" element={<InsightsPage />} />
          <Route path="investments" element={<InvestmentPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          {/* Upload page removed — scan is available via the Add Transaction button */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
