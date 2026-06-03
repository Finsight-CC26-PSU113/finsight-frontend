import { formatCategoryLabel, normalizeCategoryName } from "./categoryUtils";

const dayKey = (dateStr) => String(dateStr || "").slice(0, 10);

const isCredit = (type) => type === "income" || type === "savings_withdraw";
const isDebit = (type) => type === "expense" || type === "savings_deposit";

export const PAYMENT_METHOD_OPTIONS = [
  { value: "all", label: "Semua Metode" },
  { value: "cash", label: "Tunai" },
  { value: "debit_card", label: "Kartu Debit" },
  { value: "credit_card", label: "Kartu Kredit" },
  { value: "e_wallet", label: "E-Wallet" },
  { value: "bank_transfer", label: "Transfer Bank" },
];

export const formatPaymentMethodLabel = (method) => {
  const key = `${method || ""}`.toLowerCase();
  const found = PAYMENT_METHOD_OPTIONS.find((o) => o.value === key);
  return found ? found.label : method || "—";
};

export const normalizePaymentMethod = (tx) => `${tx?.paymentMethod || tx?.payment_method || "cash"}`.toLowerCase();

const formatIdr = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);

export const filterProTransactions = (transactions, filters) => {
  const {
    search = "",
    typeFilter = "all",
    category = "all",
    month = "all",
    dateFrom = "",
    dateTo = "",
    paymentMethod = "all",
    amountMin = null,
    amountMax = null,
  } = filters;

  const q = search.trim().toLowerCase();

  return transactions.filter((tx) => {
    const matchesSearch =
      !q ||
      `${tx.title || ""}`.toLowerCase().includes(q) ||
      `${tx.category || ""}`.toLowerCase().includes(q);

    const matchesType =
      typeFilter === "all" ||
      tx.type === typeFilter ||
      (typeFilter === "savings" && (tx.type === "savings_deposit" || tx.type === "savings_withdraw"));

    const matchesCategory =
      category === "all" || normalizeCategoryName(tx.category) === normalizeCategoryName(category);

    const txDay = dayKey(tx.date);
    let matchesDate = true;

    if (month !== "all") {
      matchesDate = txDay.startsWith(month);
    }
    if (dateFrom && txDay < dateFrom) matchesDate = false;
    if (dateTo && txDay > dateTo) matchesDate = false;

    const matchesPayment =
      paymentMethod === "all" || normalizePaymentMethod(tx) === paymentMethod;

    const absAmount = Math.abs(Number(tx.amount) || 0);
    const matchesMin = amountMin == null || amountMin === "" || absAmount >= Number(amountMin);
    const matchesMax = amountMax == null || amountMax === "" || absAmount <= Number(amountMax);

    return matchesSearch && matchesType && matchesCategory && matchesDate && matchesPayment && matchesMin && matchesMax;
  });
};

export const sortTransactions = (list, sortBy = "date-desc") => {
  const sorted = [...list];
  if (sortBy === "date-desc") return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
  if (sortBy === "date-asc") return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
  if (sortBy === "amount-desc") return sorted.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
  if (sortBy === "amount-asc") return sorted.sort((a, b) => Math.abs(a.amount) - Math.abs(b.amount));
  return sorted;
};

const sumByType = (list, credit) =>
  list
    .filter((tx) => (credit ? isCredit(tx.type) : isDebit(tx.type)))
    .reduce((s, tx) => s + Math.abs(Number(tx.amount) || 0), 0);

const buildCategoryBreakdown = (list) => {
  const map = {};
  list
    .filter((tx) => tx.type === "expense")
    .forEach((tx) => {
      const key = normalizeCategoryName(tx.category);
      map[key] = (map[key] || 0) + Math.abs(Number(tx.amount) || 0);
    });

  const rows = Object.entries(map)
    .map(([key, amount]) => ({
      key,
      name: formatCategoryLabel(key),
      amount,
      count: list.filter((tx) => tx.type === "expense" && normalizeCategoryName(tx.category) === key).length,
    }))
    .sort((a, b) => b.amount - a.amount);

  const total = rows.reduce((s, r) => s + r.amount, 0);
  return {
    rows,
    total,
    top: rows[0] || null,
    distribution: rows.map((r) => ({
      ...r,
      percent: total > 0 ? (r.amount / total) * 100 : 0,
    })),
  };
};

const buildDailySeries = (list, days = 14) => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (days - 1));

  const buckets = {};
  for (let i = 0; i < days; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = dayKey(d.toISOString());
    buckets[key] = { date: key, income: 0, expense: 0, net: 0, count: 0 };
  }

  list.forEach((tx) => {
    const key = dayKey(tx.date);
    if (!buckets[key]) return;
    const amount = Math.abs(Number(tx.amount) || 0);
    buckets[key].count += 1;
    if (isCredit(tx.type)) buckets[key].income += amount;
    if (isDebit(tx.type)) buckets[key].expense += amount;
    buckets[key].net = buckets[key].income - buckets[key].expense;
  });

  return Object.values(buckets)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((row) => ({
      ...row,
      label: new Date(row.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
    }));
};

const buildWeeklySeries = (list, weeks = 8) => {
  const map = {};
  const now = new Date();

  for (let w = weeks - 1; w >= 0; w -= 1) {
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() - w * 7);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekEnd.getDate() - 6);
    const key = dayKey(weekStart.toISOString());
    map[key] = {
      weekStart: key,
      income: 0,
      expense: 0,
      net: 0,
      count: 0,
      label: `${weekStart.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}`,
    };
  }

  list.forEach((tx) => {
    const txDate = new Date(tx.date);
    if (Number.isNaN(txDate.getTime())) return;

    const amount = Math.abs(Number(tx.amount) || 0);
    Object.keys(map).forEach((weekKey) => {
      const start = new Date(weekKey);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      if (txDate >= start && txDate <= end) {
        map[weekKey].count += 1;
        if (isCredit(tx.type)) map[weekKey].income += amount;
        if (isDebit(tx.type)) map[weekKey].expense += amount;
        map[weekKey].net = map[weekKey].income - map[weekKey].expense;
      }
    });
  });

  return Object.values(map).sort((a, b) => a.weekStart.localeCompare(b.weekStart));
};

const buildPeriodComparison = (list) => {
  const map = {};
  list.forEach((tx) => {
    const key = dayKey(tx.date).slice(0, 7);
    if (!key) return;
    if (!map[key]) map[key] = { month: key, income: 0, expense: 0, count: 0 };
    const amount = Math.abs(Number(tx.amount) || 0);
    map[key].count += 1;
    if (isCredit(tx.type)) map[key].income += amount;
    if (isDebit(tx.type)) map[key].expense += amount;
  });

  return Object.values(map)
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6)
    .map((row) => ({
      ...row,
      net: row.income - row.expense,
      label: new Date(`${row.month}-01`).toLocaleDateString("id-ID", { month: "short", year: "2-digit" }),
    }));
};

const countUniqueDaysWithExpense = (list) => {
  const days = new Set(
    list.filter((tx) => tx.type === "expense").map((tx) => dayKey(tx.date))
  );
  return Math.max(1, days.size);
};

export const buildTransactionAiInsights = (metrics, insights = []) => {
  const items = [];
  const { income, expense, net, txCount, avgDailyExpense, topCategory, categoryTotal, periodComparison } = metrics;

  items.push({
    id: "summary-net",
    type: net >= 0 ? "positive" : "alert",
    title: "Ringkasan Periode",
    description: `Dari ${txCount} transaksi terfilter: pemasukan ${formatIdr(income)}, pengeluaran ${formatIdr(expense)}, selisih ${formatIdr(net)}.`,
  });

  items.push({
    id: "avg-daily",
    type: "behavior",
    title: "Rata-rata Pengeluaran Harian",
    description: `Estimasi ${formatIdr(avgDailyExpense)} per hari aktif berpengeluaran dalam periode ini.`,
  });

  if (topCategory) {
    const share = categoryTotal > 0 ? ((topCategory.amount / categoryTotal) * 100).toFixed(1) : "0";
    items.push({
      id: "top-category",
      type: "behavior",
      title: "Kategori Pengeluaran Terbesar",
      description: `${topCategory.name} mendominasi ${share}% (${formatIdr(topCategory.amount)}) dari total pengeluaran terfilter.`,
    });
  }

  if (periodComparison.length >= 2) {
    const last = periodComparison[periodComparison.length - 1];
    const prev = periodComparison[periodComparison.length - 2];
    const expenseDelta = last.expense - prev.expense;
    const pct = prev.expense > 0 ? ((expenseDelta / prev.expense) * 100).toFixed(1) : "—";
    items.push({
      id: "mom-expense",
      type: expenseDelta > 0 ? "alert" : "positive",
      title: "Perbandingan Pengeluaran Bulanan",
      description:
        expenseDelta > 0
          ? `Pengeluaran bulan terakhir naik ${formatIdr(expenseDelta)} (${pct}%) dibanding bulan sebelumnya.`
          : `Pengeluaran bulan terakhir turun ${formatIdr(Math.abs(expenseDelta))} (${pct}%) dibanding bulan sebelumnya.`,
    });
  }

  const highSpendDays = metrics.dailySeries.filter((d) => d.expense > avgDailyExpense * 1.5 && d.expense > 0);
  if (highSpendDays.length > 0) {
    const peak = [...highSpendDays].sort((a, b) => b.expense - a.expense)[0];
    items.push({
      id: "spike-day",
      type: "alert",
      title: "Lonjakan Pengeluaran Harian",
      description: `Tanggal ${peak.label} tercatat pengeluaran ${formatIdr(peak.expense)}, di atas rata-rata harian Anda.`,
    });
  }

  insights.slice(0, 3).forEach((insight, index) => {
    items.push({
      id: `api-${insight.id || index}`,
      type: insight.type || "recommendation",
      title: insight.title,
      description: insight.description,
    });
  });

  return items;
};

export const computeProTransactionMetrics = (filteredList, allTransactions = filteredList) => {
  const income = sumByType(filteredList, true);
  const expense = sumByType(filteredList, false);
  const net = income - expense;
  const txCount = filteredList.length;
  const expenseDays = countUniqueDaysWithExpense(filteredList);
  const avgDailyExpense = expense / expenseDays;
  const categories = buildCategoryBreakdown(filteredList);
  const dailySeries = buildDailySeries(filteredList, 14);
  const weeklySeries = buildWeeklySeries(filteredList, 8);
  const periodComparison = buildPeriodComparison(allTransactions);

  const typeBreakdown = {
    income: filteredList.filter((tx) => tx.type === "income").length,
    expense: filteredList.filter((tx) => tx.type === "expense").length,
    savings: filteredList.filter((tx) => tx.type === "savings_deposit" || tx.type === "savings_withdraw").length,
  };

  const paymentBreakdown = PAYMENT_METHOD_OPTIONS.filter((o) => o.value !== "all").map((opt) => ({
    method: opt.value,
    label: opt.label,
    count: filteredList.filter((tx) => normalizePaymentMethod(tx) === opt.value).length,
    amount: filteredList
      .filter((tx) => normalizePaymentMethod(tx) === opt.value)
      .reduce((s, tx) => s + Math.abs(Number(tx.amount) || 0), 0),
  }));

  return {
    income,
    expense,
    net,
    txCount,
    avgDailyExpense,
    topCategory: categories.top,
    categoryTotal: categories.total,
    categoryRows: categories.rows,
    categoryDistribution: categories.distribution,
    dailySeries,
    weeklySeries,
    periodComparison,
    typeBreakdown,
    paymentBreakdown,
  };
};
