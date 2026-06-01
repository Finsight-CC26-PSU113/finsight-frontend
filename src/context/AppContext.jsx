/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiRequest, clearStoredAuthSession, getStoredAuthSession, setStoredAuthSession } from "../utils/apiClient";
import { findCategoryByName, normalizeCategoryName, resolveCategoryId as resolveCategoryIdFromLists } from "../utils/categoryUtils";
import { applyBudgetColors, getNextUnusedBudgetColor, setBudgetColorForCategory } from "../utils/budgetColors";

const AppContext = createContext();

const EMPTY_USER = {
  name: "Pengguna FINSIGHT",
  email: "",
  avatar: null,
  balance: 0,
  monthlyIncome: 0,
  monthlyExpenses: 0,
};

const CATEGORY_ICON_LOOKUP = [
  ["makanan", "Coffee"],
  ["food", "Coffee"],
  ["minum", "Coffee"],
  ["transport", "Truck"],
  ["hiburan", "Tv"],
  ["entertainment", "Tv"],
  ["tagihan", "Zap"],
  ["bill", "Zap"],
  ["belanja", "Package"],
  ["shopping", "Package"],
  ["pendapatan", "Briefcase"],
  ["income", "Briefcase"],
  ["gaji", "Briefcase"],
];

const currentPeriod = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const enrichDashboardSummary = (summary = {}) => {
  const budget_progress = summary.budget_progress || [];
  const total_budget = budget_progress.reduce((sum, item) => sum + toNumber(item.budget_amount), 0);
  const total_spent = budget_progress.reduce((sum, item) => sum + toNumber(item.spent_amount), 0);

  return {
    ...summary,
    budget_progress,
    total_budget,
    total_spent,
    total_remaining: total_budget - total_spent,
  };
};

const toNumber = (value) => Number(value ?? 0) || 0;

const formatDateValue = (value) => {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toISOString().slice(0, 10) : date.toISOString().slice(0, 10);
};

const formatCurrencyLabel = (value) => `Rp ${Math.abs(Math.round(toNumber(value))).toLocaleString("id-ID")}`;

const getCategoryIconName = (categoryName, transactionType) => {
  if (transactionType === "income") {
    return "Briefcase";
  }

  const normalized = `${categoryName || ""}`.toLowerCase();
  const match = CATEGORY_ICON_LOOKUP.find(([key]) => normalized.includes(key));
  return match ? match[1] : "ShoppingCart";
};

const isDebitTransactionType = (type) => type === "expense" || type === "savings_deposit";

const mapTransaction = (transaction) => {
  const savingsGoalName = transaction.savings_goal?.name;
  const isSavings = transaction.transaction_type === "savings_deposit" || transaction.transaction_type === "savings_withdraw";
  const categoryName = isSavings
    ? "Tabungan"
    : transaction.category?.name || transaction.user_category?.name || transaction.category_name || "Lainnya";
  const amount = toNumber(transaction.amount);
  const signedAmount = isDebitTransactionType(transaction.transaction_type) ? -Math.abs(amount) : Math.abs(amount);

  return {
    id: transaction.id,
    title: transaction.description || savingsGoalName || categoryName,
    amount: signedAmount,
    date: formatDateValue(transaction.transaction_date),
    category: categoryName,
    type: transaction.transaction_type,
    icon: isSavings ? "PiggyBank" : getCategoryIconName(categoryName, transaction.transaction_type),
    paymentMethod: transaction.payment_method,
    is_anomaly: transaction.is_anomaly,
    anomaly_score: transaction.anomaly_score,
    category_id: transaction.category_id,
    user_category_id: transaction.user_category_id,
    savings_goal_id: transaction.savings_goal_id,
    savings_goal_name: savingsGoalName,
    rawAmount: amount,
    isSavings,
  };
};

const mapBudget = (budget, budgetProgressByCategoryId = {}) => {
  const budgetAmount = toNumber(budget.amount);
  const progress = budgetProgressByCategoryId[budget.category_id] || {};
  const spent = toNumber(progress.spent_amount);
  const percentage = budgetAmount > 0 ? Math.min(100, (spent / budgetAmount) * 100) : toNumber(progress.percentage);
  const categoryName = budget.category?.name || progress.name || "Lainnya";
  return {
    id: budget.id,
    category: categoryName,
    subtitle: progress.name ? `${progress.name} bulanan` : `Budget periode ${budget.period}`,
    spent,
    total: budgetAmount,
    percent: Math.round(percentage),
    icon: getCategoryIconName(categoryName, "expense"),
    bgColor: "bg-slate-50",
    shadowColor: "shadow-slate-100",
    category_id: budget.category_id,
    period: budget.period,
    amount: budgetAmount,
    spent_amount: spent,
    budget_amount: budgetAmount,
  };
};

// Saran anggaran: 7 kategori sistem, total 100%
const BUDGET_SUGGESTION_PERCENT = {
  makanan: 0.17,
  belanja: 0.16,
  tagihan: 0.17,
  kesehatan: 0.13,
  transport: 0.12,
  hiburan: 0.08,
  lainnya: 0.17,
};

/** Saran = persentase kategori × (total pemasukan − tabungan) */
const getBudgetSuggestions = (income = 0, tabungan = 0) => {
  const totalIncome = toNumber(income);
  const tabunganAmount = Math.max(0, toNumber(tabungan));
  const allocatable = Math.max(0, totalIncome - tabunganAmount);

  return Object.keys(BUDGET_SUGGESTION_PERCENT).map((cat) => ({
    category: cat,
    percent: BUDGET_SUGGESTION_PERCENT[cat],
    amount: allocatable > 0 ? Math.round(allocatable * BUDGET_SUGGESTION_PERCENT[cat]) : 0,
    allocatableIncome: allocatable,
    tabungan: tabunganAmount,
    totalIncome,
  }));
};

const mapInsight = (item, fallbackId) => ({
  id: item.id || fallbackId,
  type: item.type,
  title: item.title,
  description: item.description,
  action: item.action,
});

const buildInsights = ({
  recommendations = [],
  budgetProgress = [],
  transactions = [],
  summary = null,
  savingsInsights = [],
}) => {
  const recommendationInsights = recommendations.map((recommendation) => ({
    id: recommendation.id,
    type: "recommendation",
    title: recommendation.type || "Rekomendasi AI",
    description: recommendation.message,
    action: recommendation.status === "active" ? "Tinjau Rekomendasi" : "Lihat Detail",
  }));

  const budgetInsights = budgetProgress
    .filter((item) => toNumber(item.percentage) >= 70)
    .slice(0, 3)
    .map((item) => ({
      id: `budget-${item.category_id}`,
      type: item.percentage >= 100 ? "alert" : "behavior",
      title: `${item.name || "Kategori"} mendekati batas`,
      description: `Pengeluaran sudah mencapai ${Math.round(toNumber(item.percentage))}% dari budget bulan ini (${formatCurrencyLabel(item.spent_amount)} dari ${formatCurrencyLabel(item.budget_amount)}).`,
      action: "Tinjau Anggaran",
    }));

  const anomalyTransaction = [...transactions].find((transaction) => transaction.is_anomaly);
  const anomalyInsights = anomalyTransaction
    ? [
        {
          id: `anomaly-${anomalyTransaction.id}`,
          type: "alert",
          title: "Deteksi Anomali",
          description: `${anomalyTransaction.title} terdeteksi sebagai transaksi tidak biasa di kategori ${anomalyTransaction.category}.`,
          action: "Tinjau Transaksi",
        },
      ]
    : [];

  const positiveInsight =
    summary && summary.balance > 0
      ? [
          {
            id: "positive-balance",
            type: "positive",
            title: "Arus kas positif",
            description: `Saldo bulan ini masih positif sebesar ${formatCurrencyLabel(summary.balance)}.`,
            action: null,
          },
        ]
      : [];

  const savingsInsightItems = savingsInsights.map((insight, index) => ({
    id: `savings-${insight.goal_id || "global"}-${index}`,
    type: insight.type || "behavior",
    title: insight.title,
    description: insight.description,
    action: insight.action || "Buka Tabungan",
  }));

  return [...anomalyInsights, ...savingsInsightItems, ...budgetInsights, ...recommendationInsights, ...positiveInsight].map(
    (item, index) => mapInsight(item, index + 1)
  );
};

export const AppProvider = ({ children }) => {
  const storedSession = getStoredAuthSession();
  const [authToken, setAuthToken] = useState(storedSession.token);
  const [user, setUser] = useState(storedSession.user || EMPTY_USER);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [insights, setInsights] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [investments, setInvestments] = useState(null);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [savingsAvailableBalance, setSavingsAvailableBalance] = useState(null);
  const [savingsInsights, setSavingsInsights] = useState([]);
  const [savingsReady, setSavingsReady] = useState(false);
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(storedSession.token));
  const [isAuthReady, setIsAuthReady] = useState(!storedSession.token);
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  const [dashboardMode, setDashboardMode] = useState("lite");

  const bootstrapAppData = async (token) => {
    if (!token) {
      setTransactions([]);
      setBudgets([]);
      setDashboardSummary(null);
      setInsights([]);
      setCategories([]);
      setCustomCategories([]);
      setHasUnreadNotifications(false);
      setUser(EMPTY_USER);
      setIsAuthenticated(false);
      setIsAuthReady(true);
      return;
    }

    try {
      const profileResponse = await apiRequest("/api/auth/profile", { token });
      const profile = profileResponse?.data?.user || profileResponse?.data || null;

      const safe = (promise, fallback) => promise.catch(() => fallback);

      const [categoriesResponse, customCategoriesResponse, dashboardResponse, transactionsResponse, budgetsResponse, recommendationsResponse, investmentsResponse, savingsGoalsResponse, savingsInsightsResponse] = await Promise.all([
        safe(apiRequest("/categories", { token }), { data: { categories: [] } }),
        safe(apiRequest("/categories/custom", { token }), { data: { categories: [] } }),
        safe(apiRequest("/api/dashboard/summary", { token }), { data: {} }),
        safe(apiRequest("/api/transactions", { token }), { data: { transactions: [] } }),
        safe(apiRequest(`/api/budgets?period=${currentPeriod()}`, { token }), { data: { budgets: [] } }),
        safe(apiRequest("/api/recommendations", { token }), { data: { recommendations: [] } }),
        safe(apiRequest("/api/investments", { token }), { data: null }),
        apiRequest("/api/savings-goals", { token }).catch(() => null),
        apiRequest("/api/savings-goals/insights", { token }).catch(() => null),
      ]);

      const defaultCategories = categoriesResponse?.data?.categories || [];
      const userDefinedCategories = customCategoriesResponse?.data?.categories || [];
      const rawDashboardSummary = dashboardResponse?.data || {};
      const dashboardSummary = enrichDashboardSummary(rawDashboardSummary);
      const rawTransactions = transactionsResponse?.data?.transactions || [];
      const rawBudgets = budgetsResponse?.data?.budgets || [];
      const rawRecommendations = recommendationsResponse?.data?.recommendations || [];
      const investmentData = investmentsResponse?.data || null;
      const savingsGoalsData = savingsGoalsResponse?.data?.goals;
      const savingsInsightsData = savingsInsightsResponse?.data?.insights;
      const savingsBalance = savingsGoalsResponse?.data?.available_balance;
      const resolvedSavingsInsights = Array.isArray(savingsInsightsData) ? savingsInsightsData : [];

      const budgetProgressByCategoryId = (dashboardSummary.budget_progress || []).reduce((map, item) => {
        map[item.category_id] = item;
        return map;
      }, {});

      const normalizedTransactions = rawTransactions.map(mapTransaction);
      const normalizedBudgets = applyBudgetColors(rawBudgets.map((budget) => mapBudget(budget, budgetProgressByCategoryId)));
      const normalizedInsights = buildInsights({
        recommendations: rawRecommendations,
        budgetProgress: dashboardSummary.budget_progress || [],
        transactions: normalizedTransactions,
        summary: dashboardSummary,
        savingsInsights: resolvedSavingsInsights,
      });

      const nextUser = {
        ...EMPTY_USER,
        ...(profile || {}),
        balance: toNumber(dashboardSummary.balance),
        monthlyIncome: toNumber(dashboardSummary.total_income),
        monthlyExpenses: toNumber(dashboardSummary.total_expense),
        avatar: (profile && profile.avatar) || null,
      };

      setUser(nextUser);
      setCategories(defaultCategories);
      setCustomCategories(userDefinedCategories);
      setTransactions(normalizedTransactions);
      setBudgets(normalizedBudgets);
      setInsights(normalizedInsights);
      setInvestments(investmentData);
      if (Array.isArray(savingsGoalsData)) {
        setSavingsGoals(savingsGoalsData);
        setSavingsAvailableBalance(toNumber(savingsBalance));
      }
      if (Array.isArray(savingsInsightsData)) {
        setSavingsInsights(resolvedSavingsInsights);
      }
      // Tandai siap meski API tabungan gagal — hindari flicker empty/loading
      setSavingsReady(true);
      setDashboardSummary(dashboardSummary);
      setHasUnreadNotifications(normalizedInsights.some((item) => item.type === "alert" || item.type === "recommendation"));
      setIsAuthenticated(true);
      setIsAuthReady(true);
    } catch {
      clearStoredAuthSession();
      setAuthToken(null);
      setUser(EMPTY_USER);
      setTransactions([]);
      setBudgets([]);
      setDashboardSummary(null);
      setInsights([]);
      setCategories([]);
      setCustomCategories([]);
      setHasUnreadNotifications(false);
      setIsAuthenticated(false);
      setIsAuthReady(true);
    }
  };

  useEffect(() => {
    if (!authToken) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void bootstrapAppData(authToken);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [authToken]);

  const openAddTxModal = () => setIsAddTxModalOpen(true);
  const closeAddTxModal = () => {
    setIsAddTxModalOpen(false);
    setEditTx(null);
  };

  const openEditTxModal = (transaction) => {
    setEditTx(transaction || null);
    setIsAddTxModalOpen(true);
  };

  const resolveCategoryId = (categoryName) => resolveCategoryIdFromLists(categoryName, categories, customCategories);

  const addTransaction = async (transaction) => {
    if (!authToken) {
      throw new Error("Anda harus masuk terlebih dahulu");
    }

    const categoryId = transaction.type === "income" ? null : resolveCategoryId(transaction.category);
    const payload = {
      transaction_type: transaction.type,
      amount: Math.abs(toNumber(transaction.amount)),
      payment_method: transaction.paymentMethod || "cash",
      transaction_date: transaction.date || formatDateValue(),
      description: transaction.title,
      ...(categoryId ? { category_id: categoryId } : {}),
      ...(transaction.user_category_id ? { user_category_id: transaction.user_category_id } : {}),
    };

    const response = await apiRequest("/api/transactions", {
      method: "POST",
      token: authToken,
      body: JSON.stringify(payload),
    });

    const createdTransaction = response?.data?.transaction || response?.data || null;
    if (createdTransaction) {
      setTransactions((prev) => [mapTransaction(createdTransaction), ...prev]);
      await bootstrapAppData(authToken);
    }

    return createdTransaction;
  };

  const refreshTransactions = useCallback(async () => {
    if (!authToken) {
      throw new Error("Anda harus masuk terlebih dahulu");
    }

    const response = await apiRequest("/api/transactions", {
      token: authToken,
    });

    const rawTransactions = response?.data?.transactions || [];
    const normalizedTransactions = rawTransactions.map(mapTransaction);
    setTransactions(normalizedTransactions);
    return normalizedTransactions;
  }, [authToken]);

  const updateTransaction = async (id, payload) => {
    if (!authToken) {
      throw new Error("Anda harus masuk terlebih dahulu");
    }

    const response = await apiRequest(`/api/transactions/${id}`, {
      method: "PUT",
      token: authToken,
      body: JSON.stringify({
        transaction_type: payload.type,
        amount: Math.abs(toNumber(payload.amount)),
        payment_method: payload.paymentMethod || "cash",
        transaction_date: payload.date || formatDateValue(),
        description: payload.title,
        ...(payload.category_id ? { category_id: payload.category_id } : {}),
      }),
    });

    const updated = response?.data?.transaction || response?.data || null;
    if (updated) {
      setTransactions((prev) => prev.map((t) => (t.id === updated.id ? mapTransaction(updated) : t)));
      await bootstrapAppData(authToken);
    }

    return updated;
  };

  const deleteTransaction = async (id) => {
    if (!authToken) {
      throw new Error("Anda harus masuk terlebih dahulu");
    }

    await apiRequest(`/api/transactions/${id}`, {
      method: "DELETE",
      token: authToken,
    });

    setTransactions((prev) => prev.filter((transaction) => transaction.id !== id));
    await bootstrapAppData(authToken);
  };

  // ---------------------------------------------------------------------------
  // Savings goals (tujuan tabungan)
  // ---------------------------------------------------------------------------

  const fetchSavingsGoals = useCallback(async () => {
    if (!authToken) throw new Error("Anda harus masuk terlebih dahulu");

    const response = await apiRequest("/api/savings-goals", { token: authToken });
    const goals = response?.data?.goals || [];
    const availableBalance = toNumber(response?.data?.available_balance);
    setSavingsGoals(goals);
    setSavingsAvailableBalance(availableBalance);
    setSavingsReady(true);
    return { goals, available_balance: availableBalance };
  }, [authToken]);

  const fetchSavingsInsights = useCallback(async () => {
    if (!authToken) throw new Error("Anda harus masuk terlebih dahulu");

    const response = await apiRequest("/api/savings-goals/insights", { token: authToken });
    const insights = response?.data?.insights || [];
    setSavingsInsights(insights);
    return insights;
  }, [authToken]);

  const refreshSavingsData = useCallback(async () => {
    await Promise.all([fetchSavingsGoals(), fetchSavingsInsights()]);
  }, [fetchSavingsGoals, fetchSavingsInsights]);

  const createSavingsGoal = async ({ name, target_amount, deadline }) => {
    if (!authToken) throw new Error("Anda harus masuk terlebih dahulu");

    const response = await apiRequest("/api/savings-goals", {
      method: "POST",
      token: authToken,
      body: JSON.stringify({
        name,
        target_amount,
        deadline: deadline || null,
      }),
    });

    const createdGoal = response?.data?.goal;
    if (createdGoal) {
      setSavingsGoals((prev) => [createdGoal, ...prev.filter((g) => g.id !== createdGoal.id)]);
    }

    await bootstrapAppData(authToken).catch(() => null);
    return createdGoal;
  };

  const depositToSavingsGoal = async (goalId, amount) => {
    if (!authToken) throw new Error("Anda harus masuk terlebih dahulu");

    const response = await apiRequest(`/api/savings-goals/${goalId}/deposit`, {
      method: "POST",
      token: authToken,
      body: JSON.stringify({ amount: Math.abs(toNumber(amount)), payment_method: "bank_transfer" }),
    });

    await bootstrapAppData(authToken).catch(() => null);
    return response?.data;
  };

  const withdrawFromSavingsGoal = async (goalId, amount) => {
    if (!authToken) throw new Error("Anda harus masuk terlebih dahulu");

    const response = await apiRequest(`/api/savings-goals/${goalId}/withdraw`, {
      method: "POST",
      token: authToken,
      body: JSON.stringify({ amount: Math.abs(toNumber(amount)), payment_method: "bank_transfer" }),
    });

    await bootstrapAppData(authToken).catch(() => null);
    return response?.data;
  };

  const deleteSavingsGoal = async (goalId) => {
    if (!authToken) throw new Error("Anda harus masuk terlebih dahulu");

    await apiRequest(`/api/savings-goals/${goalId}`, {
      method: "DELETE",
      token: authToken,
    });

    await bootstrapAppData(authToken).catch(() => null);
  };

  // ---------------------------------------------------------------------------
  // Investments (catalog + quotes + portfolio)
  // ---------------------------------------------------------------------------

  const fetchInvestmentProducts = async ({ category, search, sort } = {}) => {
    if (!authToken) {
      throw new Error("Anda harus masuk terlebih dahulu");
    }

    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    if (sort) params.set("sort", sort);

    const response = await apiRequest(`/api/investments/products?${params.toString()}`, {
      token: authToken,
    });

    return response?.data?.products || [];
  };

  const fetchInvestmentProductById = async (id) => {
    if (!authToken) {
      throw new Error("Anda harus masuk terlebih dahulu");
    }
    const response = await apiRequest(`/api/investments/products/${id}`, { token: authToken });
    return response?.data?.product || null;
  };

  const fetchInvestmentQuotes = async (symbols = []) => {
    if (!authToken) {
      throw new Error("Anda harus masuk terlebih dahulu");
    }
    const deduped = Array.from(new Set((symbols || []).map((s) => String(s || "").trim()).filter(Boolean)));
    if (deduped.length === 0) return [];

    const response = await apiRequest(`/api/investments/quotes?symbols=${encodeURIComponent(deduped.join(","))}`, {
      token: authToken,
    });

    return response?.data?.quotes || [];
  };

  const fetchInvestmentPortfolio = async () => {
    if (!authToken) {
      throw new Error("Anda harus masuk terlebih dahulu");
    }
    const response = await apiRequest(`/api/investments/portfolio`, { token: authToken });
    return response?.data?.portfolio || null;
  };

  const savePortfolioPosition = async (payload) => {
    if (!authToken) {
      throw new Error("Anda harus masuk terlebih dahulu");
    }
    const response = await apiRequest(`/api/investments/portfolio/positions`, {
      method: "POST",
      token: authToken,
      body: JSON.stringify(payload),
    });
    return response?.data?.position || null;
  };

  const updatePortfolioPosition = async (id, payload) => {
    if (!authToken) {
      throw new Error("Anda harus masuk terlebih dahulu");
    }
    const response = await apiRequest(`/api/investments/portfolio/positions/${id}`, {
      method: "PATCH",
      token: authToken,
      body: JSON.stringify(payload),
    });
    return response?.data?.position || null;
  };

  const deletePortfolioPosition = async (id) => {
    if (!authToken) {
      throw new Error("Anda harus masuk terlebih dahulu");
    }
    await apiRequest(`/api/investments/portfolio/positions/${id}`, {
      method: "DELETE",
      token: authToken,
    });
  };

  const login = async (credentials = {}) => {
    const response = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    const nextToken = response?.data?.token;
    const nextUser = response?.data?.user;

    if (!nextToken) {
      throw new Error("Token autentikasi tidak ditemukan");
    }

    setStoredAuthSession({ token: nextToken, user: nextUser || null });
    setAuthToken(nextToken);
    setIsAuthenticated(true);
    await bootstrapAppData(nextToken);
  };

  const register = async (payload = {}) => {
    await apiRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        password: payload.password,
      }),
    });

    clearStoredAuthSession();
    setAuthToken(null);
    setUser(EMPTY_USER);
    setTransactions([]);
    setBudgets([]);
    setInsights([]);
    setCategories([]);
    setCustomCategories([]);
    setHasUnreadNotifications(false);
    setIsAuthenticated(false);
    setIsAuthReady(true);
  };

  const logout = async () => {
    try {
      if (authToken) {
        await apiRequest("/api/auth/logout", {
          method: "POST",
          token: authToken,
        });
      }
    } catch {
      // Ignore logout transport failures and clear local session anyway.
    } finally {
      clearStoredAuthSession();
      setAuthToken(null);
      setUser(EMPTY_USER);
      setTransactions([]);
      setBudgets([]);
      setDashboardSummary(null);
      setInsights([]);
      setCategories([]);
      setCustomCategories([]);
      setInvestments(null);
      setSavingsGoals([]);
      setSavingsAvailableBalance(null);
      setSavingsInsights([]);
      setSavingsReady(false);
      setIsAuthenticated(false);
      setHasUnreadNotifications(false);
    }
  };

  const addBudget = async (budgetData) => {
    if (!authToken) {
      throw new Error("Anda harus masuk terlebih dahulu");
    }

    const categoryId = budgetData.category_id || resolveCategoryId(budgetData.category);
    if (!categoryId) {
      const label = budgetData.category ? normalizeCategoryName(budgetData.category) : "kategori";
      throw new Error(
        categories.length === 0
          ? "Kategori sistem belum tersedia. Pastikan backend berjalan dan jalankan seed database (npm run seed di folder backend)."
          : `Kategori "${label}" tidak ditemukan. Pilih kategori dari daftar yang tersedia.`
      );
    }

    const response = await apiRequest("/api/budgets", {
      method: "POST",
      token: authToken,
      body: JSON.stringify({
        category_id: categoryId,
        amount: Math.abs(toNumber(budgetData.total || budgetData.amount)),
        period: budgetData.period || currentPeriod(),
      }),
    });

    if (categoryId) {
      const color = budgetData.color || getNextUnusedBudgetColor(budgets);
      setBudgetColorForCategory(categoryId, color);
    }

    const createdBudget = response?.data?.budget || response?.data || null;
    if (createdBudget) {
      await bootstrapAppData(authToken);
    }

    return createdBudget;
  };

  const applyBudgetSuggestion = async (category, amount, period = currentPeriod()) => {
    return await addBudget({ category, total: amount, period });
  };

  const applyAllBudgetSuggestions = async (
    income = user.monthlyIncome,
    tabungan = 0,
    period = currentPeriod()
  ) => {
    const suggestions = getBudgetSuggestions(income, tabungan);
    const existingCategories = new Set(budgets.map((budget) => normalizeCategoryName(budget.category)));

    for (const s of suggestions) {
      if (existingCategories.has(normalizeCategoryName(s.category))) continue;
      try {
        await addBudget({ category: s.category, total: s.amount, period });
        existingCategories.add(normalizeCategoryName(s.category));
      } catch {
        // continue
      }
    }
    await bootstrapAppData(authToken);
  };

  const updateBudget = async (budgetId, amount) => {
    if (!authToken) {
      throw new Error("Anda harus masuk terlebih dahulu");
    }

    await apiRequest(`/api/budgets/${budgetId}`, {
      method: "PUT",
      token: authToken,
      body: JSON.stringify({ amount: Math.abs(toNumber(amount)) }),
    });

    await bootstrapAppData(authToken);
  };

  const deleteBudget = async (budgetId) => {
    if (!authToken) {
      throw new Error("Anda harus masuk terlebih dahulu");
    }

    await apiRequest(`/api/budgets/${budgetId}`, {
      method: "DELETE",
      token: authToken,
    });

    await bootstrapAppData(authToken);
  };

  const updateProfile = async (payload) => {
    if (!authToken) {
      throw new Error("Anda harus masuk terlebih dahulu");
    }

    const response = await apiRequest("/api/auth/profile", {
      method: "PATCH",
      token: authToken,
      body: JSON.stringify(payload),
    });

    const updatedUser = response?.data?.user || response?.data || null;
    if (updatedUser) {
      setUser((prev) => ({
        ...prev,
        ...updatedUser,
      }));
      setStoredAuthSession({ token: authToken, user: updatedUser });
    }

    // Rehydrate the rest of the dashboard data, but do not fail the profile save
    // if a dependent endpoint is temporarily unavailable.
    bootstrapAppData(authToken).catch(() => null);
    return updatedUser;
  };

  return (
    <AppContext.Provider
      value={{
        user,
        transactions,
        budgets,
        insights,
        categories,
        customCategories,
        investments,
        savingsGoals,
        savingsAvailableBalance,
        savingsInsights,
        savingsReady,
        fetchSavingsGoals,
        fetchSavingsInsights,
        refreshSavingsData,
        createSavingsGoal,
        depositToSavingsGoal,
        withdrawFromSavingsGoal,
        deleteSavingsGoal,
        dashboardSummary,
        isAuthenticated,
        isAuthReady,
        isAddTxModalOpen,
        openAddTxModal,
        closeAddTxModal,
        globalSearchTerm,
        setGlobalSearchTerm,
        hasUnreadNotifications,
        setHasUnreadNotifications,
        authToken,
        dashboardMode,
        setDashboardMode,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        refreshTransactions,
        addBudget,
        updateBudget,
        deleteBudget,
        getBudgetSuggestions,
        applyBudgetSuggestion,
        applyAllBudgetSuggestions,
        fetchInvestmentProducts,
        fetchInvestmentProductById,
        fetchInvestmentQuotes,
        fetchInvestmentPortfolio,
        savePortfolioPosition,
        updatePortfolioPosition,
        deletePortfolioPosition,
        login,
        register,
        logout,
        updateProfile,
        editTx,
        openEditTxModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
