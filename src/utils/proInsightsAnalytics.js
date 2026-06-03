import { formatCategoryLabel } from "./categoryUtils";
import { computeProDashboardMetrics, healthLabel } from "./proDashboardAnalytics";

const formatIdr = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);

const monthPrefix = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

export const computeProInsightsMetrics = ({
  transactions = [],
  user = {},
  dashboardSummary = {},
  savingsGoals = [],
  savingsAvailableBalance = null,
  savingsInsights = [],
  investments = null,
  insights = [],
  budgets = [],
}) => {
  const dashboard = computeProDashboardMetrics({
    transactions,
    user,
    dashboardSummary,
    savingsGoals,
    savingsAvailableBalance,
    investments,
    insights,
  });

  const health = healthLabel(dashboard.healthScore);
  const monthlySeries = dashboard.incomeVsExpenseMonthly || [];
  const lastMonth = monthlySeries[monthlySeries.length - 1];
  const prevMonth = monthlySeries[monthlySeries.length - 2];
  const expenseIncreasePct =
    prevMonth && prevMonth.expense > 0
      ? ((Number(lastMonth?.expense || 0) - prevMonth.expense) / prevMonth.expense) * 100
      : 0;
  const incomeIncreasePct =
    prevMonth && prevMonth.income > 0
      ? ((Number(lastMonth?.income || 0) - prevMonth.income) / prevMonth.income) * 100
      : 0;

  const prefix = monthPrefix();
  const monthlySavingsDeposit = transactions
    .filter((t) => t.type === "savings_deposit" && String(t.date || "").startsWith(prefix))
    .reduce((s, t) => s + Math.abs(Number(t.amount) || 0), 0);

  const anomalies = transactions.filter((t) => t.is_anomaly);
  const overBudgetCategories = (dashboard.budgetProgress || []).filter((b) => b.pct >= 100);
  const nearBudgetCategories = (dashboard.budgetProgress || []).filter((b) => b.pct >= 70 && b.pct < 100);

  const categoryBar = (dashboard.categoryDistribution || []).slice(0, 8).map((c, i) => ({
    ...c,
    fill: PIE_COLORS[i % PIE_COLORS.length],
  }));

  const donutData = (dashboard.categoryDistribution || []).map((c, i) => ({
    name: c.name,
    value: c.amount,
    fill: PIE_COLORS[i % PIE_COLORS.length],
  }));

  const numericCards = buildNumericInsightCards({
    dashboard,
    health,
    expenseIncreasePct,
    incomeIncreasePct,
    monthlySavingsDeposit,
    anomalies,
    overBudgetCategories,
    nearBudgetCategories,
    investments,
    budgets,
    savingsGoals,
  });

  const mergedInsights = mergeAllInsights({
    numericCards,
    insights,
    savingsInsights,
    dashboardNumeric: dashboard.numericInsights || [],
  });

  const priorities = buildFinancialPriorities({
    dashboard,
    health,
    expenseIncreasePct,
    anomalies,
    overBudgetCategories,
    nearBudgetCategories,
    savingsGoals,
    investments,
  });

  return {
    ...dashboard,
    health,
    expenseIncreasePct,
    incomeIncreasePct,
    monthlySavingsDeposit,
    anomalies,
    overBudgetCategories,
    nearBudgetCategories,
    categoryBar,
    donutData,
    numericCards,
    mergedInsights,
    priorities,
    alerts: mergedInsights.filter((i) => i.type === "alert" || i.type === "anomaly"),
    recommendations: mergedInsights.filter((i) => i.type === "recommendation" || i.type === "behavior"),
    positives: mergedInsights.filter((i) => i.type === "positive"),
  };
};

const PIE_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#64748b"];

const buildNumericInsightCards = (ctx) => {
  const items = [];
  const {
    dashboard,
    health,
    expenseIncreasePct,
    incomeIncreasePct,
    monthlySavingsDeposit,
    anomalies,
    overBudgetCategories,
    nearBudgetCategories,
    investments,
    savingsGoals,
  } = ctx;

  items.push({
    id: "health-score",
    type: dashboard.healthScore >= 60 ? "positive" : "alert",
    title: `Financial Health Score: ${dashboard.healthScore}/100`,
    description: `Status kesehatan keuangan Anda: ${health.label}. Skor mempertimbangkan cashflow, rasio tabungan, kepatuhan anggaran, dan cadangan saldo.`,
    metric: dashboard.healthScore,
    category: "ringkasan",
  });

  items.push({
    id: "projected-balance",
    type: dashboard.projectedEndDelta >= 0 ? "positive" : "alert",
    title: "Prediksi Saldo Akhir Bulan",
    description: `Dengan pola saat ini, saldo utama diperkirakan ${formatIdr(dashboard.projectedEndBalance)} (${dashboard.projectedEndDelta >= 0 ? "+" : ""}${formatIdr(dashboard.projectedEndDelta)} dalam ${dashboard.daysLeft} hari lagi).`,
    metric: dashboard.projectedEndBalance,
    category: "prediksi",
  });

  items.push({
    id: "cashflow",
    type: dashboard.netCashflow >= 0 ? "positive" : "alert",
    title: "Cashflow Bersih Bulan Ini",
    description: `Pemasukan ${formatIdr(dashboard.income)} − pengeluaran ${formatIdr(dashboard.expense)} = ${formatIdr(dashboard.netCashflow)}.`,
    metric: dashboard.netCashflow,
    category: "arus-kas",
  });

  items.push({
    id: "savings-ratio",
    type: dashboard.savingsRatio >= 20 ? "positive" : dashboard.savingsRatio >= 10 ? "behavior" : "alert",
    title: "Evaluasi Rasio Tabungan",
    description: `Rasio tabungan (cashflow) ${dashboard.savingsRatio.toFixed(1)}% dari pemasukan. Setoran ke tujuan tabungan bulan ini: ${formatIdr(monthlySavingsDeposit)}.`,
    metric: dashboard.savingsRatio,
    category: "tabungan",
  });

  if (dashboard.topCategory) {
    items.push({
      id: "top-spend",
      type: "behavior",
      title: "Kategori Paling Boros",
      description: `${dashboard.topCategory.name} menyumbang ${formatIdr(dashboard.topCategory.amount)} (${((dashboard.topCategory.amount / Math.max(dashboard.categoryTotal, 1)) * 100).toFixed(1)}% pengeluaran bulan ini).`,
      metric: dashboard.topCategory.amount,
      category: "pengeluaran",
    });
  }

  if (expenseIncreasePct > 15) {
    items.push({
      id: "expense-spike",
      type: "alert",
      title: "Peringatan: Pengeluaran Meningkat",
      description: `Pengeluaran bulan ini naik ${expenseIncreasePct.toFixed(1)}% dibanding bulan lalu. Tinjau transaksi besar dan sesuaikan anggaran jika perlu.`,
      metric: expenseIncreasePct,
      category: "peringatan",
    });
  } else if (expenseIncreasePct < -10) {
    items.push({
      id: "expense-down",
      type: "positive",
      title: "Pengeluaran Turun",
      description: `Pengeluaran bulan ini turun ${Math.abs(expenseIncreasePct).toFixed(1)}% dibanding bulan lalu — kebiasaan hemat terlihat positif.`,
      category: "pengeluaran",
    });
  }

  if (incomeIncreasePct > 10) {
    items.push({
      id: "income-up",
      type: "positive",
      title: "Pemasukan Meningkat",
      description: `Pemasukan naik ${incomeIncreasePct.toFixed(1)}% vs bulan lalu. Pertimbangkan menaikkan alokasi tabungan.`,
      category: "pemasukan",
    });
  }

  if (anomalies.length > 0) {
    items.push({
      id: "anomaly-summary",
      type: "alert",
      title: `Deteksi Anomali (${anomalies.length})`,
      description: `${anomalies.map((a) => a.title).slice(0, 3).join(", ")}${anomalies.length > 3 ? "…" : ""} — transaksi tidak biasa terdeteksi. Tinjau detail di halaman Transaksi.`,
      metric: anomalies.length,
      category: "anomali",
      action: "Tinjau Transaksi",
    });
  } else {
    items.push({
      id: "no-anomaly",
      type: "positive",
      title: "Tidak Ada Anomali Terdeteksi",
      description: "Pola transaksi bulan ini terlihat normal. Sistem terus memantau perubahan signifikan secara otomatis.",
      category: "anomali",
    });
  }

  if (overBudgetCategories.length > 0) {
    items.push({
      id: "budget-over",
      type: "alert",
      title: "Anggaran Melewati Limit",
      description: `${overBudgetCategories.map((b) => formatCategoryLabel(b.name)).join(", ")} sudah ≥100% dari budget.`,
      action: "Tinjau Anggaran",
      category: "anggaran",
    });
  }

  if (nearBudgetCategories.length > 0) {
    items.push({
      id: "budget-near",
      type: "behavior",
      title: "Anggaran Mendekati Limit",
      description: `${nearBudgetCategories.map((b) => `${formatCategoryLabel(b.name)} (${b.pct.toFixed(0)}%)`).join(", ")} — waspadai overspending.`,
      action: "Tinjau Anggaran",
      category: "anggaran",
    });
  }

  if (dashboard.avgDailyExpense > 0) {
    const potentialSave = Math.round(dashboard.avgDailyExpense * 7 * 0.1);
    items.push({
      id: "save-tip",
      type: "recommendation",
      title: "Rekomendasi Penghematan",
      description: `Membatasi pengeluaran harian 10% (${formatIdr(potentialSave)}/minggu) dapat meningkatkan saldo akhir bulan tanpa mengubah gaya hidup drastis.`,
      metric: potentialSave,
      category: "hemat",
    });
  }

  const portfolioValue = Number(investments?.portfolio?.value ?? 0);
  if (portfolioValue > 0) {
    items.push({
      id: "investment",
      type: "behavior",
      title: "Portofolio Investasi",
      description: `Nilai portofolio tercatat ${formatIdr(portfolioValue)}. Kekayaan bersih estimasi: ${formatIdr(dashboard.netWorth)} (saldo + tabungan + investasi).`,
      metric: portfolioValue,
      category: "investasi",
      action: "Lihat Investasi",
    });
  }

  if (savingsGoals.length > 0) {
    const avgProgress =
      savingsGoals.reduce((s, g) => {
        const target = Number(g.target_amount) || 0;
        const saved = Number(g.saved_amount) || 0;
        return s + (target > 0 ? (saved / target) * 100 : 0);
      }, 0) / savingsGoals.length;
    items.push({
      id: "savings-goals",
      type: avgProgress >= 50 ? "positive" : "behavior",
      title: "Progress Tujuan Tabungan",
      description: `Rata-rata progress ${avgProgress.toFixed(1)}% di ${savingsGoals.length} tujuan. Total terkumpul: ${formatIdr(dashboard.totalSavings)}.`,
      metric: avgProgress,
      category: "tabungan",
      action: "Buka Tabungan",
    });
  }

  return items;
};

const mergeAllInsights = ({ numericCards, insights, savingsInsights, dashboardNumeric }) => {
  const seen = new Set();
  const merged = [];

  const push = (item) => {
    const key = `${item.id || item.title}`;
    if (seen.has(key)) return;
    seen.add(key);
    merged.push({
      ...item,
      id: item.id || key,
    });
  };

  numericCards.forEach(push);
  dashboardNumeric.forEach((item) =>
    push({
      ...item,
      category: item.category || "analisis",
    })
  );
  insights.forEach((item, index) =>
    push({
      ...item,
      id: item.id || `ctx-${index}`,
      category: item.category || "sistem",
    })
  );
  savingsInsights.forEach((item, index) =>
    push({
      id: `savings-api-${item.goal_id || index}`,
      type: item.type || "recommendation",
      title: item.title,
      description: item.description,
      action: item.action || "Buka Tabungan",
      category: "tabungan",
    })
  );

  return merged;
};

const buildFinancialPriorities = ({
  dashboard,
  health,
  expenseIncreasePct,
  anomalies,
  overBudgetCategories,
  nearBudgetCategories,
  savingsGoals,
}) => {
  const list = [];

  if (dashboard.healthScore < 50) {
    list.push({ rank: 1, label: "Perbaiki kesehatan keuangan", detail: health.label, urgency: "tinggi" });
  }
  if (anomalies.length > 0) {
    list.push({ rank: list.length + 1, label: "Tinjau transaksi anomali", detail: `${anomalies.length} transaksi`, urgency: "tinggi" });
  }
  if (overBudgetCategories.length > 0) {
    list.push({
      rank: list.length + 1,
      label: "Sesuaikan anggaran kategori over-limit",
      detail: overBudgetCategories.map((b) => formatCategoryLabel(b.name)).join(", "),
      urgency: "tinggi",
    });
  }
  if (dashboard.netCashflow < 0) {
    list.push({
      rank: list.length + 1,
      label: "Kurangi pengeluaran / tingkatkan pemasukan",
      detail: `Defisit ${formatIdr(Math.abs(dashboard.netCashflow))}`,
      urgency: "tinggi",
    });
  }
  if (expenseIncreasePct > 20) {
    list.push({
      rank: list.length + 1,
      label: "Kendalikan lonjakan pengeluaran",
      detail: `+${expenseIncreasePct.toFixed(0)}% vs bulan lalu`,
      urgency: "sedang",
    });
  }
  if (nearBudgetCategories.length > 0 && overBudgetCategories.length === 0) {
    list.push({
      rank: list.length + 1,
      label: "Pantau kategori mendekati limit budget",
      detail: nearBudgetCategories[0]?.name,
      urgency: "sedang",
    });
  }
  if (dashboard.savingsRatio < 15 && dashboard.income > 0) {
    list.push({
      rank: list.length + 1,
      label: "Tingkatkan rasio tabungan",
      detail: `Saat ini ${dashboard.savingsRatio.toFixed(1)}%`,
      urgency: "sedang",
    });
  }
  const incompleteGoals = savingsGoals.filter((g) => {
    const target = Number(g.target_amount) || 0;
    const saved = Number(g.saved_amount) || 0;
    return target > 0 && saved < target;
  });
  if (incompleteGoals.length > 0) {
    list.push({
      rank: list.length + 1,
      label: "Prioritaskan setoran tujuan tabungan",
      detail: incompleteGoals[0]?.name,
      urgency: "sedang",
    });
  }
  if (list.length === 0) {
    list.push({
      rank: 1,
      label: "Pertahankan kebiasaan keuangan saat ini",
      detail: health.label,
      urgency: "rendah",
    });
  }

  return list.slice(0, 6).map((item, index) => ({ ...item, rank: index + 1 }));
};
