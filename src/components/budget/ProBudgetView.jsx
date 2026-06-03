import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
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
  Plus,
  Target,
  Wallet,
  Save,
  Edit2,
  Trash2,
  Car,
  Utensils,
  Clapperboard,
  Zap,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  TrendingDown,
  Percent,
  Calendar,
} from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { useAppContext } from "../../context/AppContext";
import { buildExpenseCategoryOptions, formatCategoryLabel, normalizeCategoryName } from "../../utils/categoryUtils";
import { getNextUnusedBudgetColor } from "../../utils/budgetColors";
import { formatRupiahInput, parseRupiahInput } from "../../utils/currencyInput";
import { buildBudgetAiInsights, computeProBudgetMetrics } from "../../utils/proBudgetAnalytics";

const formatRp = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(amount) || 0);

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

const getCategoryIcon = (category) => {
  switch (`${category || ""}`.toLowerCase()) {
    case "makanan":
      return <Utensils className="w-6 h-6 text-orange-500" />;
    case "transport":
    case "transportasi":
      return <Car className="w-6 h-6 text-red-500" />;
    case "hiburan":
      return <Clapperboard className="w-6 h-6 text-slate-700" />;
    case "tagihan":
      return <Zap className="w-6 h-6 text-yellow-500" />;
    default:
      return <Target className="w-6 h-6 text-primary-500" />;
  }
};

const statusStyles = {
  over: "bg-red-100 text-red-700 border-red-200",
  danger: "bg-red-100 text-red-700 border-red-200",
  warning: "bg-amber-100 text-amber-700 border-amber-200",
  safe: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const progressBarColor = {
  over: "bg-red-500",
  danger: "bg-red-500",
  warning: "bg-amber-500",
  safe: "bg-emerald-500",
};

export const ProBudgetView = () => {
  const {
    budgets,
    transactions,
    addBudget,
    updateBudget,
    deleteBudget,
    getBudgetSuggestions,
    applyBudgetSuggestion,
    applyAllBudgetSuggestions,
    user,
    categories,
    customCategories,
    dashboardSummary,
    insights,
  } = useAppContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBudget, setNewBudget] = useState({ categoryId: "", total: "" });
  const [editingBudget, setEditingBudget] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const categoryOptions = useMemo(() => buildExpenseCategoryOptions(categories, customCategories), [categories, customCategories]);

  useEffect(() => {
    if (!newBudget.categoryId && categoryOptions[0]?.id) {
      setNewBudget((prev) => ({ ...prev, categoryId: categoryOptions[0].id }));
    }
  }, [categoryOptions, newBudget.categoryId]);

  const currentMonthPrefix = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  const suggestionIncome = useMemo(() => {
    const fromDashboard = Number(user.monthlyIncome || 0);
    if (fromDashboard > 0) return fromDashboard;
    return transactions
      .filter((t) => t.type === "income" && String(t.date || "").startsWith(currentMonthPrefix))
      .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);
  }, [user.monthlyIncome, transactions, currentMonthPrefix]);

  const tabunganAmount = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "savings_deposit" && String(t.date || "").startsWith(currentMonthPrefix))
        .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0),
    [transactions, currentMonthPrefix]
  );

  const allocatableIncome = useMemo(() => Math.max(0, suggestionIncome - tabunganAmount), [suggestionIncome, tabunganAmount]);

  const budgetSuggestions = useMemo(
    () => getBudgetSuggestions(suggestionIncome, tabunganAmount),
    [getBudgetSuggestions, suggestionIncome, tabunganAmount]
  );

  const existingSuggestionCategories = useMemo(
    () => new Set(budgets.map((budget) => normalizeCategoryName(budget.category))),
    [budgets]
  );

  const pendingSuggestions = useMemo(
    () => budgetSuggestions.filter((s) => !existingSuggestionCategories.has(normalizeCategoryName(s.category))),
    [budgetSuggestions, existingSuggestionCategories]
  );

  const metrics = useMemo(
    () => computeProBudgetMetrics({ budgets, dashboardSummary, transactions }),
    [budgets, dashboardSummary, transactions]
  );

  const aiInsights = useMemo(
    () =>
      buildBudgetAiInsights({
        metrics,
        allocatableIncome,
        tabunganAmount,
        suggestionIncome,
        pendingSuggestions,
        insights,
      }),
    [metrics, allocatableIncome, tabunganAmount, suggestionIncome, pendingSuggestions, insights]
  );

  const openCreateBudgetModal = () => {
    setNewBudget((prev) => ({
      ...prev,
      categoryId: prev.categoryId || categoryOptions[0]?.id || "",
    }));
    setIsModalOpen(true);
  };

  const handleCreateBudget = async (e) => {
    e.preventDefault();
    if (!newBudget.total) return;
    try {
      const selectedCategory = categoryOptions.find((option) => option.id === newBudget.categoryId);
      if (!selectedCategory) {
        window.alert("Pilih kategori yang valid dari daftar.");
        return;
      }
      const totalAmount = parseRupiahInput(newBudget.total);
      if (totalAmount <= 0) {
        window.alert("Nominal anggaran harus lebih dari 0");
        return;
      }
      await addBudget({
        category_id: selectedCategory.id,
        category: selectedCategory.name,
        total: totalAmount,
        color: getNextUnusedBudgetColor(budgets),
      });
      setIsModalOpen(false);
      setNewBudget({ categoryId: categoryOptions[0]?.id || "", total: "" });
    } catch (error) {
      window.alert(error.message || "Gagal menyimpan anggaran");
    }
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setEditAmount(formatRupiahInput(budget.total));
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editAmount || !editingBudget) return;
    try {
      const nextAmount = parseRupiahInput(editAmount);
      if (nextAmount <= 0) {
        window.alert("Nominal anggaran harus lebih dari 0");
        return;
      }
      await updateBudget(editingBudget.id, nextAmount);
      setIsEditModalOpen(false);
      setEditingBudget(null);
      setEditAmount("");
    } catch (error) {
      window.alert(error.message || "Gagal memperbarui anggaran");
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus anggaran ini?")) return;
    try {
      await deleteBudget(budgetId);
    } catch (error) {
      window.alert(error.message || "Gagal menghapus anggaran");
    }
  };

  const isBudgetAlert = metrics.totalRemaining < 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary-600">Anggaran Pro</p>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">Analisis Anggaran Lanjutan</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Pantau budget vs realisasi, prediksi habisnya anggaran, dan rekomendasi penyesuaian — untuk pengguna yang sudah familiar mengatur keuangan. Bukan fitur berbayar.
          </p>
        </div>
        <Button onClick={openCreateBudgetModal} className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl">
          <Plus className="w-4 h-4" />
          Buat Anggaran
        </Button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Buat Anggaran Baru">
        <form onSubmit={handleCreateBudget} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
            <select
              value={newBudget.categoryId}
              onChange={(e) => setNewBudget({ ...newBudget, categoryId: e.target.value })}
              required
              disabled={categoryOptions.length === 0}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
            >
              {categoryOptions.length === 0 ? (
                <option value="">Kategori belum dimuat</option>
              ) : (
                categoryOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Batas Bulanan</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                required
                value={newBudget.total}
                onChange={(e) => setNewBudget({ ...newBudget, total: formatRupiahInput(e.target.value) })}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="0"
              />
            </div>
          </div>
          <Button type="submit" fullWidth className="mt-4 flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> Simpan Anggaran
          </Button>
        </form>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Anggaran">
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
            <input type="text" disabled value={editingBudget?.category || ""} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Batas Bulanan</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                required
                value={editAmount}
                onChange={(e) => setEditAmount(formatRupiahInput(e.target.value))}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" className="flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> Simpan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Ringkasan atas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <SummaryCard label="Total Anggaran" value={formatRp(metrics.totalBudget)} sub="Bulan ini" icon={Target} tone="bg-primary-50 text-primary-600" />
        <SummaryCard label="Realisasi" value={formatRp(metrics.totalSpent)} sub={`${metrics.overallUsagePct.toFixed(1)}% terpakai`} icon={Wallet} tone="bg-slate-100 text-slate-600" />
        <SummaryCard
          label="Sisa Anggaran"
          value={isBudgetAlert ? `-${formatRp(Math.abs(metrics.totalRemaining))}` : formatRp(metrics.totalRemaining)}
          sub={isBudgetAlert ? "Perlu penyesuaian" : "Masih tersedia"}
          icon={isBudgetAlert ? AlertTriangle : ShieldCheck}
          tone={isBudgetAlert ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}
        />
        <SummaryCard label="Pemakaian" value={`${metrics.overallUsagePct.toFixed(1)}%`} sub="Dari total budget" icon={Percent} tone="bg-violet-50 text-violet-600" />
        <SummaryCard
          label="Prediksi Habis"
          value={metrics.daysUntilTotalEmpty === null ? "—" : metrics.daysUntilTotalEmpty === 0 ? "Sudah habis" : `~${metrics.daysUntilTotalEmpty} hari`}
          sub="Seluruh anggaran"
          icon={Calendar}
          tone="bg-amber-50 text-amber-600"
        />
        <SummaryCard label="Melebihi Batas" value={String(metrics.overBudget.length)} sub="Kategori" icon={AlertTriangle} tone="bg-rose-50 text-rose-600" />
        <SummaryCard label="Masih Aman" value={String(metrics.safeCategories.length)} sub="Kategori < 70%" icon={ShieldCheck} tone="bg-sky-50 text-sky-600" />
        <SummaryCard label="Perlu Waspada" value={String(metrics.atRisk.length)} sub="70–100% terpakai" icon={TrendingDown} tone="bg-orange-50 text-orange-600" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard title="Budget vs Realisasi" subtitle="Per kategori — bulan berjalan">
          <div className="h-56">
            {metrics.budgetVsActual.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-16">Buat anggaran per kategori untuk melihat perbandingan.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.budgetVsActual} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <Tooltip formatter={(v) => formatRp(v)} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="budget" name="Anggaran" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="actual" name="Realisasi" fill="#ef4444" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>

        <ChartCard title="Distribusi Anggaran" subtitle="Donut alokasi per kategori">
          <div className="h-56">
            {metrics.allocationDonut.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-16">Belum ada alokasi anggaran.</p>
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

        <ChartCard title="Tren Pemakaian Anggaran" subtitle="Kumulatif pengeluaran vs pace ideal">
          <div className="h-56">
            {metrics.usageTrend.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-16">Belum ada transaksi pengeluaran bulan ini.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.usageTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <Tooltip formatter={(v) => formatRp(v)} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="cumulative" name="Pengeluaran kumulatif" stroke="#ef4444" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="idealPace" name="Pace ideal budget" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>
      </div>

      {/* Daftar kategori */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">Kategori Anggaran</h2>
        <Card className="p-0 overflow-hidden border border-slate-100 shadow-sm">
          {metrics.rows.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">Belum ada anggaran. Buat anggaran pertama untuk mulai menganalisis.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {metrics.rows.map((row, index) => (
                <motion.div
                  key={row.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="p-4 sm:p-6 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0">{getCategoryIcon(row.category)}</div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-900 capitalize">{row.displayCategory}</h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusStyles[row.status]}`}>{row.statusLabel}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Budget {formatRp(row.total)} · Realisasi {formatRp(row.spent)} · Sisa {formatRp(Math.max(0, row.remaining))}
                        </p>
                        <p className="text-xs text-slate-400 mt-1 italic">
                          {row.usagePct >= 100
                            ? "Anggaran kategori ini sudah habis atau melebihi batas."
                            : row.daysUntilEmpty !== null
                              ? `Estimasi habis dalam ~${row.daysUntilEmpty} hari jika pola tetap.`
                              : "Belum ada pengeluaran tercatat."}
                        </p>
                      </div>
                    </div>
                    <div className="lg:w-64 shrink-0">
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-600">{row.usagePct.toFixed(0)}%</span>
                        <span className="text-slate-500">{formatRp(row.spent)}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div className={`h-full rounded-full ${progressBarColor[row.status]}`} style={{ width: `${Math.min(row.usagePct, 100)}%` }} />
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button type="button" onClick={() => handleEditBudget(row)} className="p-2 text-slate-400 hover:text-primary-600 rounded-lg hover:bg-primary-50">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => handleDeleteBudget(row.id)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {pendingSuggestions.length > 0 && (
        <Card className="p-5 border border-primary-100 bg-primary-50/30">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <div>
              <h3 className="font-semibold text-slate-900">Saran Penyesuaian Anggaran</h3>
              <p className="text-xs text-slate-500 mt-0.5">% × (pemasukan − tabungan) = {formatRp(allocatableIncome)}</p>
            </div>
            <Button size="sm" disabled={allocatableIncome <= 0} onClick={() => applyAllBudgetSuggestions(suggestionIncome, tabunganAmount)}>
              Terapkan Semua
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {pendingSuggestions.slice(0, 4).map((s) => (
              <div key={s.category} className="flex items-center justify-between gap-2 bg-white rounded-xl px-3 py-2 border border-slate-100 text-sm">
                <span className="font-medium">{formatCategoryLabel(s.category)}</span>
                <Button size="sm" variant="outline" disabled={s.amount <= 0} onClick={() => applyBudgetSuggestion(s.category, s.amount)}>
                  {formatRp(s.amount)}
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Insight AI */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-600" />
          Insight AI — Efektivitas Budget
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
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                {item.type === "alert" ? "Perhatian" : item.type === "positive" ? "Positif" : "Rekomendasi"}
              </p>
              <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
