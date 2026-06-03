import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Building,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Percent,
  Shield,
  Target,
  Wallet,
  Layers,
  Coins,
  Landmark,
  ArrowRight,
  Briefcase,
} from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { useAppContext } from "../../context/AppContext";
import {
  buildInvestmentAiInsights,
  computeProInvestmentMetrics,
  recommendProducts,
} from "../../utils/proInvestmentAnalytics";

const formatRp = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);

const ChartCard = ({ title, subtitle, children }) => (
  <Card className="p-5 border border-slate-100 shadow-sm ring-1 ring-slate-100/80 h-full">
    <h3 className="font-semibold text-slate-900 text-sm">{title}</h3>
    {subtitle && <p className="text-xs text-slate-500 mt-0.5 mb-3">{subtitle}</p>}
    {!subtitle && <div className="mb-3" />}
    {children}
  </Card>
);

const SummaryCard = ({ label, value, sub, icon: Icon, tone }) => (
  <Card className="p-4 sm:p-5 min-h-[118px] rounded-3xl border border-slate-100 shadow-sm">
    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-2 ${tone}`}>
      <Icon className="w-5 h-5" />
    </div>
    <p className="text-xs font-medium text-slate-500">{label}</p>
    <p className="text-base sm:text-lg font-bold text-slate-900 mt-0.5 break-words">{value}</p>
    {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
  </Card>
);

const CATEGORY_ROUTES = {
  stock: "/investments/stock",
  mutual_fund: "/investments/mutual_fund",
  bond: "/investments/bond",
  gold: "/investments/gold",
};

export const ProInvestmentView = () => {
  const navigate = useNavigate();
  const {
    investments,
    user,
    savingsGoals,
    insights,
    fetchInvestmentPortfolio,
    fetchInvestmentProducts,
  } = useAppContext();

  const [portfolio, setPortfolio] = useState(investments?.portfolio || null);
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [pf, ...chunks] = await Promise.all([
          fetchInvestmentPortfolio().catch(() => null),
          fetchInvestmentProducts({ category: "stock" }).catch(() => []),
          fetchInvestmentProducts({ category: "mutual_fund" }).catch(() => []),
          fetchInvestmentProducts({ category: "bond" }).catch(() => []),
          fetchInvestmentProducts({ category: "gold" }).catch(() => []),
        ]);
        if (cancelled) return;
        if (pf) setPortfolio(pf);
        setCatalogProducts(chunks.flat());
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchInvestmentPortfolio, fetchInvestmentProducts]);

  const metrics = useMemo(
    () =>
      computeProInvestmentMetrics({
        portfolio,
        user,
        savingsGoals,
        insights,
      }),
    [portfolio, user, savingsGoals, insights]
  );

  const recommendations = useMemo(
    () => recommendProducts(catalogProducts, metrics.riskProfile.level, 4),
    [catalogProducts, metrics.riskProfile.level]
  );

  const aiInsights = useMemo(
    () => buildInvestmentAiInsights({ metrics, savingsGoals, insights }),
    [metrics, savingsGoals, insights]
  );

  const handleInsightAction = (item) => {
    const action = `${item.action || ""}`.toLowerCase();
    if (action.includes("portofolio")) {
      navigate("/investments/portfolio");
      return;
    }
    if (action.includes("tabungan")) {
      navigate("/savings");
      return;
    }
    if (action.includes("produk")) {
      navigate("/investments/stock");
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 max-w-6xl mx-auto pb-24 md:pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary-600">Investasi Pro</p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-0.5">Analisis Portofolio Lanjutan</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Pantau nilai aset, alokasi, return, simulasi bulanan, dan rekomendasi instrumen — mode lanjutan, bukan fitur berbayar.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate("/investments/portfolio")}>
            Kelola Portofolio
          </Button>
        </div>
      </div>

      {loading && (
        <Card className="p-4 text-sm text-slate-500 border-dashed">Memuat data portofolio dan katalog produk...</Card>
      )}

      {/* Ringkasan atas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <SummaryCard label="Nilai Investasi" value={formatRp(metrics.totalValue)} sub={`${metrics.positionCount} posisi`} icon={Building} tone="bg-primary-50 text-primary-600" />
        <SummaryCard
          label="Profit / Loss"
          value={formatRp(metrics.totalPnl)}
          sub={metrics.returnPct !== 0 ? `${metrics.returnPct >= 0 ? "+" : ""}${metrics.returnPct.toFixed(1)}%` : "Belum ada modal tercatat"}
          icon={metrics.totalPnl >= 0 ? TrendingUp : TrendingDown}
          tone={metrics.totalPnl >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}
        />
        <SummaryCard label="Modal Tercatat" value={formatRp(metrics.totalCost)} sub="Cost basis" icon={Wallet} tone="bg-slate-100 text-slate-600" />
        <SummaryCard label="Profil Risiko" value={metrics.riskScore} sub={metrics.riskProfile.profile} icon={Shield} tone="bg-violet-50 text-violet-600" />
        <SummaryCard
          label="Alokasi Dominan"
          value={metrics.topCategory ? metrics.topCategory.name : "—"}
          sub={metrics.topCategory ? `${metrics.topCategory.percent.toFixed(0)}%` : ""}
          icon={Layers}
          tone="bg-sky-50 text-sky-600"
        />
        <SummaryCard label="Simulasi 12 Bulan" value={formatRp(metrics.simulation.endValue)} sub={`Setor ${formatRp(metrics.suggestedMonthly)}/bln`} icon={Target} tone="bg-amber-50 text-amber-600" />
        <SummaryCard label="Estimasi Return" value={`${metrics.annualReturnEstimate}%`} sub="p.a (sesuai profil)" icon={Percent} tone="bg-indigo-50 text-indigo-600" />
        <SummaryCard label="Kekayaan Bersih" value={formatRp(metrics.netWorth)} sub="Saldo + tabungan + investasi" icon={TrendingUp} tone="bg-cyan-50 text-cyan-600" />
      </div>

      {/* Return / Risiko / Estimasi cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border border-emerald-100 bg-emerald-50/40">
          <p className="text-xs font-bold uppercase text-emerald-700">Return Portofolio</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">{metrics.returnPct >= 0 ? "+" : ""}{metrics.returnPct.toFixed(2)}%</p>
          <p className="text-sm text-slate-600 mt-2">P/L {formatRp(metrics.totalPnl)} dari modal {formatRp(metrics.totalCost)}.</p>
        </Card>
        <Card className="p-5 border border-violet-100 bg-violet-50/40">
          <p className="text-xs font-bold uppercase text-violet-700">Tingkat Risiko</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">{metrics.riskScore}</p>
          <p className="text-sm text-slate-600 mt-2 line-clamp-3">{metrics.riskProfile.desc || "Profil dari onboarding keuangan Anda."}</p>
        </Card>
        <Card className="p-5 border border-primary-100 bg-primary-50/40">
          <p className="text-xs font-bold uppercase text-primary-700">Estimasi Pertumbuhan</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">{formatRp(metrics.simulation.endValue)}</p>
          <p className="text-sm text-slate-600 mt-2">Proyeksi 12 bulan @ {metrics.annualReturnEstimate}% dengan setoran rutin.</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard title="Tren Perkembangan Aset" subtitle="Estimasi nilai portofolio (6 bulan)">
          <div className="h-52">
            {!metrics.hasPortfolio ? (
              <p className="text-sm text-slate-400 text-center py-16">Tambahkan posisi untuk melihat tren.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.growthTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <Tooltip formatter={(v) => formatRp(v)} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="value" name="Nilai portofolio" stroke="#2563eb" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="invested" name="Modal" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>

        <ChartCard title="Alokasi Portofolio" subtitle="Donut per jenis investasi">
          <div className="h-52">
            {metrics.allocationDonut.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-16">Belum ada alokasi.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={metrics.allocationDonut} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={76} paddingAngle={2}>
                    {metrics.allocationDonut.map((entry, index) => (
                      <Cell key={`${entry.name}-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatRp(v)} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>

        <ChartCard title="Perbandingan Instrumen" subtitle="Nilai pasar vs modal">
          <div className="h-52">
            {metrics.instrumentBar.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-16">Belum ada instrumen.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.instrumentBar} barGap={3}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <Tooltip formatter={(v, name, props) => [formatRp(v), props?.payload?.fullName || name]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="marketValue" name="Nilai pasar" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="costBasis" name="Modal" fill="#94a3b8" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>

        <ChartCard title="Simulasi Investasi Bulanan" subtitle="12 bulan ke depan">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.simulation.series}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(v) => formatRp(v)} />
                <Line type="monotone" dataKey="value" name="Proyeksi" stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Rekomendasi produk */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary-600" />
          Rekomendasi Instrumen
        </h2>
        <p className="text-sm text-slate-500">Disaring berdasarkan profil risiko {metrics.riskProfile.profile} dan tujuan keuangan Anda.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendations.length === 0 ? (
            <Card className="p-6 text-sm text-slate-500 sm:col-span-2 lg:col-span-4">Katalog produk sedang dimuat atau belum tersedia.</Card>
          ) : (
            recommendations.map((product) => (
              <Card key={product.id} className="p-4 hover:border-primary-200 transition-colors">
                <p className="text-[10px] font-bold uppercase text-slate-400">{product.categoryLabel}</p>
                <h3 className="font-bold text-slate-900 text-sm mt-1 truncate">{product.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{product.symbol}</p>
                <p className="text-xs text-slate-600 mt-2">
                  Risiko: {product.risk_level || "—"}
                  {product.return_1y != null ? ` • Return 1Y: ${Math.round(product.return_1y * 100)}%` : ""}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => navigate(`/investments/product/${product.id}`)}
                >
                  Lihat Produk
                </Button>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Kategori cepat */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Saham", icon: TrendingUp, path: CATEGORY_ROUTES.stock },
          { label: "Reksa Dana", icon: Layers, path: CATEGORY_ROUTES.mutual_fund },
          { label: "Obligasi", icon: Landmark, path: CATEGORY_ROUTES.bond },
          { label: "Emas", icon: Coins, path: CATEGORY_ROUTES.gold },
        ].map((cat) => (
          <button
            key={cat.path}
            type="button"
            onClick={() => navigate(cat.path)}
            className="p-4 rounded-2xl border border-slate-100 bg-white hover:border-primary-200 text-left transition-colors"
          >
            <cat.icon className="w-5 h-5 text-primary-600 mb-2" />
            <span className="font-semibold text-sm text-slate-900">{cat.label}</span>
            <span className="flex items-center gap-1 text-xs text-primary-600 mt-1">
              Katalog <ArrowRight className="w-3 h-3" />
            </span>
          </button>
        ))}
      </div>

      {/* Insight AI */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-600" />
          Insight AI — Portofolio Personal
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aiInsights.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className={`rounded-2xl border p-4 ${
                item.type === "alert"
                  ? "bg-rose-50/80 border-rose-100"
                  : item.type === "positive"
                    ? "bg-emerald-50/80 border-emerald-100"
                    : "bg-white border-slate-100 shadow-sm"
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{item.category || "analisis"}</p>
              <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">{item.description}</p>
              {item.action && (
                <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => handleInsightAction(item)}>
                  {item.action}
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
