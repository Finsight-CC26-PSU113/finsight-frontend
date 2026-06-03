import { useMemo, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Search,
  Plus,
  Trash2,
  Edit3,
  UploadCloud,
  SlidersHorizontal,
  Calendar,
  Sparkles,
  Check,
  Loader2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  BarChart3,
  TrendingUp,
  Filter,
} from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { useAppContext } from "../../context/AppContext";
import { apiRequest } from "../../utils/apiClient";
import {
  RECEIPT_IMAGE_ACCEPT,
  buildTransactionFromScan,
  formatDateHeader,
  getCategoryStyles,
  getPaymentMethod,
  getTime,
  getUniqueMonths,
  isAllowedReceiptImageFile,
  preprocessReceiptImage,
} from "../../utils/transactionPage";
import { EXPENSE_FILTER_CATEGORIES, formatCategoryLabel } from "../../utils/categoryUtils";
import { formatRupiahInput, parseRupiahInput } from "../../utils/currencyInput";
import {
  PAYMENT_METHOD_OPTIONS,
  buildTransactionAiInsights,
  computeProTransactionMetrics,
  filterProTransactions,
  formatPaymentMethodLabel,
  sortTransactions,
} from "../../utils/proTransactionAnalytics";

const PIE_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#64748b"];

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
  <Card className="p-4 sm:p-5 min-h-[120px] rounded-3xl border border-slate-100 shadow-sm">
    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-2 ${tone}`}>
      <Icon className="w-5 h-5" />
    </div>
    <p className="text-xs font-medium text-slate-500">{label}</p>
    <p className="text-base sm:text-lg font-bold text-slate-900 mt-0.5 break-words">{value}</p>
    {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
  </Card>
);

export const ProTransactionView = () => {
  const {
    transactions,
    deleteTransaction,
    openAddTxModal,
    openEditTxModal,
    globalSearchTerm,
    setGlobalSearchTerm,
    addTransaction,
    authToken,
    refreshTransactions,
    insights,
  } = useAppContext();

  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [amountMinInput, setAmountMinInput] = useState("");
  const [amountMaxInput, setAmountMaxInput] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [chartMode, setChartMode] = useState("daily");
  const [showFilters, setShowFilters] = useState(true);

  const [isScanningReceipt, setIsScanningReceipt] = useState(false);
  const [scanStatus, setScanStatus] = useState({ state: "idle", message: "" });
  const scanInputRef = useRef(null);
  const scanStatusTimerRef = useRef(null);

  const [txToDelete, setTxToDelete] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const amountMin = amountMinInput ? parseRupiahInput(amountMinInput) : null;
  const amountMax = amountMaxInput ? parseRupiahInput(amountMaxInput) : null;

  const filters = useMemo(
    () => ({
      search: globalSearchTerm,
      typeFilter,
      category: selectedCategory,
      month: selectedMonth,
      dateFrom,
      dateTo,
      paymentMethod,
      amountMin,
      amountMax,
    }),
    [globalSearchTerm, typeFilter, selectedCategory, selectedMonth, dateFrom, dateTo, paymentMethod, amountMin, amountMax]
  );

  const filteredList = useMemo(
    () => sortTransactions(filterProTransactions(transactions, filters), sortBy),
    [transactions, filters, sortBy]
  );

  const metrics = useMemo(
    () => computeProTransactionMetrics(filteredList, transactions),
    [filteredList, transactions]
  );

  const aiInsights = useMemo(
    () => buildTransactionAiInsights({ ...metrics, dailySeries: metrics.dailySeries }, insights),
    [metrics, insights]
  );

  const groupedTransactions = useMemo(() => {
    return filteredList.reduce((groups, tx) => {
      const date = tx.date;
      if (!groups[date]) groups[date] = [];
      groups[date].push(tx);
      return groups;
    }, {});
  }, [filteredList]);

  const chartData = chartMode === "daily" ? metrics.dailySeries : metrics.weeklySeries;
  const chartExpenseKey = "expense";
  const chartIncomeKey = "income";

  const showScanStatus = (state, message, duration = 0) => {
    if (scanStatusTimerRef.current) {
      window.clearTimeout(scanStatusTimerRef.current);
      scanStatusTimerRef.current = null;
    }
    setScanStatus({ state, message });
    if (duration > 0) {
      scanStatusTimerRef.current = window.setTimeout(() => {
        setScanStatus((current) => (current.state === state ? { state: "idle", message: "" } : current));
        scanStatusTimerRef.current = null;
      }, duration);
    }
  };

  const handleConfirmDelete = () => {
    if (txToDelete) {
      deleteTransaction(txToDelete.id);
      setToastMessage(`Transaksi "${txToDelete.title}" berhasil dihapus!`);
      setShowSuccessToast(true);
      setTxToDelete(null);
      setTimeout(() => setShowSuccessToast(false), 3000);
    }
  };

  const handleScanFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!isAllowedReceiptImageFile(file)) {
      showScanStatus("error", "Hanya file PNG, JPG, atau JPEG yang bisa diproses.", 2400);
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      showScanStatus("error", "Ukuran gambar terlalu besar.", 2600);
      return;
    }
    if (!authToken) {
      showScanStatus("error", "Silakan masuk untuk memindai struk.", 2800);
      return;
    }
    try {
      setIsScanningReceipt(true);
      showScanStatus("loading", "Memproses struk...");
      const formData = new FormData();
      formData.append("image", await preprocessReceiptImage(file));
      const payload = await apiRequest("/api/scan", { method: "POST", token: authToken, body: formData });
      const scan = payload?.data?.scan || payload?.scan || payload;
      const transactionFromScan = buildTransactionFromScan(scan);
      if (!transactionFromScan) {
        showScanStatus("error", "Total struk belum terbaca.", 2800);
        return;
      }
      await addTransaction(transactionFromScan);
      showScanStatus("success", "Struk berhasil diproses dan disimpan.", 2200);
    } catch (err) {
      console.error("Scan upload failed", err);
      showScanStatus("error", "Gambar tidak dapat diproses saat ini.", 2800);
    } finally {
      setIsScanningReceipt(false);
      e.target.value = "";
    }
  };

  useEffect(() => {
    if (authToken && transactions.length === 0) {
      refreshTransactions().catch(() => {});
    }
  }, [authToken, transactions.length, refreshTransactions]);

  const resetFilters = () => {
    setTypeFilter("all");
    setSelectedCategory("all");
    setSelectedMonth("all");
    setDateFrom("");
    setDateTo("");
    setPaymentMethod("all");
    setAmountMinInput("");
    setAmountMaxInput("");
    setGlobalSearchTerm("");
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {scanStatus.state !== "idle" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm px-4">
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }} className={`w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl border ${scanStatus.state === "success" ? "border-emerald-200" : scanStatus.state === "error" ? "border-rose-200" : "border-slate-100"}`}>
              <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${scanStatus.state === "success" ? "bg-emerald-50 text-emerald-600" : scanStatus.state === "error" ? "bg-rose-50 text-rose-600" : "bg-primary-50 text-primary-600"}`}>
                {scanStatus.state === "loading" && <Loader2 className="h-7 w-7 animate-spin" />}
                {scanStatus.state === "success" && <Check className="h-7 w-7" />}
                {scanStatus.state === "error" && <AlertCircle className="h-7 w-7" />}
              </div>
              <h3 className="text-lg font-bold text-slate-900">{scanStatus.state === "loading" ? "Memproses struk" : scanStatus.state === "success" ? "Berhasil" : "Gagal"}</h3>
              <p className="mt-2 text-sm text-slate-500">{scanStatus.message}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary-600">Transaksi Pro</p>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">Analisis Transaksi Lanjutan</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Tampilan mendalam untuk pengguna yang sudah terbiasa mengelola keuangan — grafik, filter lanjutan, dan insight pola transaksi. Bukan fitur berbayar.
          </p>
        </div>
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <input ref={scanInputRef} type="file" accept={RECEIPT_IMAGE_ACCEPT} className="hidden" onChange={handleScanFileChange} />
          <Button type="button" variant="outline" className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl" onClick={() => scanInputRef.current?.click()} disabled={isScanningReceipt}>
            <UploadCloud className="w-4 h-4" />
            Pindai Struk
          </Button>
          <Button onClick={openAddTxModal} className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl" disabled={isScanningReceipt}>
            <Plus className="w-4 h-4" />
            Tambah Transaksi
          </Button>
        </div>
      </div>

      {/* Ringkasan atas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <SummaryCard label="Pemasukan" value={formatRp(metrics.income)} sub={`${metrics.typeBreakdown.income} transaksi`} icon={ArrowUpRight} tone="bg-emerald-50 text-emerald-600" />
        <SummaryCard label="Pengeluaran" value={formatRp(metrics.expense)} sub={`${metrics.typeBreakdown.expense} transaksi`} icon={ArrowDownRight} tone="bg-rose-50 text-rose-600" />
        <SummaryCard label="Selisih Bersih" value={formatRp(metrics.net)} sub="Periode terfilter" icon={Activity} tone={metrics.net >= 0 ? "bg-sky-50 text-sky-600" : "bg-amber-50 text-amber-600"} />
        <SummaryCard label="Rata-rata / Hari" value={formatRp(metrics.avgDailyExpense)} sub="Pengeluaran aktif" icon={TrendingUp} tone="bg-violet-50 text-violet-600" />
        <SummaryCard label="Total Transaksi" value={String(metrics.txCount)} sub="Sesuai filter" icon={BarChart3} tone="bg-slate-100 text-slate-600" />
        <SummaryCard
          label="Kategori Terbesar"
          value={metrics.topCategory ? metrics.topCategory.name : "—"}
          sub={metrics.topCategory ? formatRp(metrics.topCategory.amount) : "Belum ada"}
          icon={Filter}
          tone="bg-indigo-50 text-indigo-600"
        />
        <SummaryCard label="Tabungan" value={String(metrics.typeBreakdown.savings)} sub="Setoran & penarikan" icon={Sparkles} tone="bg-cyan-50 text-cyan-600" />
        <SummaryCard
          label="Kategori Terbanyak"
          value={metrics.categoryRows[0] ? `${metrics.categoryRows[0].count} tx` : "—"}
          sub={metrics.categoryRows[0]?.name || ""}
          icon={BarChart3}
          tone="bg-primary-50 text-primary-600"
        />
      </div>

      {/* Filter + charts */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari judul atau kategori..."
              value={globalSearchTerm}
              onChange={(e) => setGlobalSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-2.5 w-full border border-slate-200 bg-white rounded-full text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-slate-100 p-1 rounded-full flex items-center border border-slate-200/50 text-xs font-semibold">
              {["all", "income", "expense", "savings"].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTypeFilter(key)}
                  className={`px-3 py-1.5 rounded-full transition-all ${typeFilter === key ? "bg-primary-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                >
                  {key === "all" ? "Semua" : key === "income" ? "Masuk" : key === "expense" ? "Keluar" : "Tabungan"}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`h-10 w-10 rounded-full border flex items-center justify-center ${showFilters ? "border-primary-500 text-primary-600 ring-2 ring-primary-100" : "border-slate-200 text-slate-600"}`}
              title="Filter lanjutan"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showFilters && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-white border border-slate-200/60 rounded-3xl shadow-sm">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Bulan</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700">
                  <option value="all">Semua waktu</option>
                  {getUniqueMonths(transactions).map((m) => (
                    <option key={m.val} value={m.val}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Dari tanggal</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Sampai tanggal</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Kategori</label>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold capitalize">
                <option value="all">Semua kategori</option>
                {EXPENSE_FILTER_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {formatCategoryLabel(c)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Metode pembayaran</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold">
                {PAYMENT_METHOD_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Nominal min</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Rp 0"
                value={amountMinInput}
                onChange={(e) => setAmountMinInput(formatRupiahInput(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Nominal max</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Rp 0"
                value={amountMaxInput}
                onChange={(e) => setAmountMaxInput(formatRupiahInput(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Urutkan</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold">
                <option value="date-desc">Tanggal terbaru</option>
                <option value="date-asc">Tanggal terlama</option>
                <option value="amount-desc">Nominal terbesar</option>
                <option value="amount-asc">Nominal terkecil</option>
              </select>
            </div>
            <div className="flex items-end">
              <button type="button" onClick={resetFilters} className="w-full py-2 text-sm font-semibold text-primary-600 hover:bg-primary-50 rounded-xl border border-primary-100">
                Reset filter
              </button>
            </div>
          </motion.div>
        )}

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-slate-500">Grafik aktivitas:</span>
          <button type="button" onClick={() => setChartMode("daily")} className={`px-3 py-1 rounded-full ${chartMode === "daily" ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-600"}`}>
            Harian (14 hari)
          </button>
          <button type="button" onClick={() => setChartMode("weekly")} className={`px-3 py-1 rounded-full ${chartMode === "weekly" ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-600"}`}>
            Mingguan (8 minggu)
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <ChartCard title={chartMode === "daily" ? "Aktivitas Harian" : "Aktivitas Mingguan"} subtitle="Pemasukan vs pengeluaran">
            <div className="h-52">
              {chartData.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-16">Belum ada data untuk grafik.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barGap={3}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                    <Tooltip formatter={(v) => formatRp(v)} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey={chartIncomeKey} name="Pemasukan" fill="#22c55e" radius={[3, 3, 0, 0]} />
                    <Bar dataKey={chartExpenseKey} name="Pengeluaran" fill="#ef4444" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </ChartCard>

          <ChartCard title="Tren Net Harian" subtitle="Selisih pemasukan − pengeluaran (14 hari)">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.dailySeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <Tooltip formatter={(v) => formatRp(v)} />
                  <Area type="monotone" dataKey="net" name="Net" stroke="#2563eb" fill="#93c5fd" fillOpacity={0.35} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Perbandingan per Periode" subtitle="6 bulan terakhir (semua data)">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.periodComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <Tooltip formatter={(v) => formatRp(v)} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="income" name="Pemasukan" stroke="#22c55e" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="expense" name="Pengeluaran" stroke="#ef4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Distribusi Kategori" subtitle="Donut pengeluaran terfilter">
            <div className="h-52">
              {metrics.categoryDistribution.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-16">Belum ada pengeluaran.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={metrics.categoryDistribution} dataKey="amount" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={2}>
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
        </div>

        {metrics.categoryRows.length > 0 && (
          <ChartCard title="Total per Kategori" subtitle="Jumlah transaksi & nominal">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.categoryRows.slice(0, 7)} layout="vertical" margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => formatRp(v)} />
                  <Bar dataKey="amount" name="Nominal" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        )}
      </div>

      {/* Daftar transaksi */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Daftar Transaksi</h2>
        {Object.keys(groupedTransactions).length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-white border border-slate-100 rounded-3xl">Tidak ada transaksi yang cocok dengan filter.</div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedTransactions).map(([dateStr, txs]) => (
              <div key={dateStr} className="space-y-3">
                <h3 className="text-xs md:text-sm font-bold text-slate-800 px-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                  {formatDateHeader(dateStr)}
                </h3>
                <div className="space-y-3">
                  {txs.map((tx, index) => {
                    const catStyles = getCategoryStyles(tx.category);
                    const CatIcon = catStyles.icon;
                    const isIncome = tx.type === "income" || tx.type === "savings_withdraw";
                    const isSavingsTx = tx.type === "savings_deposit" || tx.type === "savings_withdraw";
                    const payLabel = tx.paymentMethod ? formatPaymentMethodLabel(tx.paymentMethod) : getPaymentMethod(tx);

                    return (
                      <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${catStyles.iconBg}`}>
                            <CatIcon className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-slate-800 truncate">{tx.title}</h4>
                            <p className="text-[11px] text-slate-400 mt-1">
                              {payLabel} • {getTime(tx)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <div className="text-left sm:text-right">
                            <p className={`font-bold ${isIncome ? "text-green-600" : "text-red-500"}`}>
                              {isIncome ? "+ " : "- "}Rp {Math.abs(tx.amount).toLocaleString("id-ID")}
                            </p>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${catStyles.bg} mt-1`}>{catStyles.label}</span>
                          </div>
                          <div className="flex gap-2">
                            {!isSavingsTx && (
                              <button type="button" onClick={() => openEditTxModal(tx)} className="p-2 rounded-full text-primary-600 hover:bg-primary-50" aria-label="Edit">
                                <Edit3 className="w-4 h-4" />
                              </button>
                            )}
                            <button type="button" onClick={() => setTxToDelete(tx)} className="p-2 rounded-full text-rose-600 hover:bg-rose-50" aria-label="Hapus">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Insight AI */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-600" />
          Insight AI — Pola Transaksi
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aiInsights.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-2xl border p-4 ${
                item.type === "alert"
                  ? "bg-rose-50/80 border-rose-100"
                  : item.type === "positive"
                    ? "bg-emerald-50/80 border-emerald-100"
                    : "bg-white border-slate-100 shadow-sm"
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{item.type === "alert" ? "Perhatian" : item.type === "positive" ? "Positif" : "Analisis"}</p>
              <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <Modal isOpen={txToDelete !== null} onClose={() => setTxToDelete(null)} title="Konfirmasi Hapus">
        <div className="space-y-4">
          <p className="text-slate-600 text-sm">
            Hapus transaksi <strong>{txToDelete?.title}</strong> senilai <strong>Rp {Math.abs(txToDelete?.amount || 0).toLocaleString("id-ID")}</strong>?
          </p>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setTxToDelete(null)} className="rounded-xl py-2 px-4 border border-slate-200 text-sm font-semibold">
              Batal
            </button>
            <button type="button" onClick={handleConfirmDelete} className="rounded-xl py-2 px-4 bg-red-600 text-white text-sm font-semibold flex items-center gap-1">
              <Trash2 className="w-4 h-4" />
              Hapus
            </button>
          </div>
        </div>
      </Modal>

      <AnimatePresence>
        {showSuccessToast && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3">
            <Check className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-semibold">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
