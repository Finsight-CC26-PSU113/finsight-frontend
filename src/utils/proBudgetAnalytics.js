import { formatCategoryLabel, normalizeCategoryName } from "./categoryUtils";

const formatIdr = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);

const monthPrefix = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const getProgressForBudget = (budget, budgetProgress = []) => {
  const match = budgetProgress.find(
    (p) =>
      (budget.category_id && p.category_id === budget.category_id) ||
      `${p.name || ""}`.toLowerCase() === `${budget.category || ""}`.toLowerCase()
  );
  const spent = Number(budget.spent ?? match?.spent_amount ?? 0);
  const total = Number(budget.total ?? budget.amount ?? 0);
  return { spent, total, match };
};

export const enrichBudgetRows = (budgets = [], dashboardSummary = {}) => {
  const progress = dashboardSummary?.budget_progress || [];
  const now = new Date();
  const daysElapsed = Math.max(1, now.getDate());
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = Math.max(0, daysInMonth - daysElapsed);

  return budgets.map((budget) => {
    const { spent, total } = getProgressForBudget(budget, progress);
    const remaining = total - spent;
    const usagePct = total > 0 ? (spent / total) * 100 : 0;
    const dailyAvg = spent / daysElapsed;
    const daysUntilEmpty =
      usagePct >= 100 ? 0 : remaining > 0 && dailyAvg > 0 ? Math.ceil(remaining / dailyAvg) : null;

    let status = "safe";
    let statusLabel = "Aman";
    if (usagePct >= 100) {
      status = "over";
      statusLabel = "Melebihi";
    } else if (usagePct >= 90) {
      status = "danger";
      statusLabel = "Bahaya";
    } else if (usagePct >= 70) {
      status = "warning";
      statusLabel = "Waspada";
    }

    return {
      ...budget,
      spent,
      total,
      remaining,
      usagePct,
      dailyAvg,
      daysUntilEmpty,
      daysLeft,
      status,
      statusLabel,
      displayCategory: formatCategoryLabel(budget.category),
      chartColor: budget.chartColor || "#94a3b8",
    };
  });
};

export const buildBudgetVsActual = (rows = []) =>
  rows.map((row) => ({
    name: row.displayCategory,
    budget: row.total,
    actual: row.spent,
    remaining: Math.max(0, row.remaining),
    usagePct: row.usagePct,
    fill: row.chartColor,
  }));

export const buildAllocationDonut = (rows = []) =>
  rows
    .filter((row) => row.total > 0)
    .map((row) => ({
      name: row.displayCategory,
      value: row.total,
      fill: row.chartColor,
    }));

export const buildBudgetUsageTrend = (transactions = [], totalBudget = 0) => {
  const prefix = monthPrefix();
  const now = new Date();
  const dayNum = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dailySpend = {};

  for (let d = 1; d <= dayNum; d += 1) {
    const key = `${prefix}-${String(d).padStart(2, "0")}`;
    dailySpend[key] = 0;
  }

  transactions
    .filter((tx) => tx.type === "expense" && String(tx.date || "").startsWith(prefix))
    .forEach((tx) => {
      const key = String(tx.date).slice(0, 10);
      if (dailySpend[key] !== undefined) {
        dailySpend[key] += Math.abs(Number(tx.amount) || 0);
      }
    });

  const keys = Object.keys(dailySpend).sort();
  let cumulative = 0;
  const idealDaily = totalBudget > 0 ? totalBudget / daysInMonth : 0;

  return keys.map((key, index) => {
    cumulative += dailySpend[key];
    const dayIndex = index + 1;
    return {
      date: key,
      label: new Date(key).toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
      daily: dailySpend[key],
      cumulative,
      idealPace: idealDaily * dayIndex,
    };
  });
};

export const computeProBudgetMetrics = ({
  budgets = [],
  dashboardSummary = {},
  transactions = [],
}) => {
  const rows = enrichBudgetRows(budgets, dashboardSummary);
  const totalBudget = Number(dashboardSummary?.total_budget || 0) || rows.reduce((s, r) => s + r.total, 0);
  const totalSpent = Number(dashboardSummary?.total_spent || 0) || rows.reduce((s, r) => s + r.spent, 0);
  const totalRemaining = Number(dashboardSummary?.total_remaining ?? totalBudget - totalSpent);
  const overallUsagePct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const overBudget = rows.filter((r) => r.status === "over");
  const atRisk = rows.filter((r) => r.status === "danger" || r.status === "warning");
  const safeCategories = rows.filter((r) => r.status === "safe");

  const avgDailySpend = totalSpent / Math.max(1, new Date().getDate());
  const daysUntilTotalEmpty =
    totalRemaining > 0 && avgDailySpend > 0 ? Math.ceil(totalRemaining / avgDailySpend) : totalRemaining <= 0 ? 0 : null;

  return {
    rows,
    totalBudget,
    totalSpent,
    totalRemaining,
    overallUsagePct,
    overBudget,
    atRisk,
    safeCategories,
    daysUntilTotalEmpty,
    budgetVsActual: buildBudgetVsActual(rows),
    allocationDonut: buildAllocationDonut(rows),
    usageTrend: buildBudgetUsageTrend(transactions, totalBudget),
  };
};

export const buildBudgetAiInsights = ({
  metrics,
  allocatableIncome = 0,
  tabunganAmount = 0,
  suggestionIncome = 0,
  pendingSuggestions = [],
  insights = [],
}) => {
  const items = [];
  const {
    totalBudget,
    totalSpent,
    totalRemaining,
    overallUsagePct,
    overBudget,
    safeCategories,
    daysUntilTotalEmpty,
    rows,
  } = metrics;

  items.push({
    id: "overall",
    type: overallUsagePct >= 100 ? "alert" : overallUsagePct >= 80 ? "behavior" : "positive",
    title: "Pemakaian Anggaran Keseluruhan",
    description: `Anda telah menggunakan ${overallUsagePct.toFixed(1)}% dari total anggaran (${formatIdr(totalSpent)} dari ${formatIdr(totalBudget)}). Sisa bulan ini: ${formatIdr(Math.max(0, totalRemaining))}.`,
  });

  if (daysUntilTotalEmpty !== null) {
    items.push({
      id: "depletion",
      type: daysUntilTotalEmpty <= 7 ? "alert" : "behavior",
      title: "Prediksi Anggaran Habis",
      description:
        daysUntilTotalEmpty === 0
          ? "Total anggaran bulan ini sudah terpakai atau melebihi batas."
          : `Jika pola pengeluaran tetap, seluruh anggaran diperkirakan habis dalam sekitar ${daysUntilTotalEmpty} hari.`,
    });
  }

  if (overBudget.length > 0) {
    items.push({
      id: "over",
      type: "alert",
      title: "Kategori Melebihi Batas",
      description: `${overBudget.map((r) => r.displayCategory).join(", ")} sudah melewati limit anggaran. Pertimbangkan menaikkan limit atau mengurangi pengeluaran.`,
    });
  }

  if (safeCategories.length > 0) {
    items.push({
      id: "safe",
      type: "positive",
      title: "Kategori Masih Aman",
      description: `${safeCategories.map((r) => r.displayCategory).join(", ")} masih di bawah 70% pemakaian — ruang manuver masih cukup.`,
    });
  }

  const fastestBurn = [...rows]
    .filter((r) => r.total > 0 && r.usagePct > 0)
    .sort((a, b) => b.usagePct - a.usagePct)[0];
  if (fastestBurn) {
    items.push({
      id: "fast-burn",
      type: fastestBurn.usagePct >= 90 ? "alert" : "behavior",
      title: "Kategori Tercepat Terpakai",
      description: `${fastestBurn.displayCategory} sudah ${fastestBurn.usagePct.toFixed(0)}% terpakai${fastestBurn.daysUntilEmpty !== null && fastestBurn.daysUntilEmpty > 0 ? ` — estimasi habis ~${fastestBurn.daysUntilEmpty} hari lagi.` : "."}`,
    });
  }

  if (pendingSuggestions.length > 0 && allocatableIncome > 0) {
    const top = pendingSuggestions[0];
    items.push({
      id: "suggest",
      type: "recommendation",
      title: "Rekomendasi Penyesuaian Anggaran",
      description: `Berdasarkan pemasukan ${formatIdr(suggestionIncome)} dan tabungan ${formatIdr(tabunganAmount)}, kami menyarankan alokasi ${formatCategoryLabel(top.category)} sekitar ${formatIdr(top.amount)} (${Math.round((top.percent || 0) * 100)}% dari dasar alokasi).`,
    });
  }

  const underUtilized = rows.filter((r) => r.total > 0 && r.usagePct < 30 && r.spent > 0);
  if (underUtilized.length > 0) {
    items.push({
      id: "under",
      type: "behavior",
      title: "Anggaran Bisa Dialihkan",
      description: `Kategori ${underUtilized.map((r) => r.displayCategory).join(", ")} masih rendah pemakaiannya — Anda bisa mengalihkan sisa ke tabungan atau kategori prioritas.`,
    });
  }

  insights
    .filter((i) => `${i.id || ""}`.includes("budget") || `${i.title || ""}`.toLowerCase().includes("anggaran") || `${i.title || ""}`.toLowerCase().includes("budget"))
    .slice(0, 2)
    .forEach((insight, index) => {
      items.push({
        id: `api-${insight.id || index}`,
        type: insight.type || "recommendation",
        title: insight.title,
        description: insight.description,
      });
    });

  return items;
};
