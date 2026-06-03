import { formatCategoryLabel, normalizeCategoryName } from "./categoryUtils";

const monthPrefix = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const dayKey = (dateStr) => String(dateStr || "").slice(0, 10);

const isCredit = (type) => type === "income" || type === "savings_withdraw";
const isDebit = (type) => type === "expense" || type === "savings_deposit";

export const computeProDashboardMetrics = ({
  transactions = [],
  user = {},
  dashboardSummary = {},
  savingsGoals = [],
  savingsAvailableBalance = null,
  investments = null,
  insights = [],
}) => {
  const now = new Date();
  const prefix = monthPrefix(now);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysElapsed = Math.max(1, now.getDate());
  const daysLeft = Math.max(0, daysInMonth - daysElapsed);

  const balance = Number(savingsAvailableBalance ?? user.balance ?? 0);
  const income = Number(user.monthlyIncome ?? 0);
  const expense = Number(user.monthlyExpenses ?? 0);
  const netCashflow = income - expense;
  const savingsRatio = income > 0 ? Math.max(0, (netCashflow / income) * 100) : 0;
  const avgDailyExpense = expense / daysElapsed;
  const avgDailyIncome = income / daysElapsed;

  const monthTx = transactions.filter((tx) => dayKey(tx.date).startsWith(prefix));

  const categoryMap = {};
  monthTx
    .filter((tx) => tx.type === "expense")
    .forEach((tx) => {
      const key = normalizeCategoryName(tx.category);
      categoryMap[key] = (categoryMap[key] || 0) + Math.abs(Number(tx.amount) || 0);
    });

  const categorySpend = Object.entries(categoryMap)
    .map(([key, amount]) => ({ key, amount }))
    .sort((a, b) => b.amount - a.amount);

  const topCategoryRaw = categorySpend[0] || null;
  const topCategory = topCategoryRaw
    ? {
        key: topCategoryRaw.key,
        name: formatCategoryLabel(topCategoryRaw.key),
        amount: topCategoryRaw.amount,
      }
    : null;
  const categoryTotal = categorySpend.reduce((s, c) => s + c.amount, 0);

  const categoryDistribution = categorySpend.map((c) => ({
    name: formatCategoryLabel(c.key),
    amount: c.amount,
    percent: categoryTotal > 0 ? (c.amount / categoryTotal) * 100 : 0,
  }));

  const incomeVsExpenseMonthly = buildMonthlyIncomeExpense(transactions);
  const balanceTrend = buildBalanceTrend(transactions, balance);
  const netCashflowTrend = incomeVsExpenseMonthly.map((row) => ({
    ...row,
    net: row.income - row.expense,
  }));

  const portfolioValue = Number(investments?.portfolio?.value ?? user.investment_portfolio_value ?? 0);
  const totalSavings = savingsGoals.reduce((s, g) => s + Number(g.saved_amount || 0), 0);

  const budgetProgress = (dashboardSummary.budget_progress || []).map((item) => ({
    name: item.name,
    budget: Number(item.budget_amount || 0),
    spent: Number(item.spent_amount || 0),
    pct: Number(item.percentage || 0),
  }));

  const budgetAdherence =
    budgetProgress.length > 0
      ? budgetProgress.reduce((s, b) => s + Math.max(0, 100 - Math.min(100, b.pct)), 0) / budgetProgress.length
      : 50;

  const healthScore = computeHealthScore({
    savingsRatio,
    netCashflow,
    income,
    balance,
    expense,
    budgetAdherence,
  });

  const projectedEndBalance = balance + (avgDailyIncome - avgDailyExpense) * daysLeft;
  const projectedEndDelta = projectedEndBalance - balance;

  const numericInsights = buildNumericInsights({
    income,
    expense,
    netCashflow,
    savingsRatio,
    avgDailyExpense,
    topCategory,
    categoryTotal,
    healthScore,
    projectedEndBalance,
    projectedEndDelta,
    daysLeft,
    budgetProgress,
    insights,
    totalSavings,
  });

  return {
    balance,
    income,
    expense,
    netCashflow,
    savingsRatio,
    avgDailyExpense,
    avgDailyIncome,
    topCategory,
    categoryDistribution,
    categoryTotal,
    incomeVsExpenseMonthly,
    balanceTrend,
    netCashflowTrend,
    budgetProgress,
    healthScore,
    projectedEndBalance,
    projectedEndDelta,
    daysLeft,
    daysInMonth,
    portfolioValue,
    totalSavings,
    netWorth: balance + totalSavings + portfolioValue,
    numericInsights,
  };
};

const buildMonthlyIncomeExpense = (transactions) => {
  const map = {};
  transactions.forEach((tx) => {
    const key = dayKey(tx.date).slice(0, 7);
    if (!key) return;
    if (!map[key]) map[key] = { month: key, income: 0, expense: 0 };
    const amount = Math.abs(Number(tx.amount) || 0);
    if (isCredit(tx.type)) map[key].income += amount;
    if (isDebit(tx.type)) map[key].expense += amount;
  });

  return Object.values(map)
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6)
    .map((row) => ({
      ...row,
      label: new Date(`${row.month}-01`).toLocaleDateString("id-ID", { month: "short", year: "2-digit" }),
    }));
};

const buildBalanceTrend = (transactions, currentBalance) => {
  const sorted = [...transactions].sort((a, b) => dayKey(a.date).localeCompare(dayKey(b.date)));
  let running = currentBalance;

  for (let i = sorted.length - 1; i >= 0; i -= 1) {
    const tx = sorted[i];
    const amount = Math.abs(Number(tx.amount) || 0);
    if (isCredit(tx.type)) running -= amount;
    if (isDebit(tx.type)) running += amount;
  }

  const byDay = {};
  sorted.forEach((tx) => {
    const key = dayKey(tx.date);
    if (!key) return;
    const amount = Math.abs(Number(tx.amount) || 0);
    if (isCredit(tx.type)) running += amount;
    if (isDebit(tx.type)) running -= amount;
    byDay[key] = running;
  });

  const keys = Object.keys(byDay).sort();
  const recentKeys = keys.slice(-30);

  return recentKeys.map((key) => ({
    date: key,
    label: new Date(key).toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
    balance: byDay[key],
  }));
};

const computeHealthScore = ({ savingsRatio, netCashflow, income, balance, expense, budgetAdherence }) => {
  let score = 0;

  score += Math.min(35, savingsRatio * 0.35);
  score += netCashflow >= 0 ? 25 : Math.max(0, 25 + (netCashflow / Math.max(income, 1)) * 25);
  score += Math.min(20, (budgetAdherence / 100) * 20);

  if (expense > 0) {
    const monthsCovered = balance / expense;
    if (monthsCovered >= 3) score += 20;
    else if (monthsCovered >= 1) score += 10;
    else score += 4;
  } else if (balance > 0) {
    score += 12;
  }

  return Math.round(Math.min(100, Math.max(0, score)));
};

const healthLabel = (score) => {
  if (score >= 80) return { label: "Sangat Sehat", tone: "text-emerald-700 bg-emerald-50 border-emerald-100" };
  if (score >= 60) return { label: "Cukup Sehat", tone: "text-primary-700 bg-primary-50 border-primary-100" };
  if (score >= 40) return { label: "Perlu Perhatian", tone: "text-amber-700 bg-amber-50 border-amber-100" };
  return { label: "Berisiko", tone: "text-red-700 bg-red-50 border-red-100" };
};

const buildNumericInsights = (ctx) => {
  const items = [];
  const {
    income,
    expense,
    netCashflow,
    savingsRatio,
    avgDailyExpense,
    topCategory,
    healthScore,
    projectedEndBalance,
    projectedEndDelta,
    daysLeft,
    budgetProgress,
    insights,
    totalSavings,
  } = ctx;

  items.push({
    id: "cashflow",
    type: netCashflow >= 0 ? "positive" : "alert",
    title: "Cashflow Bersih Bulan Ini",
    metric: netCashflow,
    description: `Pemasukan ${formatIdr(income)} dikurangi pengeluaran ${formatIdr(expense)} = ${formatIdr(netCashflow)}.`,
  });

  items.push({
    id: "savings-ratio",
    type: savingsRatio >= 20 ? "positive" : "behavior",
    title: "Rasio Tabungan",
    metric: savingsRatio,
    description: `Anda menyisihkan ${savingsRatio.toFixed(1)}% dari pemasukan bulan ini.`,
  });

  items.push({
    id: "daily-spend",
    type: "behavior",
    title: "Rata-rata Pengeluaran Harian",
    metric: avgDailyExpense,
    description: `Estimasi pengeluaran harian: ${formatIdr(avgDailyExpense)} berdasarkan hari berjalan.`,
  });

  if (topCategory) {
    items.push({
      id: "top-cat",
      type: "behavior",
      title: "Kategori Terbesar",
      metric: topCategory.amount,
      description: `${topCategory.name} menyumbang ${formatIdr(topCategory.amount)} (${((topCategory.amount / Math.max(ctx.categoryTotal, 1)) * 100).toFixed(1)}% dari pengeluaran).`,
    });
  }

  items.push({
    id: "projection",
    type: projectedEndDelta >= 0 ? "positive" : "alert",
    title: "Prediksi Saldo Akhir Bulan",
    metric: projectedEndBalance,
    description: `Dengan pola saat ini, saldo utama diperkirakan ${formatIdr(projectedEndBalance)} (${projectedEndDelta >= 0 ? "+" : ""}${formatIdr(projectedEndDelta)} dalam ${daysLeft} hari lagi).`,
  });

  const overBudget = budgetProgress.filter((b) => b.pct >= 100);
  if (overBudget.length > 0) {
    items.push({
      id: "budget-over",
      type: "alert",
      title: "Anggaran Melewati Limit",
      metric: overBudget.length,
      description: `${overBudget.length} kategori sudah ≥100%: ${overBudget.map((b) => b.name).join(", ")}.`,
    });
  }

  if (totalSavings > 0) {
    items.push({
      id: "savings",
      type: "positive",
      title: "Dana Tujuan Tabungan",
      metric: totalSavings,
      description: `Total terkumpul di semua tujuan tabungan: ${formatIdr(totalSavings)}.`,
    });
  }

  const hl = healthLabel(healthScore);
  items.unshift({
    id: "health",
    type: healthScore >= 60 ? "positive" : "alert",
    title: `Financial Health Score: ${healthScore}/100`,
    metric: healthScore,
    description: `Status kesehatan keuangan: ${hl.label}.`,
  });

  insights.slice(0, 2).forEach((insight, index) => {
    items.push({
      id: `api-${insight.id || index}`,
      type: insight.type || "recommendation",
      title: insight.title,
      description: insight.description,
    });
  });

  return items;
};

const formatIdr = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);

export { healthLabel };
