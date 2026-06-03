import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { useAppContext } from "../context/AppContext";
import { AlertTriangle, Plus, Target, Wallet, Save, Edit2, Trash2, Car, Utensils, Clapperboard, Zap, PiggyBank, Bot, ArrowRight, ChartPie } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { buildExpenseCategoryOptions, formatCategoryLabel, normalizeCategoryName } from "../utils/categoryUtils";
import { getNextUnusedBudgetColor } from "../utils/budgetColors";
import { formatRupiahInput, parseRupiahInput } from "../utils/currencyInput";

export const BudgetPage = () => {
  const { budgets, transactions, addBudget, updateBudget, deleteBudget, getBudgetSuggestions, applyBudgetSuggestion, applyAllBudgetSuggestions, user, categories, customCategories, dashboardSummary } = useAppContext();
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

  const chartBudgets = useMemo(() => budgets.filter((budget) => Number(budget.total) > 0), [budgets]);

  const chartPieData = useMemo(
    () =>
      chartBudgets.map((b) => ({
        name: b.category,
        value: Number(b.total),
        fill: b.chartColor || "#94a3b8",
      })),
    [chartBudgets]
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

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case "makanan":
        return <Utensils className="w-6 h-6 text-orange-500" />;
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

  const getNeumorphicBg = (category) => {
    switch (category.toLowerCase()) {
      case "makanan":
        return "bg-orange-50 shadow-[2px_2px_8px_#ffedd5,-2px_-2px_8px_#ffffff]";
      case "transportasi":
        return "bg-blue-50 shadow-[2px_2px_8px_#dbeafe,-2px_-2px_8px_#ffffff]";
      case "hiburan":
        return "bg-purple-50 shadow-[2px_2px_8px_#f3e8ff,-2px_-2px_8px_#ffffff]";
      case "tagihan":
        return "bg-yellow-50 shadow-[2px_2px_8px_#fef9c3,-2px_-2px_8px_#ffffff]";
      default:
        return "bg-slate-50 shadow-[2px_2px_8px_#f1f5f9,-2px_-2px_8px_#ffffff]";
    }
  };

  const formatRp = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

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

  /** Tabungan bulan ini = total setoran ke tujuan tabungan (savings_deposit) */
  const tabunganAmount = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "savings_deposit" && String(t.date || "").startsWith(currentMonthPrefix))
        .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0),
    [transactions, currentMonthPrefix]
  );

  const allocatableIncome = useMemo(
    () => Math.max(0, suggestionIncome - tabunganAmount),
    [suggestionIncome, tabunganAmount]
  );

  const budgetSuggestions = useMemo(
    () => getBudgetSuggestions(suggestionIncome, tabunganAmount),
    [getBudgetSuggestions, suggestionIncome, tabunganAmount]
  );

  const existingSuggestionCategories = useMemo(
    () => new Set(budgets.map((budget) => normalizeCategoryName(budget.category))),
    [budgets]
  );

  const pendingSuggestions = useMemo(
    () => budgetSuggestions.filter((suggestion) => !existingSuggestionCategories.has(normalizeCategoryName(suggestion.category))),
    [budgetSuggestions, existingSuggestionCategories]
  );

  // Use backend totals from dashboardSummary (computed on server)
  const totalBudget = Number(dashboardSummary?.total_budget || 0);
  const totalSpent = Number(dashboardSummary?.total_spent || 0);
  const totalRemaining = Number(dashboardSummary?.total_remaining || 0);
  const isBudgetAlert = totalRemaining < 0;
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const potentialSavings = Math.max(0, Number(user.monthlyIncome || 0) - Number(user.monthlyExpenses || 0) - totalSpent);
  const aiSavings = Math.max(0, Math.round(totalSpent * 0.1));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ringkasan Anggaran</h1>
          <p className="text-slate-500">Pantau batas pengeluaran dan tujuan Anda.</p>
        </div>
        <Button onClick={openCreateBudgetModal} className="w-full sm:w-auto flex items-center justify-center gap-2">
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
                <option value="">Kategori belum dimuat — cek backend & seed DB</option>
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
              <input type="text" inputMode="numeric" required value={newBudget.total} onChange={(e) => setNewBudget({ ...newBudget, total: formatRupiahInput(e.target.value) })} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" placeholder="0" />
            </div>
          </div>
          <Button type="submit" fullWidth className="mt-4 flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> Simpan Anggaran
          </Button>
        </form>
      </Modal>

      {/* Edit Budget Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Anggaran">
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
            <input type="text" disabled value={editingBudget?.category || ""} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed" />
            <p className="text-xs text-slate-400 mt-1">Kategori tidak bisa diubah</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Batas Bulanan</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">Rp</span>
              <input type="text" inputMode="numeric" required value={editAmount} onChange={(e) => setEditAmount(formatRupiahInput(e.target.value))} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" className="flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> Simpan Perubahan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-primary-600 to-primary-800 text-white border-none">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-primary-200" />
              <h3 className="font-medium text-primary-100">Total Anggaran</h3>
            </div>
            <p className="text-3xl font-bold">{formatRp(totalBudget)}</p>
            <p className="text-sm text-primary-200 mt-2">Untuk bulan ini</p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <div className="flex items-center gap-3 mb-2">
              <Wallet className="w-5 h-5 text-slate-400" />
              <h3 className="font-medium text-slate-500">Total Terpakai</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{formatRp(totalSpent)}</p>
            <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5">
              <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${Math.min(overallPercentage, 100)}%` }}></div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-5 h-5 rounded-full border-2 border-green-500 flex items-center justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <h3 className="font-medium text-slate-500">{isBudgetAlert ? "Alert Budget" : "Sisa"}</h3>
            </div>
            <p className={`text-3xl font-bold ${isBudgetAlert ? "text-red-500" : "text-green-500"}`}>{isBudgetAlert ? `-${formatRp(Math.abs(totalRemaining)).replace(/^Rp\s?/, "Rp ")}` : formatRp(totalRemaining)}</p>
            <p className="text-sm text-slate-500 mt-2">{isBudgetAlert ? "Saldo anggaran minus, perlu penyesuaian." : "Aman untuk dipakai"}</p>
          </Card>
        </motion.div>
      </div>

      {/* Allocation Pie Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/2 min-h-[300px] h-[300px]">
              {chartPieData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 text-center">
                  <ChartPie className="w-12 h-12 text-slate-300 mb-3" />
                  <p className="text-sm font-medium text-slate-600">Belum ada data distribusi</p>
                  <p className="text-xs text-slate-500 mt-1 mb-4">Buat anggaran per kategori untuk melihat grafik alokasi dana.</p>
                  <Button type="button" size="sm" onClick={openCreateBudgetModal} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Buat Anggaran
                  </Button>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={chartPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={chartPieData.length > 1 ? 4 : 0}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartPieData.map((entry, index) => (
                        <Cell key={`cell-${entry.name}-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatRp(value)} contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }} />
                    <Legend verticalAlign="bottom" align="center" layout="horizontal" iconType="circle" />
                  </RechartsPieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="w-full md:w-1/2">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Distribusi Anggaran</h3>
              <p className="text-slate-500 mb-6">Melihat bagaimana dana Anda dialokasikan ke berbagai kategori untuk bulan ini.</p>

              <div className="space-y-4">
                {chartBudgets.length === 0 ? (
                  <p className="text-sm text-slate-500">Ringkasan persentase akan muncul setelah Anda menambahkan anggaran.</p>
                ) : (
                  chartBudgets.slice(0, 6).map((b) => (
                    <div key={b.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: b.chartColor || "#94a3b8" }}></div>
                        <span className="font-medium text-slate-700 capitalize">{b.category}</span>
                      </div>
                      <span className="font-bold text-slate-900">{totalBudget > 0 ? ((b.total / totalBudget) * 100).toFixed(0) : 0}%</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Category Budgets List */}
      <Card className="p-0 overflow-hidden border-none shadow-sm ring-1 ring-slate-100">
        <div className="flex flex-col divide-y divide-slate-100">
          {budgets.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">Belum ada anggaran. Mari buat anggaran pertama Anda!</div>
          ) : (
            budgets.map((budget, index) => {
              // Get spent amount from backend budget_progress for this budget's category
              const categoryProgress = (dashboardSummary?.budget_progress || []).find(
                (p) => `${p.name || ""}`.toLowerCase() === `${budget.category || ""}`.toLowerCase()
              );
              const spentForBudget = Number(budget.spent ?? categoryProgress?.spent_amount ?? 0);

              const percentage = budget.total > 0 ? (spentForBudget / budget.total) * 100 : 0;

              // Logic Status
              let statusText = "Aman";
              let statusColor = "bg-green-100 text-green-700 border-green-200";
              let progressColor = "bg-green-500";
              let barColor = "#22c55e"; // green-500

              if (percentage > 90) {
                statusText = "Bahaya";
                statusColor = "bg-red-100 text-red-700 border-red-200";
                progressColor = "bg-red-500";
                barColor = "#ef4444"; // red-500
              } else if (percentage >= 70) {
                statusText = "Waspada";
                statusColor = "bg-yellow-100 text-yellow-700 border-yellow-200";
                progressColor = "bg-yellow-500";
                barColor = "#eab308"; // yellow-500
              }

              // Logic Insight (Asumsi hari ke-15)
              const currentDay = 15;
              const dailyAvg = spentForBudget / currentDay;
              const remaining = budget.total - spentForBudget;
              const daysLeft = remaining > 0 && dailyAvg > 0 ? Math.floor(remaining / dailyAvg) : 0;
              let insightText = "";
              if (percentage >= 100) {
                insightText = "Anggaran telah habis.";
              } else {
                insightText = `Jika tren tetap, anggaran habis dalam ${daysLeft} hari.`;
              }

              // Generate mock trend for the sparkline (removed per user request)

              return (
                <motion.div key={budget.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.1 }} className="p-4 sm:p-6 hover:bg-slate-50/50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    {/* Left: Icon, Title & Status */}
                    <div className="flex items-start gap-4 lg:w-[40%]">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${getNeumorphicBg(budget.category)}`}>{getCategoryIcon(budget.category)}</div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900 text-lg capitalize">{budget.category}</h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor}`}>{statusText}</span>
                        </div>
                        <p className="text-sm text-slate-500 mb-2">{budget.subtitle || "Kategori Pengeluaran"}</p>
                        <p className="text-xs font-medium text-slate-400">
                          Batas: <span className="text-slate-700">{formatRp(budget.total)}</span>
                        </p>
                      </div>
                    </div>

                    {/* Middle: Progress & Insight */}
                    <div className="lg:w-[45%] flex flex-col justify-center mt-2 lg:mt-0">
                      <div className="flex justify-between items-end mb-2">
                        <span className={`text-sm font-bold ${progressColor.replace("bg-", "text-")}`}>Terpakai {percentage.toFixed(0)}%</span>
                        <span className="text-sm font-medium text-slate-700">{formatRp(spentForBudget)}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden mb-2">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(percentage, 100)}%` }} transition={{ duration: 1, ease: "easeOut" }} className={`h-full rounded-full ${progressColor}`} />
                      </div>
                      <p className="text-xs text-slate-500 italic flex items-start gap-1">
                        <span>💡</span> <span>{insightText}</span>
                      </p>
                    </div>

                    {/* Actions & Detail */}
                    <div className="lg:w-[15%] flex flex-col sm:flex-row lg:flex-col justify-between sm:items-center lg:items-end gap-3 shrink-0 lg:border-l lg:border-slate-100 lg:pl-4 mt-4 lg:mt-0">
                      <div className="flex gap-1 w-full sm:w-auto justify-end">
                        <button onClick={() => handleEditBudget(budget)} className="p-2 text-slate-400 hover:text-primary-600 transition-colors rounded-lg hover:bg-primary-50">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteBudget(budget.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <Button variant="outline" size="sm" className="text-xs w-full sm:w-auto whitespace-nowrap">
                        Lihat Detail
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </Card>

      {/* Saran anggaran — disembunyikan jika semua kategori sudah punya budget bulan ini */}
      {pendingSuggestions.length > 0 && (
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Saran Anggaran Berdasarkan Pemasukan</h2>
              <p className="text-sm text-slate-500">Kami merekomendasikan alokasi anggaran berdasarkan pemasukan bulanan Anda.</p>
            </div>
            <div className="w-full sm:w-auto flex items-center gap-2">
              <Button
                onClick={() => applyAllBudgetSuggestions(suggestionIncome, tabunganAmount)}
                disabled={allocatableIncome <= 0}
                className="text-sm w-full sm:w-auto"
              >
                Terapkan Semua
              </Button>
            </div>
          </div>

          {suggestionIncome <= 0 ? (
            <p className="mt-4 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              Belum ada pemasukan bulan ini. Tambahkan transaksi <strong>Pemasukan</strong> dulu agar nominal saran terisi; kartu kategori di bawah menampilkan persentase alokasi.
            </p>
          ) : (
            <div className="mt-4 text-sm text-slate-600 space-y-1">
              <p>
                Rumus: <span className="font-medium text-slate-800">Saran = % kategori × (Pemasukan − Tabungan)</span>
              </p>
              <p>
                Pemasukan: <span className="font-semibold text-slate-900">{formatRp(suggestionIncome)}</span>
                {" · "}
                Tabungan: <span className="font-semibold text-slate-900">{formatRp(tabunganAmount)}</span>
                {" · "}
                Dasar alokasi: <span className="font-semibold text-primary-700">{formatRp(allocatableIncome)}</span>
              </p>
              {tabunganAmount > suggestionIncome && (
                <p className="text-amber-700 text-xs">Tabungan melebihi pemasukan; saran kategori bernilai Rp 0 hingga pemasukan bertambah.</p>
              )}
            </div>
          )}

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingSuggestions.map((s) => (
              <div key={s.category} className="p-4 bg-slate-50 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">{formatCategoryLabel(s.category)}</div>
                  <div className="text-xs text-slate-500">
                    {allocatableIncome > 0 ? (
                      <>
                        {Math.round((s.percent || 0) * 100)}% × {formatRp(allocatableIncome)} = {formatRp(s.amount)}
                      </>
                    ) : (
                      <>Alokasi: {Math.round((s.percent || 0) * 100)}% × (pemasukan − tabungan)</>
                    )}
                  </div>
                </div>
                <div className="w-full sm:w-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full sm:w-auto"
                    disabled={s.amount <= 0}
                    onClick={() => applyBudgetSuggestion(s.category, s.amount)}
                  >
                    Terapkan
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Bottom Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* Potensi Tabungan */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="md:col-span-1">
          <Card className="h-full border-none shadow-sm ring-1 ring-slate-100 p-6 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <PiggyBank className="w-5 h-5" />
              </div>
              <span className="font-medium text-slate-700">Potensi Tabungan</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-2">{formatRp(potentialSavings)}</p>
            <p className="text-sm font-medium text-green-500 flex items-center gap-1">Berdasarkan income, expense, dan anggaran tersimpan</p>
          </Card>
        </motion.div>

        {/* Insight Finsight AI */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="md:col-span-2">
          <Card className="h-full border-none shadow-sm ring-1 ring-slate-100 p-6 relative overflow-hidden">
            <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
              <Bot className="w-48 h-48" />
            </div>
            <div className="relative z-10">
              <h3 className="text-slate-600 font-medium mb-3">Insight Finsight AI</h3>
              <p className="text-slate-800 leading-relaxed mb-4">
                {aiSavings > 0 ? (
                  <>
                    Kamu bisa menghemat sekitar <span className="text-primary-600 font-bold">{formatRp(aiSavings)}</span> jika membatasi makan di luar minggu ini. Mau kami buatkan rencana makan hemat?
                  </>
                ) : (
                  <>Tambahkan transaksi pengeluaran dan anggaran yang lebih lengkap supaya rekomendasi hemat dari AI muncul lebih akurat.</>
                )}
              </p>
              <button className="text-primary-600 font-semibold text-sm hover:text-primary-700 flex items-center gap-1 group">
                Lihat Analisis AI
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
