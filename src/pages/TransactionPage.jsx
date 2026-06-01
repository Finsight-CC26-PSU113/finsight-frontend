import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { useAppContext } from "../context/AppContext";
import { Search, Plus, Trash2, ArrowUpRight, ArrowDownRight, SlidersHorizontal, Calendar, Sparkles, Check, Loader2, AlertCircle } from "lucide-react";
import { UploadCloud, Edit3 } from "lucide-react";
import { apiRequest } from "../utils/apiClient";
import { RECEIPT_IMAGE_ACCEPT, buildTransactionFromScan, formatDateHeader, getCategoryStyles, getLatestTxMonthAndYear, getPaymentMethod, getTime, getUniqueMonths, isAllowedReceiptImageFile, preprocessReceiptImage } from "../utils/transactionPage";
import { EXPENSE_FILTER_CATEGORIES, formatCategoryLabel, normalizeCategoryName } from "../utils/categoryUtils";

export const TransactionPage = () => {
  const { transactions, deleteTransaction, openAddTxModal, openEditTxModal, globalSearchTerm, setGlobalSearchTerm, addTransaction, authToken, refreshTransactions, insights } = useAppContext();

  const [filter, setFilter] = useState("all");
  const [showExtraFilters, setShowExtraFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [isScanningReceipt, setIsScanningReceipt] = useState(false);
  const [scanStatus, setScanStatus] = useState({ state: "idle", message: "" });
  const scanInputRef = useRef(null);
  const scanStatusTimerRef = useRef(null);

  const [txToDelete, setTxToDelete] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

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

      setTimeout(() => {
        setShowSuccessToast(false);
      }, 3000);
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
      showScanStatus("error", "Ukuran gambar terlalu besar. Coba file yang lebih kecil.", 2600);
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
      const uploadFile = await preprocessReceiptImage(file);
      formData.append("image", uploadFile);

      const payload = await apiRequest("/api/scan", {
        method: "POST",
        token: authToken,
        body: formData,
      });

      const scan = payload?.data?.scan || payload?.scan || payload;
      const transactionFromScan = buildTransactionFromScan(scan);

      if (!transactionFromScan) {
        showScanStatus("error", "Total struk belum terbaca. Coba upload ulang.", 2800);
        return;
      }

      try {
        await addTransaction(transactionFromScan);
        showScanStatus("success", "Struk berhasil diproses dan disimpan.", 2200);
      } catch (saveError) {
        const saveMessage = `${saveError?.message || ""}`;
        const normalizedMessage = saveMessage.includes("Validation failed") ? "Data transaksi belum lengkap. Coba upload ulang." : "Struk belum bisa disimpan. Coba upload ulang.";
        showScanStatus("error", normalizedMessage, 2800);
      }
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
      refreshTransactions().catch(() => {
        // Silence any refresh error and continue using existing local state
      });
    }
  }, [authToken, transactions.length, refreshTransactions]);

  const topInsight = insights[0] || {
    title: "Rangkuman AI sedang disiapkan",
    description: "Kami sedang mengumpulkan data transaksi Anda. Coba kembali setelah transaksi tersinkronisasi.",
    action: "Lihat Wawasan",
  };

  const activeDateInfo = getLatestTxMonthAndYear(transactions);

  const monthlyIncomeTotal = transactions
    .filter((tx) => {
      const d = new Date(tx.date);
      return tx.type === "income" && d.getMonth() === activeDateInfo.month && d.getFullYear() === activeDateInfo.year;
    })
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const monthlyExpenseTotal = transactions
    .filter((tx) => {
      const d = new Date(tx.date);
      return tx.type === "expense" && d.getMonth() === activeDateInfo.month && d.getFullYear() === activeDateInfo.year;
    })
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const filteredTransactions = transactions
    .filter((tx) => {
      const matchesSearch = tx.title.toLowerCase().includes(globalSearchTerm.toLowerCase()) || tx.category.toLowerCase().includes(globalSearchTerm.toLowerCase());
      const matchesFilter = filter === "all" || tx.type === filter;
      const matchesCategory =
        selectedCategory === "all" || normalizeCategoryName(tx.category) === normalizeCategoryName(selectedCategory);

      let matchesMonth = true;
      if (selectedMonth !== "all") {
        const txDate = new Date(tx.date);
        const monthVal = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, "0")}`;
        matchesMonth = monthVal === selectedMonth;
      }

      return matchesSearch && matchesFilter && matchesCategory && matchesMonth;
    })
    .sort((a, b) => {
      if (sortBy === "date-desc") {
        return new Date(b.date) - new Date(a.date);
      }
      if (sortBy === "date-asc") {
        return new Date(a.date) - new Date(b.date);
      }
      if (sortBy === "amount-desc") {
        return Math.abs(b.amount) - Math.abs(a.amount);
      }
      if (sortBy === "amount-asc") {
        return Math.abs(a.amount) - Math.abs(b.amount);
      }
      return 0;
    });

  const groupedTransactions = filteredTransactions.reduce((groups, tx) => {
    const date = tx.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(tx);
    return groups;
  }, {});

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
              <h3 className={`text-lg font-bold ${scanStatus.state === "success" ? "text-emerald-700" : scanStatus.state === "error" ? "text-rose-700" : "text-slate-900"}`}>{scanStatus.state === "loading" ? "Memproses struk" : scanStatus.state === "success" ? "Berhasil diproses" : "Gagal diproses"}</h3>
              <p className="mt-2 text-sm text-slate-500">{scanStatus.message}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transaksi</h1>
          <p className="text-slate-500">Kelola pendapatan dan pengeluaran Anda.</p>
        </div>
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input ref={scanInputRef} id="tx-scan-input" type="file" accept={RECEIPT_IMAGE_ACCEPT} className="hidden" onChange={handleScanFileChange} />
          <Button type="button" variant="outline" className="w-full sm:w-auto flex items-center justify-center gap-2 shadow-sm rounded-xl py-2.5 px-3" onClick={() => scanInputRef.current?.click()} disabled={isScanningReceipt}>
            <UploadCloud className="w-4 h-4 text-slate-700" />
            Pindai Struk
          </Button>

          <Button onClick={openAddTxModal} className="w-full sm:w-auto flex items-center justify-center gap-2 shadow-sm rounded-xl py-2.5" disabled={isScanningReceipt}>
            <Plus className="w-4 h-4" />
            Tambah Transaksi
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        <Card className="relative h-full min-h-[150px] overflow-hidden p-4 sm:p-5 bg-white border border-slate-100 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.08)] transition-all duration-300">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="p-2.5 sm:p-3 rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <span className="text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap bg-emerald-100 text-emerald-700">{new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(new Date(activeDateInfo.year, activeDateInfo.month, 1))}</span>
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1 leading-tight">Pemasukan Bulanan</p>
            <h3 className="text-[clamp(1rem,4vw,1.3rem)] sm:text-[clamp(1.1rem,3vw,1.45rem)] md:text-[clamp(1.2rem,2.5vw,1.6rem)] font-bold text-slate-900 leading-tight break-words max-w-full">Rp {monthlyIncomeTotal.toLocaleString("id-ID")}</h3>
          </div>
        </Card>

        <Card className="relative h-full min-h-[150px] overflow-hidden p-4 sm:p-5 bg-white border border-slate-100 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.08)] transition-all duration-300">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="p-2.5 sm:p-3 rounded-2xl bg-rose-50 text-rose-600 shadow-sm">
              <ArrowDownRight className="w-5 h-5" />
            </div>
            <span className="text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap bg-rose-100 text-rose-700">{new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(new Date(activeDateInfo.year, activeDateInfo.month, 1))}</span>
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1 leading-tight">Pengeluaran Bulanan</p>
            <h3 className="text-[clamp(1rem,4vw,1.3rem)] sm:text-[clamp(1.1rem,3vw,1.45rem)] md:text-[clamp(1.2rem,2.5vw,1.6rem)] font-bold text-red-500 leading-tight break-words max-w-full">Rp {monthlyExpenseTotal.toLocaleString("id-ID")}</h3>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Cari transaksi (e.g. Starbucks, Gaji)..." value={globalSearchTerm} onChange={(e) => setGlobalSearchTerm(e.target.value)} className="pl-11 pr-4 py-2.5 w-full border border-slate-200 bg-white rounded-full text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm" />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full xl:w-auto">
            <div className="w-full sm:w-auto overflow-x-auto">
              <div className="bg-slate-100 p-1 rounded-full flex items-center border border-slate-200/50 shadow-sm min-w-max">
                <button onClick={() => setFilter("all")} className={`px-4 md:px-5 py-2 text-xs md:text-sm font-semibold rounded-full transition-all cursor-pointer ${filter === "all" ? "bg-primary-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/50"}`}>
                  Semua
                </button>
                <button onClick={() => setFilter("income")} className={`px-4 md:px-5 py-2 text-xs md:text-sm font-semibold rounded-full transition-all cursor-pointer ${filter === "income" ? "bg-primary-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/50"}`}>
                  Pemasukan
                </button>
                <button onClick={() => setFilter("expense")} className={`px-4 md:px-5 py-2 text-xs md:text-sm font-semibold rounded-full transition-all cursor-pointer ${filter === "expense" ? "bg-primary-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/50"}`}>
                  Pengeluaran
                </button>
              </div>
            </div>

            <div className="relative w-full sm:w-auto shrink-0">
              <Calendar className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-full sm:w-auto pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-full text-xs md:text-sm font-semibold text-slate-700 outline-none hover:bg-slate-50 transition-all shadow-sm cursor-pointer appearance-none">
                <option value="all">Semua Waktu</option>
                {getUniqueMonths(transactions).map((m) => (
                  <option key={m.val} value={m.val}>
                    {m.label}
                  </option>
                ))}
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-500"></span>
            </div>

            <button onClick={() => setShowExtraFilters(!showExtraFilters)} className={`w-10 h-10 bg-white border rounded-full hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center cursor-pointer shrink-0 ${showExtraFilters ? "border-primary-500 text-primary-600 ring-2 ring-primary-100" : "border-slate-200 text-slate-600"}`} title="Filter Kategori & Urutan">
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showExtraFilters && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-white border border-slate-200/60 rounded-3xl shadow-sm">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Filter Kategori</label>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-primary-500 capitalize">
                <option value="all">Semua Kategori</option>
                {EXPENSE_FILTER_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {formatCategoryLabel(category)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Urutkan Berdasarkan</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-primary-500">
                <option value="date-desc">Tanggal: Terbaru ke Terlama</option>
                <option value="date-asc">Tanggal: Terlama ke Terbaru</option>
                <option value="amount-desc">Jumlah: Terbesar ke Terkecil</option>
                <option value="amount-asc">Jumlah: Terkecil ke Terbesar</option>
              </select>
            </div>
          </motion.div>
        )}

        {Object.keys(groupedTransactions).length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-white border border-slate-100 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.01)]">Tidak ada transaksi yang ditemukan.</div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedTransactions).map(([dateStr, txs]) => (
              <div key={dateStr} className="space-y-3">
                <h3 className="text-xs md:text-sm font-bold text-slate-800 tracking-wide px-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                  {formatDateHeader(dateStr)}
                </h3>
                <div className="space-y-3">
                  {txs.map((tx, index) => {
                    const catStyles = getCategoryStyles(tx.category);
                    const CatIcon = catStyles.icon;
                    const isIncome = tx.type === "income";

                    return (
                      <motion.div key={tx.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }} className="bg-white border border-slate-100 hover:border-slate-200 rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.015)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.035)] transition-all flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:justify-between group cursor-pointer">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${catStyles.iconBg}`}>
                            <CatIcon className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-slate-800 text-sm md:text-base leading-snug truncate">{tx.title}</h4>
                            <p className="text-[11px] md:text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                              <span>{getPaymentMethod(tx)}</span>
                              <span className="text-slate-300">•</span>
                              <span>{getTime(tx)}</span>
                            </p>
                          </div>
                        </div>
                        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-4 shrink-0">
                          <div className="text-left sm:text-right">
                            <p className={`font-bold text-sm md:text-base ${isIncome ? "text-green-600" : "text-red-500"}`}>
                              {isIncome ? "+ " : "- "}Rp {Math.abs(tx.amount).toLocaleString("id-ID")}
                            </p>
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${catStyles.bg} mt-1 capitalize`}>{catStyles.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditTxModal(tx);
                              }}
                              className="p-2 rounded-full text-primary-600 hover:bg-primary-50 transition-colors cursor-pointer"
                              title="Edit Transaksi"
                              aria-label="Edit Transaction"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setTxToDelete(tx);
                              }}
                              className="p-2 rounded-full text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Hapus Transaksi"
                              aria-label="Delete Transaction"
                            >
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

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative overflow-hidden bg-gradient-to-r from-primary-600 to-blue-500 rounded-3xl p-6 text-white shadow-lg shadow-blue-500/20">
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
          <Sparkles className="w-32 h-32 text-white animate-pulse" />
        </div>
        <div className="relative z-10 space-y-2 max-w-2xl">
          <h4 className="text-sm font-extrabold tracking-wider uppercase text-blue-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-200" />
            Rangkuman AI Finsight
          </h4>
          <h3 className="text-xl md:text-2xl font-bold text-white">{topInsight.title}</h3>
          <p className="text-sm md:text-base text-white font-medium leading-relaxed">
            {topInsight.description}
          </p>
        </div>
      </motion.div>

      <Modal isOpen={txToDelete !== null} onClose={() => setTxToDelete(null)} title="Konfirmasi Hapus">
        <div className="space-y-4">
          <p className="text-slate-600 text-sm leading-relaxed">
            Apakah Anda yakin ingin menghapus transaksi <strong className="text-slate-900">"{txToDelete?.title}"</strong> senilai <strong className="text-slate-900">Rp {Math.abs(txToDelete?.amount || 0).toLocaleString("id-ID")}</strong>? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button onClick={() => setTxToDelete(null)} className="rounded-xl py-2 px-4 text-slate-700 font-semibold hover:bg-slate-50 border border-slate-200 cursor-pointer text-sm transition-colors">
              Batal
            </button>
            <button onClick={handleConfirmDelete} className="rounded-xl py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center gap-1.5 cursor-pointer text-sm transition-colors">
              <Trash2 className="w-4 h-4" />
              Hapus
            </button>
          </div>
        </div>
      </Modal>

      <AnimatePresence>
        {showSuccessToast && (
          <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }} className="fixed bottom-6 right-6 z-50 bg-slate-900/95 backdrop-blur-md text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-800">
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <div className="font-semibold text-sm tracking-wide">{toastMessage}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
