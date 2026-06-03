import { useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
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
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Target,
  TrendingUp,
  ShieldAlert,
  Activity,
  Wallet,
  Percent,
  Flag,
} from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { useAppContext } from "../../context/AppContext";
import { computeProInsightsMetrics } from "../../utils/proInsightsAnalytics";
import { navigateFromInsightAction } from "../../utils/insightNavigation";

const formatRp = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);

const ChartCard = ({ title, subtitle, children, className = "" }) => (
  <Card className={`p-5 border border-slate-100 shadow-sm ring-1 ring-slate-100/80 h-full ${className}`}>
    <h3 className="font-semibold text-slate-900 text-sm">{title}</h3>
    {subtitle && <p className="text-xs text-slate-500 mt-0.5 mb-3">{subtitle}</p>}
    {!subtitle && <div className="mb-3" />}
    {children}
  </Card>
);

const SummaryCard = ({ label, value, sub, icon: Icon, tone }) => (
  <Card className="p-4 sm:p-5 min-h-[110px] rounded-3xl border border-slate-100 shadow-sm">
    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-2 ${tone}`}>
      <Icon className="w-5 h-5" />
    </div>
    <p className="text-xs font-medium text-slate-500">{label}</p>
    <p className="text-base sm:text-lg font-bold text-slate-900 mt-0.5 break-words">{value}</p>
    {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
  </Card>
);

const getIcon = (type) => {
  switch (type) {
    case "alert":
      return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
    case "recommendation":
      return <Lightbulb className="w-5 h-5 text-primary-600 shrink-0" />;
    case "positive":
      return <Target className="w-5 h-5 text-emerald-500 shrink-0" />;
    case "anomaly":
      return <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />;
    default:
      return <Sparkles className="w-5 h-5 text-primary-500 shrink-0" />;
  }
};

const InsightDetailCard = ({ insight, index, onAction }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.03 }}
    className={`rounded-2xl border p-4 ${
      insight.type === "alert"
        ? "bg-rose-50/60 border-rose-100"
        : insight.type === "positive"
          ? "bg-emerald-50/60 border-emerald-100"
          : "bg-white border-slate-100 shadow-sm"
    }`}
  >
    <div className="flex gap-3">
      {getIcon(insight.type)}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h3 className="font-bold text-slate-900 text-sm">{insight.title}</h3>
          {insight.category && (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {insight.category}
            </span>
          )}
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{insight.description}</p>
        {insight.metric != null && typeof insight.metric === "number" && insight.metric > 1000 && (
          <p className="text-xs font-semibold text-primary-700 mt-2">{formatRp(insight.metric)}</p>
        )}
        {insight.action && (
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => onAction(insight)}>
            {insight.action}
          </Button>
        )}
      </div>
    </div>
  </motion.div>
);

export const ProInsightsView = () => {
  const navigate = useNavigate();
  const ctx = useAppContext();

  const metrics = useMemo(
    () =>
      computeProInsightsMetrics({
        transactions: ctx.transactions,
        user: ctx.user,
        dashboardSummary: ctx.dashboardSummary,
        savingsGoals: ctx.savingsGoals,
        savingsAvailableBalance: ctx.savingsAvailableBalance,
        savingsInsights: ctx.savingsInsights,
        investments: ctx.investments,
        insights: ctx.insights,
        budgets: ctx.budgets,
      }),
    [ctx]
  );

  const handleInsightAction = (insight) => {
    navigateFromInsightAction(insight, navigate);
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-ai-dark to-primary-600 p-5 sm:p-6 md:p-8 rounded-3xl text-white shadow-xl shadow-ai/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-100 mb-1">Wawasan AI Pro</p>
          <div className="flex items-center gap-2 text-ai-light mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-bold tracking-wider uppercase">FINSIGHT AI</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Kecerdasan Keuangan Lanjutan</h1>
          <p className="text-primary-100 max-w-2xl text-sm md:text-base">
            Analisis mendalam dari transaksi, anggaran, tabungan, dan investasi — bukan fitur berbayar, melainkan mode untuk pengguna yang membutuhkan insight berbasis angka.
          </p>
        </div>
        <Card className={`p-4 border-none shadow-lg shrink-0 ${metrics.health.tone}`}>
          <p className="text-xs font-bold uppercase text-slate-600">Health Score</p>
          <p className="text-3xl font-black text-slate-900">{metrics.healthScore}</p>
          <p className="text-sm font-semibold mt-1">{metrics.health.label}</p>
        </Card>
      </div>

      {/* Ringkasan atas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <SummaryCard label="Saldo Utama" value={formatRp(metrics.balance)} sub="Saat ini" icon={Wallet} tone="bg-primary-50 text-primary-600" />
        <SummaryCard
          label="Cashflow Bersih"
          value={formatRp(metrics.netCashflow)}
          sub="Bulan ini"
          icon={metrics.netCashflow >= 0 ? TrendingUp : AlertTriangle}
          tone={metrics.netCashflow >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}
        />
        <SummaryCard label="Prediksi Akhir Bulan" value={formatRp(metrics.projectedEndBalance)} sub={`${metrics.daysLeft} hari lagi`} icon={Activity} tone="bg-violet-50 text-violet-600" />
        <SummaryCard label="Rasio Tabungan" value={`${metrics.savingsRatio.toFixed(1)}%`} sub="Dari pemasukan" icon={Percent} tone="bg-sky-50 text-sky-600" />
        <SummaryCard label="Kekayaan Bersih" value={formatRp(metrics.netWorth)} sub="Saldo + tabungan + investasi" icon={Target} tone="bg-indigo-50 text-indigo-600" />
        <SummaryCard
          label="Anomali"
          value={String(metrics.anomalies.length)}
          sub={metrics.anomalies.length > 0 ? "Perlu ditinjau" : "Tidak terdeteksi"}
          icon={ShieldAlert}
          tone={metrics.anomalies.length > 0 ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600"}
        />
        <SummaryCard
          label="Lonjakan Pengeluaran"
          value={metrics.expenseIncreasePct > 0 ? `+${metrics.expenseIncreasePct.toFixed(0)}%` : `${metrics.expenseIncreasePct.toFixed(0)}%`}
          sub="vs bulan lalu"
          icon={metrics.expenseIncreasePct > 15 ? AlertTriangle : TrendingUp}
          tone={metrics.expenseIncreasePct > 15 ? "bg-orange-50 text-orange-600" : "bg-slate-100 text-slate-600"}
        />
        <SummaryCard
          label="Kategori Terboros"
          value={metrics.topCategory ? metrics.topCategory.name : "—"}
          sub={metrics.topCategory ? formatRp(metrics.topCategory.amount) : "Belum ada data"}
          icon={Flag}
          tone="bg-red-50 text-red-500"
        />
      </div>

      {/* Prioritas */}
      {metrics.priorities.length > 0 && (
        <Card className="p-5 border border-primary-100 bg-primary-50/40">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
            <Flag className="w-4 h-4 text-primary-600" />
            Prioritas Keuangan Saat Ini
          </h2>
          <ol className="space-y-2">
            {metrics.priorities.map((p) => (
              <li key={p.rank} className="flex items-start gap-3 text-sm">
                <span className="w-6 h-6 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center shrink-0">{p.rank}</span>
                <div>
                  <span className="font-semibold text-slate-900">{p.label}</span>
                  <span className="text-slate-500"> — {p.detail}</span>
                  <span
                    className={`ml-2 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      p.urgency === "tinggi" ? "bg-red-100 text-red-700" : p.urgency === "sedang" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {p.urgency}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      )}

      {/* Grafik analisis */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard title="Tren Keuangan" subtitle="Pemasukan, pengeluaran & net (6 bulan)">
          <div className="h-52">
            {metrics.incomeVsExpenseMonthly.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-16">Data belum cukup.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.incomeVsExpenseMonthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <Tooltip formatter={(v) => formatRp(v)} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="income" name="Pemasukan" stroke="#22c55e" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="expense" name="Pengeluaran" stroke="#ef4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>

        <ChartCard title="Tren Saldo Utama" subtitle="30 hari terakhir">
          <div className="h-52">
            {metrics.balanceTrend.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-16">Belum ada tren saldo.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.balanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <Tooltip formatter={(v) => formatRp(v)} />
                  <Line type="monotone" dataKey="balance" name="Saldo" stroke="#2563eb" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>

        <ChartCard title="Distribusi Pengeluaran" subtitle="Donut bulan berjalan">
          <div className="h-52">
            {metrics.donutData.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-16">Belum ada pengeluaran.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={metrics.donutData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={76} paddingAngle={2}>
                    {metrics.donutData.map((entry, index) => (
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

        <ChartCard title="Perbandingan Kategori" subtitle="Pengeluaran per kategori">
          <div className="h-52">
            {metrics.categoryBar.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-16">Belum ada data kategori.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.categoryBar} layout="vertical" margin={{ left: 4, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <YAxis type="category" dataKey="name" width={88} tick={{ fontSize: 9 }} />
                  <Tooltip formatter={(v) => formatRp(v)} />
                  <Bar dataKey="amount" name="Pengeluaran" radius={[0, 4, 4, 0]}>
                    {metrics.categoryBar.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>

        <ChartCard title="Cashflow Bersih" subtitle="Net per bulan" className="xl:col-span-2">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.netCashflowTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(v) => formatRp(v)} />
                <Area type="monotone" dataKey="net" name="Net" stroke="#0ea5e9" fill="#bae6fd" fillOpacity={0.45} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Insight detail bawah */}
      <div className="space-y-8">
        {metrics.alerts.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              Peringatan & Anomali
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metrics.alerts.map((item, index) => (
                <InsightDetailCard key={item.id} insight={item} index={index} onAction={handleInsightAction} />
              ))}
            </div>
          </section>
        )}

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary-600" />
            Rekomendasi & Analisis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.recommendations.length > 0 ? (
              metrics.recommendations.map((item, index) => (
                <InsightDetailCard key={item.id} insight={item} index={index} onAction={handleInsightAction} />
              ))
            ) : (
              <Card className="p-6 text-sm text-slate-500 md:col-span-2">Belum ada rekomendasi. Tambahkan transaksi dan anggaran untuk analisis yang lebih kaya.</Card>
            )}
          </div>
        </section>

        {metrics.positives.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-500" />
              Hal Positif
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metrics.positives.map((item, index) => (
                <InsightDetailCard key={item.id} insight={item} index={index} onAction={handleInsightAction} />
              ))}
            </div>
          </section>
        )}

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-ai" />
            Semua Insight Detail
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.mergedInsights.map((item, index) => (
              <InsightDetailCard key={`all-${item.id}`} insight={item} index={index} onAction={handleInsightAction} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
