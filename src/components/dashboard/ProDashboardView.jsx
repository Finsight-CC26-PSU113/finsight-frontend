import { useMemo } from "react";
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
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Sparkles,
  Activity,
  Calendar,
  Target,
  BarChart3,
  Percent,
  LineChart as LineChartIcon,
} from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { useAppContext } from "../../context/AppContext";
import { computeProDashboardMetrics, healthLabel } from "../../utils/proDashboardAnalytics";
import { formatCategoryLabel } from "../../utils/categoryUtils";

const PIE_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#64748b"];

const formatRp = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatPct = (value) => `${Number(value).toFixed(1)}%`;

const ChartCard = ({ title, subtitle, children, className = "" }) => (
  <Card className={`p-5 border border-slate-100 shadow-sm ring-1 ring-slate-100/80 ${className}`}>
    <h3 className="font-semibold text-slate-900">{title}</h3>
    {subtitle && <p className="text-xs text-slate-500 mt-0.5 mb-4">{subtitle}</p>}
    {!subtitle && <div className="mb-4" />}
    {children}
  </Card>
);

const SummaryCard = ({ label, value, sub, icon: Icon, tone }) => (
  <Card className="p-4 sm:p-5 h-full min-h-[130px] rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 ${tone}`}>
      <Icon className="w-5 h-5" />
    </div>
    <p className="text-xs font-medium text-slate-500 leading-tight">{label}</p>
    <p className="text-lg sm:text-xl font-bold text-slate-900 mt-1 break-words">{value}</p>
    {sub && <p className="text-[11px] text-slate-400 mt-1">{sub}</p>}
  </Card>
);

export const ProDashboardView = () => {
  const navigate = useNavigate();
  const ctx = useAppContext();

  const metrics = useMemo(
    () =>
      computeProDashboardMetrics({
        transactions: ctx.transactions,
        user: ctx.user,
        dashboardSummary: ctx.dashboardSummary,
        savingsGoals: ctx.savingsGoals,
        savingsAvailableBalance: ctx.savingsAvailableBalance,
        investments: ctx.investments,
        insights: ctx.insights,
      }),
    [ctx]
  );

  const health = healthLabel(metrics.healthScore);

  const recentTx = useMemo(
    () =>
      [...ctx.transactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 6),
    [ctx.transactions]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary-600">Dashboard Pro</p>
          <h2 className="text-2xl font-bold text-slate-900 mt-0.5">Analisis Keuangan Lanjutan</h2>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Tampilan untuk pengguna yang sudah familiar dengan manajemen keuangan — lebih banyak data, grafik, dan insight berbasis angka. Bukan fitur berbayar.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/transactions")}>
            Transaksi
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate("/budget")}>
            Anggaran
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate("/insights")}>
            Wawasan AI
          </Button>
        </div>
      </div>

      {/* Ringkasan atas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <SummaryCard label="Saldo Utama" value={formatRp(metrics.balance)} icon={Wallet} tone="bg-primary-50 text-primary-600" />
        <SummaryCard
          label="Cashflow Bersih"
          value={formatRp(metrics.netCashflow)}
          sub="Bulan ini"
          icon={metrics.netCashflow >= 0 ? TrendingUp : TrendingDown}
          tone={metrics.netCashflow >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}
        />
        <SummaryCard label="Rasio Tabungan" value={formatPct(metrics.savingsRatio)} sub="Dari pemasukan" icon={Percent} tone="bg-sky-50 text-sky-600" />
        <SummaryCard label="Rata-rata / Hari" value={formatRp(metrics.avgDailyExpense)} sub="Pengeluaran" icon={Calendar} tone="bg-amber-50 text-amber-600" />
        <SummaryCard label="Pemasukan" value={formatRp(metrics.income)} sub="Bulan ini" icon={TrendingUp} tone="bg-green-50 text-green-600" />
        <SummaryCard label="Pengeluaran" value={formatRp(metrics.expense)} sub="Bulan ini" icon={TrendingDown} tone="bg-red-50 text-red-500" />
        <SummaryCard
          label="Kategori Terbesar"
          value={metrics.topCategory ? metrics.topCategory.name : "—"}
          sub={metrics.topCategory ? formatRp(metrics.topCategory.amount) : "Belum ada data"}
          icon={BarChart3}
          tone="bg-indigo-50 text-indigo-600"
        />
        <SummaryCard label="Prediksi Akhir Bulan" value={formatRp(metrics.projectedEndBalance)} sub={`${metrics.daysLeft} hari lagi`} icon={LineChartIcon} tone="bg-violet-50 text-violet-600" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Charts utama */}
        <div className="xl:col-span-2 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Pemasukan vs Pengeluaran" subtitle="Perbandingan 6 bulan terakhir">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.incomeVsExpenseMonthly} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                    <Tooltip formatter={(v) => formatRp(v)} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="income" name="Pemasukan" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard title="Tren Saldo" subtitle="Perkembangan saldo utama (30 hari terakhir)">
              <div className="h-56">
                {metrics.balanceTrend.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-20">Data tren belum cukup.</p>
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
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Distribusi Pengeluaran" subtitle="Per kategori — bulan berjalan">
              <div className="h-56">
                {metrics.categoryDistribution.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-20">Belum ada pengeluaran.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={metrics.categoryDistribution} dataKey="amount" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                        {metrics.categoryDistribution.map((_, index) => (
                          <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v, name) => [formatRp(v), name]} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </ChartCard>

            <ChartCard title="Cashflow Bersih" subtitle="Pemasukan − pengeluaran per bulan">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.netCashflowTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                    <Tooltip formatter={(v) => formatRp(v)} />
                    <Area type="monotone" dataKey="net" name="Net cashflow" stroke="#0ea5e9" fill="#bae6fd" fillOpacity={0.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Utilisasi Anggaran" subtitle="Realisasi vs limit">
              <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                {metrics.budgetProgress.length === 0 ? (
                  <p className="text-sm text-slate-400">Belum ada anggaran aktif.</p>
                ) : (
                  metrics.budgetProgress.map((row) => (
                    <div key={row.name}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-700">{formatCategoryLabel(row.name)}</span>
                        <span className={row.pct >= 100 ? "text-red-600 font-semibold" : "text-slate-500"}>{row.pct.toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${row.pct >= 100 ? "bg-red-500" : row.pct >= 80 ? "bg-amber-500" : "bg-primary-500"}`}
                          style={{ width: `${Math.min(100, row.pct)}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Button variant="ghost" size="sm" className="mt-3" onClick={() => navigate("/budget")}>
                Kelola anggaran <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </ChartCard>

            <ChartCard title="Tujuan Tabungan" subtitle={`${ctx.savingsGoals.length} tujuan aktif`}>
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {ctx.savingsGoals.length === 0 ? (
                  <p className="text-sm text-slate-400">Belum ada tujuan.</p>
                ) : (
                  ctx.savingsGoals.slice(0, 4).map((goal) => {
                    const target = Number(goal.target_amount || 0);
                    const saved = Number(goal.saved_amount || 0);
                    const pct = target > 0 ? Math.min(100, (saved / target) * 100) : 0;
                    return (
                      <div key={goal.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="truncate text-slate-800">{goal.name}</span>
                          <span>{pct.toFixed(1)}%</span>
                        </div>
                        <p className="text-[11px] text-slate-500">{formatRp(saved)} / {formatRp(target)}</p>
                      </div>
                    );
                  })
                )}
              </div>
              <Button variant="ghost" size="sm" className="mt-3" onClick={() => navigate("/savings")}>
                Kelola tabungan <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </ChartCard>
          </div>

          <Card className="p-5 border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Transaksi Terbaru</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate("/transactions")}>
                Semua <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                    <th className="pb-2">Tanggal</th>
                    <th className="pb-2">Deskripsi</th>
                    <th className="pb-2">Kategori</th>
                    <th className="pb-2 text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTx.map((tx) => {
                    const credit = tx.type === "income" || tx.type === "savings_withdraw";
                    return (
                      <tr key={tx.id} className="border-b border-slate-50">
                        <td className="py-2 text-slate-600">{tx.date}</td>
                        <td className="py-2 text-slate-800 truncate max-w-[140px]">{tx.title}</td>
                        <td className="py-2 text-slate-500 capitalize">{tx.category}</td>
                        <td className={`py-2 text-right font-semibold ${credit ? "text-green-600" : "text-red-500"}`}>
                          {credit ? "+" : "-"}
                          {formatRp(Math.abs(tx.amount))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Panel insight kanan */}
        <div className="space-y-6">
          <Card className={`p-5 border ${health.tone}`}>
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5" />
              <h3 className="font-bold text-slate-900">Financial Health Score</h3>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-extrabold">{metrics.healthScore}</span>
              <span className="text-lg text-slate-500 mb-1">/ 100</span>
            </div>
            <p className="text-sm font-semibold mt-2">{health.label}</p>
            <div className="mt-3 h-2 bg-white/60 rounded-full overflow-hidden">
              <div className="h-full bg-primary-600 rounded-full transition-all" style={{ width: `${metrics.healthScore}%` }} />
            </div>
            <ul className="mt-4 space-y-2 text-xs text-slate-600">
              <li>Rasio tabungan: {formatPct(metrics.savingsRatio)}</li>
              <li>Cashflow: {formatRp(metrics.netCashflow)}</li>
              <li>Tabungan tujuan: {formatRp(metrics.totalSavings)}</li>
              <li>Investasi: {formatRp(metrics.portfolioValue)}</li>
            </ul>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-primary-50 to-white border border-primary-100">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Target className="w-4 h-4 text-primary-600" />
              Prediksi Akhir Bulan
            </h3>
            <p className="text-2xl font-bold text-slate-900 mt-2">{formatRp(metrics.projectedEndBalance)}</p>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Estimasi saldo utama dalam <strong>{metrics.daysLeft} hari</strong> lagi berdasarkan rata-rata pemasukan & pengeluaran harian bulan ini (
              {metrics.projectedEndDelta >= 0 ? "+" : ""}
              {formatRp(metrics.projectedEndDelta)} dari sekarang).
            </p>
          </Card>

          <Card className="p-5 border border-slate-100">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-ai" />
              Insight AI (berbasis angka)
            </h3>
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {metrics.numericInsights.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border text-xs leading-relaxed ${
                    item.type === "alert"
                      ? "bg-red-50/80 border-red-100"
                      : item.type === "positive"
                        ? "bg-emerald-50/80 border-emerald-100"
                        : item.type === "recommendation"
                          ? "bg-blue-50/80 border-blue-100"
                          : "bg-slate-50 border-slate-100"
                  }`}
                >
                  <p className="font-bold text-slate-900">{item.title}</p>
                  <p className="text-slate-600 mt-1">{item.description}</p>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => navigate("/insights")}>
              Lihat semua wawasan
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
