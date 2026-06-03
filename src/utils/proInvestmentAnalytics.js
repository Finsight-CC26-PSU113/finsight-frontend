const CHART_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#06b6d4", "#ec4899", "#64748b"];

const CATEGORY_LABELS = {
  stock: "Saham",
  mutual_fund: "Reksa Dana",
  bond: "Obligasi",
  gold: "Emas",
};

const formatIdr = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);

export const getRiskProfileFromStorage = () => {
  if (typeof window === "undefined") {
    return { profile: "Mid Risk (Moderat)", level: "moderate", desc: "" };
  }
  const profile = localStorage.getItem("onboarding_profile") || "Mid Risk (Moderat)";
  const desc = localStorage.getItem("onboarding_desc") || "";
  const lower = profile.toLowerCase();
  let level = "moderate";
  if (lower.includes("low") || lower.includes("konservatif")) level = "conservative";
  if (lower.includes("high") || lower.includes("agresif")) level = "aggressive";
  return { profile, level, desc };
};

const enrichPosition = (pos) => {
  const qty = Number(pos.quantity) || 0;
  const price = Number(pos.quote?.price) || 0;
  const marketValue = Number(pos.market_value) || price * qty;
  const avgCost = pos.avg_cost != null ? Number(pos.avg_cost) : null;
  const costBasis = avgCost != null ? avgCost * qty : null;
  const pnl = pos.pnl != null ? Number(pos.pnl) : costBasis != null ? marketValue - costBasis : null;
  const returnPct = costBasis > 0 && pnl != null ? (pnl / costBasis) * 100 : null;
  const category = pos.product?.category || "stock";

  return {
    ...pos,
    qty,
    price,
    marketValue,
    avgCost,
    costBasis,
    pnl,
    returnPct,
    category,
    categoryLabel: CATEGORY_LABELS[category] || category,
    productName: pos.product?.name || "Produk",
    symbol: pos.product?.symbol || "",
  };
};

export const buildAllocationDonut = (positions = []) => {
  const map = {};
  positions.forEach((pos) => {
    const key = pos.categoryLabel;
    map[key] = (map[key] || 0) + pos.marketValue;
  });
  const total = Object.values(map).reduce((s, v) => s + v, 0);
  return Object.entries(map).map(([name, value], index) => ({
    name,
    value,
    percent: total > 0 ? (value / total) * 100 : 0,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }));
};

export const buildInstrumentComparison = (positions = []) =>
  positions
    .map((pos, index) => ({
      name: pos.symbol || pos.productName.slice(0, 12),
      fullName: pos.productName,
      marketValue: pos.marketValue,
      costBasis: pos.costBasis || 0,
      pnl: pos.pnl || 0,
      returnPct: pos.returnPct,
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }))
    .sort((a, b) => b.marketValue - a.marketValue);

export const buildPortfolioGrowthTrend = (positions = [], monthsBack = 6) => {
  const now = new Date();
  const totalValue = positions.reduce((s, p) => s + p.marketValue, 0);
  const totalCost = positions.reduce((s, p) => s + (p.costBasis || 0), 0);

  const buckets = [];
  for (let i = monthsBack - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets.push({ month: key, label: d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" }), value: 0, invested: 0 });
  }

  if (totalValue <= 0 && totalCost <= 0) {
    return buckets;
  }

  const avgReturn =
    totalCost > 0 && totalValue > totalCost ? (totalValue - totalCost) / totalCost / Math.max(1, monthsBack) : 0.02;

  return buckets.map((row, index) => {
    const progress = (index + 1) / monthsBack;
    const estimatedValue = totalCost > 0 ? totalCost * (1 + avgReturn * (index + 1)) : totalValue * progress;
    return {
      ...row,
      value: index === monthsBack - 1 ? totalValue : Math.round(estimatedValue),
      invested: totalCost > 0 ? Math.round(totalCost * progress) : 0,
    };
  });
};

export const simulateMonthlyInvestment = (monthlyAmount, annualReturnPct = 8, months = 12) => {
  const monthlyRate = annualReturnPct / 100 / 12;
  let balance = 0;
  const series = [];
  for (let m = 1; m <= months; m += 1) {
    balance = balance * (1 + monthlyRate) + monthlyAmount;
    series.push({ month: m, label: `B${m}`, value: Math.round(balance) });
  }
  return {
    endValue: Math.round(balance),
    series,
    totalContributed: monthlyAmount * months,
  };
};

const normalizeProductRisk = (level) => {
  const key = `${level || ""}`.toLowerCase();
  if (key === "low" || key.includes("rendah") || key.includes("konservatif")) return 1;
  if (key === "high" || key.includes("tinggi") || key.includes("agresif")) return 3;
  return 2;
};

export const recommendProducts = (products = [], riskLevel = "moderate", limit = 4) => {
  const target =
    riskLevel === "conservative" ? 1 : riskLevel === "aggressive" ? 3 : 2;

  return [...products]
    .sort((a, b) => {
      const ra = normalizeProductRisk(a.risk_level);
      const rb = normalizeProductRisk(b.risk_level);
      const da = Math.abs(ra - target);
      const db = Math.abs(rb - target);
      if (da !== db) return da - db;
      return (Number(b.return_1y) || 0) - (Number(a.return_1y) || 0);
    })
    .slice(0, limit)
    .map((p) => ({
      id: p.id,
      name: p.name,
      symbol: p.symbol,
      category: p.category,
      categoryLabel: CATEGORY_LABELS[p.category] || p.category,
      risk_level: p.risk_level,
      return_1y: p.return_1y,
      min_buy: p.min_buy,
    }));
};

export const computeProInvestmentMetrics = ({
  portfolio = null,
  user = {},
  savingsGoals = [],
  transactions = [],
  riskProfile = getRiskProfileFromStorage(),
}) => {
  const positions = (portfolio?.positions || []).map(enrichPosition);
  const totalValue = Number(portfolio?.value) || positions.reduce((s, p) => s + p.marketValue, 0);
  const totalPnl = Number(portfolio?.pnl) || positions.reduce((s, p) => s + (p.pnl || 0), 0);
  const totalCost = positions.reduce((s, p) => s + (p.costBasis || 0), 0);
  const returnPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  const allocationDonut = buildAllocationDonut(positions);
  const instrumentBar = buildInstrumentComparison(positions);
  const growthTrend = buildPortfolioGrowthTrend(positions);

  const topCategory = allocationDonut[0] || null;
  const bestPerformer = [...positions].filter((p) => p.returnPct != null).sort((a, b) => b.returnPct - a.returnPct)[0];
  const worstPerformer = [...positions].filter((p) => p.returnPct != null).sort((a, b) => a.returnPct - b.returnPct)[0];

  const monthlyIncome = Number(user.monthlyIncome) || 0;
  const suggestedMonthly = monthlyIncome > 0 ? Math.round(monthlyIncome * 0.1) : 500_000;
  const annualReturnEstimate =
    riskProfile.level === "conservative" ? 6 : riskProfile.level === "aggressive" ? 12 : 8;
  const simulation = simulateMonthlyInvestment(suggestedMonthly, annualReturnEstimate, 12);

  const totalSavings = savingsGoals.reduce((s, g) => s + Number(g.saved_amount || 0), 0);
  const netWorth = Number(user.balance || 0) + totalSavings + totalValue;

  const riskScore =
    riskProfile.level === "conservative" ? "Rendah" : riskProfile.level === "aggressive" ? "Tinggi" : "Sedang";

  return {
    positions,
    totalValue,
    totalPnl,
    totalCost,
    returnPct,
    allocationDonut,
    instrumentBar,
    growthTrend,
    topCategory,
    bestPerformer,
    worstPerformer,
    riskProfile,
    riskScore,
    suggestedMonthly,
    annualReturnEstimate,
    simulation,
    netWorth,
    positionCount: positions.length,
    hasPortfolio: totalValue > 0 || positions.length > 0,
  };
};

export const buildInvestmentAiInsights = ({
  metrics,
  savingsGoals = [],
  insights = [],
}) => {
  const items = [];
  const {
    totalValue,
    totalPnl,
    totalCost,
    returnPct,
    riskProfile,
    riskScore,
    topCategory,
    bestPerformer,
    worstPerformer,
    simulation,
    suggestedMonthly,
    annualReturnEstimate,
    hasPortfolio,
    positionCount,
  } = metrics;

  items.push({
    id: "portfolio-summary",
    type: hasPortfolio ? (returnPct >= 0 ? "positive" : "alert") : "behavior",
    title: "Ringkasan Portofolio",
    description: hasPortfolio
      ? `Nilai portofolio ${formatIdr(totalValue)} (${positionCount} posisi). Modal tercatat ${formatIdr(totalCost)} — P/L ${totalPnl >= 0 ? "+" : ""}${formatIdr(totalPnl)} (${returnPct >= 0 ? "+" : ""}${returnPct.toFixed(1)}%).`
      : "Anda belum memiliki posisi investasi. Tambahkan posisi di halaman Portofolio untuk analisis yang lebih akurat.",
    category: "portofolio",
    action: hasPortfolio ? "Lihat Portofolio" : "Kelola Portofolio",
  });

  items.push({
    id: "risk-profile",
    type: "behavior",
    title: `Profil Risiko: ${riskProfile.profile}`,
    description: `Tingkat risiko investasi yang sesuai profil Anda: ${riskScore}. Rekomendasi produk disesuaikan dengan toleransi ini.`,
    category: "risiko",
  });

  if (topCategory) {
    items.push({
      id: "allocation",
      type: "behavior",
      title: "Alokasi Terbesar",
      description: `${topCategory.name} mendominasi ${topCategory.percent.toFixed(1)}% portofolio (${formatIdr(topCategory.value)}). Pertimbangkan diversifikasi jika satu kelas aset terlalu besar.`,
      category: "alokasi",
    });
  }

  if (bestPerformer) {
    items.push({
      id: "best",
      type: "positive",
      title: "Performa Terbaik",
      description: `${bestPerformer.productName} (${bestPerformer.symbol}) return ${bestPerformer.returnPct?.toFixed(1)}% — kontribusi positif ke portofolio.`,
      category: "performa",
    });
  }

  if (worstPerformer && (worstPerformer.returnPct || 0) < 0) {
    items.push({
      id: "worst",
      type: "alert",
      title: "Perlu Review",
      description: `${worstPerformer.productName} menunjukkan return ${worstPerformer.returnPct?.toFixed(1)}%. Evaluasi ulang alokasi atau horizon investasi.`,
      category: "performa",
    });
  }

  items.push({
    id: "simulation",
    type: "recommendation",
    title: "Simulasi Investasi Bulanan",
    description: `Jika menabung investasi ${formatIdr(suggestedMonthly)}/bulan dengan estimasi return ${annualReturnEstimate}% p.a, proyeksi 12 bulan: ~${formatIdr(simulation.endValue)} (total setor ${formatIdr(simulation.totalContributed)}).`,
    category: "simulasi",
  });

  const incompleteGoals = savingsGoals.filter((g) => {
    const target = Number(g.target_amount) || 0;
    const saved = Number(g.saved_amount) || 0;
    return target > 0 && saved < target;
  });
  if (incompleteGoals.length > 0) {
    items.push({
      id: "goal-link",
      type: "recommendation",
      title: "Selaraskan dengan Tujuan Keuangan",
      description: `Anda punya ${incompleteGoals.length} tujuan tabungan aktif (mis. "${incompleteGoals[0].name}"). Alokasikan sebagian return investasi untuk mempercepat pencapaian target.`,
      category: "tujuan",
      action: "Buka Tabungan",
    });
  }

  if (!hasPortfolio) {
    items.push({
      id: "start",
      type: "recommendation",
      title: "Mulai Membangun Portofolio",
      description: `Profil ${riskProfile.profile}: mulai dari instrumen risiko ${riskScore === "Rendah" ? "rendah seperti obligasi atau RDPU" : riskScore === "Tinggi" ? "lebih tinggi seperti saham diversifikasi" : "seimbang (campuran reksa dana & obligasi)"}.`,
      category: "rekomendasi",
      action: "Lihat Produk",
    });
  }

  insights
    .filter((i) => `${i.title || ""}`.toLowerCase().includes("invest") || `${i.description || ""}`.toLowerCase().includes("portofolio"))
    .slice(0, 2)
    .forEach((insight, index) => {
      items.push({
        id: `ctx-${insight.id || index}`,
        type: insight.type || "recommendation",
        title: insight.title,
        description: insight.description,
        action: insight.action,
        category: "sistem",
      });
    });

  return items;
};
