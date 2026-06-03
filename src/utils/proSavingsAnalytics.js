const CHART_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#06b6d4", "#ec4899", "#64748b"];

const formatIdr = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);

const monthPrefix = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const dayKey = (dateStr) => String(dateStr || "").slice(0, 10);

const monthsBetween = (from, to) => {
  const start = new Date(from);
  const end = new Date(to);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  return (
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth()) +
    (end.getDate() >= start.getDate() ? 0 : -1)
  );
};

const addMonths = (date, months) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

const goalDeposits = (transactions, goalId) =>
  transactions.filter((tx) => tx.type === "savings_deposit" && tx.savings_goal_id === goalId);

export const enrichSavingsGoalRow = (goal, transactions = [], now = new Date()) => {
  const target = Number(goal.target_amount) || 0;
  const saved = Number(goal.saved_amount) || 0;
  const remaining = Number(goal.remaining_amount ?? Math.max(0, target - saved));
  const progressPct = Number(goal.progress_percent) || (target > 0 ? Math.min(100, (saved / target) * 100) : 0);
  const isCompleted = Boolean(goal.is_completed) || (target > 0 && saved >= target);

  const threeMonthsAgo = new Date(now);
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const deposits = goalDeposits(transactions, goal.id);
  const recentDeposits = deposits.filter((tx) => new Date(tx.date) >= threeMonthsAgo);
  const totalRecent = recentDeposits.reduce((s, tx) => s + Math.abs(Number(tx.amount) || 0), 0);
  const monthsObserved = Math.max(1, monthsBetween(threeMonthsAgo, now) || 1);
  const avgMonthlyDeposit = totalRecent / monthsObserved;

  let monthsToTarget = null;
  let estimatedCompletion = null;
  if (!isCompleted && remaining > 0 && avgMonthlyDeposit > 0) {
    monthsToTarget = Math.ceil(remaining / avgMonthlyDeposit);
    estimatedCompletion = addMonths(now, monthsToTarget);
  }

  let recommendedMonthly = null;
  let monthsUntilDeadline = null;
  if (goal.deadline && remaining > 0 && !isCompleted) {
    const deadline = new Date(goal.deadline);
    monthsUntilDeadline = Math.max(1, monthsBetween(now, deadline) + 1);
    recommendedMonthly = remaining / monthsUntilDeadline;
  }

  let onTrack = "unknown";
  let onTrackLabel = "Belum cukup data";
  if (isCompleted) {
    onTrack = "completed";
    onTrackLabel = "Tercapai";
  } else if (!goal.deadline) {
    onTrack = avgMonthlyDeposit > 0 ? "progressing" : "no_deposits";
    onTrackLabel = avgMonthlyDeposit > 0 ? "Berjalan" : "Belum ada setoran";
  } else if (goal.deadline && estimatedCompletion) {
    const deadline = new Date(goal.deadline);
    if (estimatedCompletion <= deadline) {
      onTrack = "on_track";
      onTrackLabel = "Tepat waktu";
    } else {
      onTrack = "at_risk";
      onTrackLabel = "Berpotensi terlambat";
    }
  } else if (goal.deadline && monthsUntilDeadline !== null && monthsUntilDeadline <= 2) {
    onTrack = "at_risk";
    onTrackLabel = "Deadline dekat";
  } else if (avgMonthlyDeposit <= 0) {
    onTrack = "no_deposits";
    onTrackLabel = "Perlu setoran rutin";
  }

  let priorityScore = progressPct;
  if (goal.deadline && !isCompleted) {
    const deadline = new Date(goal.deadline);
    const daysLeft = Math.max(0, Math.ceil((deadline - now) / (1000 * 60 * 60 * 24)));
    const urgency = daysLeft > 0 ? 100 / daysLeft : 200;
    priorityScore = urgency * (100 - progressPct);
  } else if (!isCompleted) {
    priorityScore = 100 - progressPct;
  }

  return {
    ...goal,
    target,
    saved,
    remaining,
    progressPct,
    isCompleted,
    avgMonthlyDeposit,
    monthsToTarget,
    estimatedCompletion,
    recommendedMonthly,
    monthsUntilDeadline,
    onTrack,
    onTrackLabel,
    priorityScore,
    depositCount: deposits.length,
  };
};

export const buildSavingsGrowthTrend = (transactions = [], monthsBack = 6) => {
  const now = new Date();
  const buckets = {};

  for (let i = monthsBack - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = monthPrefix(d);
    buckets[key] = { month: key, deposits: 0, withdrawals: 0, net: 0 };
  }

  transactions.forEach((tx) => {
    const key = dayKey(tx.date).slice(0, 7);
    if (!buckets[key]) return;
    const amount = Math.abs(Number(tx.amount) || 0);
    if (tx.type === "savings_deposit") buckets[key].deposits += amount;
    if (tx.type === "savings_withdraw") buckets[key].withdrawals += amount;
    buckets[key].net = buckets[key].deposits - buckets[key].withdrawals;
  });

  let cumulative = 0;
  return Object.values(buckets)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((row) => {
      cumulative += row.net;
      return {
        ...row,
        cumulative,
        label: new Date(`${row.month}-01`).toLocaleDateString("id-ID", { month: "short", year: "2-digit" }),
      };
    });
};

export const buildAllocationDonut = (rows = []) =>
  rows
    .filter((row) => row.saved > 0)
    .map((row, index) => ({
      name: row.name,
      value: row.saved,
      fill: CHART_COLORS[index % CHART_COLORS.length],
      goalId: row.id,
    }));

export const buildTargetVsActual = (rows = []) =>
  rows.map((row) => ({
    name: row.name.length > 14 ? `${row.name.slice(0, 12)}…` : row.name,
    fullName: row.name,
    target: row.target,
    actual: row.saved,
    remaining: row.remaining,
    progressPct: row.progressPct,
  }));

export const computeProSavingsMetrics = ({
  savingsGoals = [],
  transactions = [],
  user = {},
}) => {
  const now = new Date();
  const prefix = monthPrefix(now);
  const rows = savingsGoals
    .map((goal) => enrichSavingsGoalRow(goal, transactions, now))
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .map((row, index) => ({ ...row, priorityRank: index + 1 }));

  const totalSaved = rows.reduce((s, r) => s + r.saved, 0);
  const totalTarget = rows.reduce((s, r) => s + r.target, 0);
  const totalRemaining = rows.reduce((s, r) => s + r.remaining, 0);
  const overallProgressPct = totalTarget > 0 ? Math.min(100, (totalSaved / totalTarget) * 100) : 0;

  const monthlyIncome =
    Number(user.monthlyIncome) ||
    transactions
      .filter((t) => t.type === "income" && String(t.date || "").startsWith(prefix))
      .reduce((s, t) => s + Math.abs(Number(t.amount) || 0), 0);

  const monthlySavingsDeposit = transactions
    .filter((t) => t.type === "savings_deposit" && String(t.date || "").startsWith(prefix))
    .reduce((s, t) => s + Math.abs(Number(t.amount) || 0), 0);

  const savingsRatio = monthlyIncome > 0 ? (monthlySavingsDeposit / monthlyIncome) * 100 : 0;

  const onTrackGoals = rows.filter((r) => r.onTrack === "on_track" || r.onTrack === "completed");
  const atRiskGoals = rows.filter((r) => r.onTrack === "at_risk");
  const completedGoals = rows.filter((r) => r.isCompleted);

  const totalRecommendedMonthly = rows
    .filter((r) => r.recommendedMonthly != null && !r.isCompleted)
    .reduce((s, r) => s + r.recommendedMonthly, 0);

  return {
    rows,
    totalSaved,
    totalTarget,
    totalRemaining,
    overallProgressPct,
    monthlyIncome,
    monthlySavingsDeposit,
    savingsRatio,
    onTrackGoals,
    atRiskGoals,
    completedGoals,
    totalRecommendedMonthly,
    growthTrend: buildSavingsGrowthTrend(transactions),
    allocationDonut: buildAllocationDonut(rows),
    targetVsActual: buildTargetVsActual(rows),
    priorityGoal: rows[0] || null,
  };
};

export const buildSavingsAiInsights = ({ metrics, apiInsights = [] }) => {
  const items = [];
  const {
    totalSaved,
    totalTarget,
    overallProgressPct,
    savingsRatio,
    monthlyIncome,
    monthlySavingsDeposit,
    onTrackGoals,
    atRiskGoals,
    completedGoals,
    totalRecommendedMonthly,
    priorityGoal,
    rows,
  } = metrics;

  items.push({
    id: "overview",
    type: overallProgressPct >= 50 ? "positive" : "behavior",
    title: "Ringkasan Tabungan",
    description: `Total terkumpul ${formatIdr(totalSaved)} dari target gabungan ${formatIdr(totalTarget)} (${overallProgressPct.toFixed(1)}% progres keseluruhan).`,
  });

  items.push({
    id: "ratio",
    type: savingsRatio >= 15 ? "positive" : savingsRatio >= 5 ? "behavior" : "alert",
    title: "Rasio Tabungan vs Pemasukan",
    description:
      monthlyIncome > 0
        ? `Bulan ini Anda menabung ${formatIdr(monthlySavingsDeposit)} (${savingsRatio.toFixed(1)}% dari pemasukan ${formatIdr(monthlyIncome)}).`
        : "Belum ada pemasukan tercatat bulan ini — rasio tabungan belum bisa dihitung.",
  });

  if (priorityGoal && !priorityGoal.isCompleted) {
    items.push({
      id: "priority",
      type: priorityGoal.onTrack === "at_risk" ? "alert" : "recommendation",
      title: `Prioritas: ${priorityGoal.name}`,
      description: `Target ini perlu perhatian (${priorityGoal.onTrackLabel}).${
        priorityGoal.recommendedMonthly
          ? ` Disarankan menabung ~${formatIdr(priorityGoal.recommendedMonthly)}/bulan.`
          : priorityGoal.avgMonthlyDeposit > 0
            ? ` Rata-rata setoran ${formatIdr(priorityGoal.avgMonthlyDeposit)}/bulan.`
            : " Mulai setoran rutin untuk mempercepat progres."
      }`,
    });
  }

  if (atRiskGoals.length > 0) {
    items.push({
      id: "at-risk",
      type: "alert",
      title: "Target Berpotensi Terlambat",
      description: `${atRiskGoals.map((g) => g.name).join(", ")} — pertimbangkan menaikkan nominal tabungan atau memperpanjang deadline.`,
    });
  }

  if (onTrackGoals.length > 0) {
    items.push({
      id: "on-track",
      type: "positive",
      title: "Target di Jalur Tepat Waktu",
      description: `${onTrackGoals.map((g) => g.name).join(", ")} menunjukkan pola yang mendukung pencapaian target.`,
    });
  }

  if (totalRecommendedMonthly > 0) {
    items.push({
      id: "monthly-plan",
      type: "recommendation",
      title: "Rencana Tabungan Bulanan",
      description: `Agar semua target dengan deadline tercapai, total setoran bulanan yang disarankan sekitar ${formatIdr(totalRecommendedMonthly)} (gabungan semua target aktif).`,
    });
  }

  const noDepositGoals = rows.filter((r) => !r.isCompleted && r.avgMonthlyDeposit <= 0);
  if (noDepositGoals.length > 0) {
    items.push({
      id: "no-deposit",
      type: "behavior",
      title: "Target Tanpa Pola Setoran",
      description: `${noDepositGoals.map((g) => g.name).join(", ")} belum punya setoran rutin 3 bulan terakhir — mulai nominal kecil secara konsisten.`,
    });
  }

  if (completedGoals.length > 0) {
    items.push({
      id: "completed",
      type: "positive",
      title: "Target Selesai",
      description: `Selamat! ${completedGoals.length} target sudah tercapai: ${completedGoals.map((g) => g.name).join(", ")}.`,
    });
  }

  apiInsights.slice(0, 4).forEach((insight, index) => {
    items.push({
      id: `api-${insight.goal_id || index}`,
      type: insight.type || "recommendation",
      title: insight.title,
      description: insight.description,
    });
  });

  return items;
};
