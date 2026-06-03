import { useMemo, useState } from "react";
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
  PiggyBank,
  Plus,
  Target,
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  Sparkles,
  AlertTriangle,
  Trash2,
  Calendar,
  TrendingUp,
  Percent,
  CheckCircle2,
  Flag,
} from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { useAppContext } from "../../context/AppContext";
import { formatRupiahInput, parseRupiahInput } from "../../utils/currencyInput";
import { buildSavingsAiInsights, computeProSavingsMetrics } from "../../utils/proSavingsAnalytics";

const formatRp = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return null;
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

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

const onTrackTone = {
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  on_track: "bg-sky-100 text-sky-700 border-sky-200",
  at_risk: "bg-rose-100 text-rose-700 border-rose-200",
  no_deposits: "bg-amber-100 text-amber-700 border-amber-200",
  progressing: "bg-primary-100 text-primary-700 border-primary-200",
  unknown: "bg-slate-100 text-slate-600 border-slate-200",
};

export const ProSavingsView = () => {
  const {
    user,
    transactions,
    savingsGoals,
    savingsAvailableBalance,
    savingsInsights,
    savingsReady,
    isAuthReady,
    createSavingsGoal,
    depositToSavingsGoal,
    withdrawFromSavingsGoal,
    deleteSavingsGoal,
    refreshSavingsData,
  } = useAppContext();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [transferModal, setTransferModal] = useState(null);
  const [transferAmount, setTransferAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: "", target_amount: "", deadline: "" });

  const metrics = useMemo(
    () => computeProSavingsMetrics({ savingsGoals, transactions, user }),
    [savingsGoals, transactions, user]
  );

  const aiInsights = useMemo(
    () => buildSavingsAiInsights({ metrics, apiInsights: savingsInsights }),
    [metrics, savingsInsights]
  );

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.target_amount) return;
    setSubmitting(true);
    try {
      const targetAmount = parseRupiahInput(newGoal.target_amount);
      if (targetAmount <= 0) {
        window.alert("Target tabungan harus lebih dari 0");
        return;
      }
      await createSavingsGoal({
        name: newGoal.name,
        target_amount: targetAmount,
        deadline: newGoal.deadline || null,
      });
      setIsCreateOpen(false);
      setNewGoal({ name: "", target_amount: "", deadline: "" });
      await refreshSavingsData().catch(() => null);
    } catch (err) {
      window.alert(err.message || "Gagal membuat tujuan tabungan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!transferModal || !transferAmount) return;
    setSubmitting(true);
    try {
      const amount = parseRupiahInput(transferAmount);
      if (amount <= 0) {
        window.alert("Nominal harus lebih dari 0");
        return;
      }
      if (transferModal.mode === "deposit") {
        await depositToSavingsGoal(transferModal.goal.id, amount);
      } else {
        await withdrawFromSavingsGoal(transferModal.goal.id, amount);
      }
      setTransferModal(null);
      setTransferAmount("");
      await refreshSavingsData().catch(() => null);
    } catch (err) {
      window.alert(err.message || "Gagal memproses transaksi tabungan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGoal = async (goal) => {
    if (!window.confirm(`Hapus tujuan "${goal.name}"?`)) return;
    try {
      await deleteSavingsGoal(goal.id);
      await refreshSavingsData().catch(() => null);
    } catch (err) {
      window.alert(err.message || "Gagal menghapus tujuan");
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 max-w-6xl mx-auto pb-24 md:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary-600">Tabungan Pro</p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-0.5 flex items-center gap-2">
            <PiggyBank className="w-7 h-7 text-primary-600" />
            Analisis Tabungan Lanjutan
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Progress target, prediksi pencapaian, rasio tabungan, dan rekomendasi personal — untuk pengguna yang sudah terbiasa mengatur target keuangan. Bukan fitur berbayar.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2 rounded-xl">
          <Plus className="w-4 h-4" />
          Buat Tujuan
        </Button>
      </div>

      {/* Ringkasan atas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <SummaryCard label="Total Terkumpul" value={formatRp(metrics.totalSaved)} sub={`${metrics.overallProgressPct.toFixed(1)}% dari target`} icon={PiggyBank} tone="bg-primary-50 text-primary-600" />
        <SummaryCard label="Total Target" value={formatRp(metrics.totalTarget)} sub={`${metrics.rows.length} tujuan`} icon={Target} tone="bg-slate-100 text-slate-600" />
        <SummaryCard label="Sisa Target" value={formatRp(metrics.totalRemaining)} sub="Gabungan semua tujuan" icon={Flag} tone="bg-violet-50 text-violet-600" />
        <SummaryCard label="Saldo Utama" value={formatRp(savingsAvailableBalance ?? user.balance)} sub="Tersedia untuk setor" icon={Wallet} tone="bg-sky-50 text-sky-600" />
        <SummaryCard label="Rasio Tabungan" value={`${metrics.savingsRatio.toFixed(1)}%`} sub="Dari pemasukan bulan ini" icon={Percent} tone="bg-emerald-50 text-emerald-600" />
        <SummaryCard label="Tepat Waktu" value={String(metrics.onTrackGoals.length)} sub="Target on-track / selesai" icon={CheckCircle2} tone="bg-green-50 text-green-600" />
        <SummaryCard label="Perlu Perhatian" value={String(metrics.atRiskGoals.length)} sub="Berpotensi terlambat" icon={AlertTriangle} tone="bg-rose-50 text-rose-600" />
        <SummaryCard
          label="Rekomendasi / Bulan"
          value={metrics.totalRecommendedMonthly > 0 ? formatRp(metrics.totalRecommendedMonthly) : "—"}
          sub="Total target ber-deadline"
          icon={TrendingUp}
          tone="bg-amber-50 text-amber-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard title="Perkembangan Tabungan" subtitle="Net setoran kumulatif (6 bulan)">
          <div className="h-52">
            {metrics.growthTrend.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-16">Belum ada riwayat setoran.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.growthTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <Tooltip formatter={(v) => formatRp(v)} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="cumulative" name="Kumulatif" stroke="#2563eb" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="net" name="Net bulanan" stroke="#22c55e" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>

        <ChartCard title="Pembagian Dana Tabungan" subtitle="Donut per tujuan (dana terkumpul)">
          <div className="h-52">
            {metrics.allocationDonut.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-16">Belum ada dana terkumpul.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={metrics.allocationDonut} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={76} paddingAngle={2}>
                    {metrics.allocationDonut.map((entry, index) => (
                      <Cell key={`${entry.goalId}-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatRp(v)} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>

        <ChartCard title="Target vs Realisasi" subtitle="Per tujuan tabungan">
          <div className="h-52">
            {metrics.targetVsActual.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-16">Buat tujuan tabungan untuk melihat perbandingan.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.targetVsActual} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <Tooltip formatter={(v, name, props) => [formatRp(v), props?.payload?.fullName || name]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="target" name="Target" fill="#94a3b8" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="actual" name="Terkumpul" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>

        <ChartCard title="Progress Target" subtitle="Persentase per tujuan">
          <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
            {metrics.rows.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Belum ada target.</p>
            ) : (
              metrics.rows.map((row) => (
                <div key={row.id}>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                    <span className="truncate pr-2">{row.name}</span>
                    <span>{row.progressPct.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all"
                      style={{ width: `${Math.min(row.progressPct, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </ChartCard>
      </div>

      {/* Daftar target */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">Daftar Target Tabungan</h2>
        {!isAuthReady || !savingsReady ? (
          <div className="text-center py-16 text-slate-400 text-sm">Memuat tujuan tabungan...</div>
        ) : metrics.rows.length === 0 ? (
          <Card className="p-10 text-center">
            <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-bold text-slate-800">Belum ada tujuan tabungan</h3>
            <p className="text-sm text-slate-500 mt-2">Buat target pertama untuk mulai analisis strategi menabung.</p>
            <Button onClick={() => setIsCreateOpen(true)} className="mt-6">
              Buat Tujuan Pertama
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {metrics.rows.map((goal, index) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <Card className="p-5 md:p-6 h-full flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900 truncate">{goal.name}</h3>
                        {goal.priorityRank <= 2 && !goal.isCompleted && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">Prioritas #{goal.priorityRank}</span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${onTrackTone[goal.onTrack] || onTrackTone.unknown}`}>
                          {goal.onTrackLabel}
                        </span>
                      </div>
                      {goal.deadline && (
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(goal.deadline)}
                        </p>
                      )}
                    </div>
                    {Number(goal.saved_amount) === 0 && (
                      <button type="button" onClick={() => handleDeleteGoal(goal)} className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50" aria-label="Hapus">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <p className="text-slate-500 text-xs">Target</p>
                      <p className="font-semibold">{formatRp(goal.target)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Terkumpul</p>
                      <p className="font-semibold text-primary-700">{formatRp(goal.saved)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Sisa</p>
                      <p className="font-semibold">{formatRp(goal.remaining)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Rekomendasi/bulan</p>
                      <p className="font-semibold">{goal.recommendedMonthly ? formatRp(goal.recommendedMonthly) : "—"}</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                      <span>Progres</span>
                      <span>{goal.progressPct.toFixed(1)}%</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full" style={{ width: `${Math.min(goal.progressPct, 100)}%` }} />
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 italic mb-4 flex-1">
                    {goal.isCompleted
                      ? "Target sudah tercapai."
                      : goal.monthsToTarget
                        ? `Estimasi tercapai ~${goal.monthsToTarget} bulan${goal.estimatedCompletion ? ` (${formatDate(goal.estimatedCompletion)})` : ""} dengan pola setoran saat ini.`
                        : goal.avgMonthlyDeposit > 0
                          ? `Rata-rata setoran ${formatRp(goal.avgMonthlyDeposit)}/bulan.`
                          : "Belum ada pola setoran — mulai tabungan rutin."}
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setTransferAmount("");
                        setTransferModal({ mode: "deposit", goal });
                      }}
                      className="flex items-center justify-center gap-1.5 text-sm"
                    >
                      <ArrowDownToLine className="w-4 h-4" />
                      Tambah
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setTransferAmount("");
                        setTransferModal({ mode: "withdraw", goal });
                      }}
                      disabled={Number(goal.saved_amount) <= 0}
                      className="flex items-center justify-center gap-1.5 text-sm"
                    >
                      <ArrowUpFromLine className="w-4 h-4" />
                      Tarik
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Insight AI */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-600" />
          Insight AI — Strategi Menabung
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
                {item.type === "alert" ? "Perhatian" : item.type === "positive" ? "Positif" : "Saran"}
              </p>
              <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Buat Tujuan Tabungan">
        <form onSubmit={handleCreateGoal} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Nama Tujuan</label>
            <input
              type="text"
              required
              maxLength={100}
              value={newGoal.name}
              onChange={(e) => setNewGoal((p) => ({ ...p, name: e.target.value }))}
              placeholder="Contoh: Liburan Bali"
              className="mt-1 w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Target Tabungan (Rp)</label>
            <input
              type="text"
              inputMode="numeric"
              required
              value={newGoal.target_amount}
              onChange={(e) => setNewGoal((p) => ({ ...p, target_amount: formatRupiahInput(e.target.value) }))}
              className="mt-1 w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Deadline (opsional)</label>
            <input
              type="date"
              value={newGoal.deadline}
              onChange={(e) => setNewGoal((p) => ({ ...p, deadline: e.target.value }))}
              className="mt-1 w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Menyimpan..." : "Simpan Tujuan"}
          </Button>
        </form>
      </Modal>

      <Modal isOpen={Boolean(transferModal)} onClose={() => setTransferModal(null)} title={transferModal?.mode === "deposit" ? "Tambah Tabungan" : "Tarik Dana"}>
        {transferModal && (
          <form onSubmit={handleTransfer} className="space-y-4">
            <p className="text-sm text-slate-600">
              {transferModal.mode === "deposit"
                ? `Memindahkan dana ke "${transferModal.goal.name}".`
                : `Mengembalikan dana dari "${transferModal.goal.name}" ke saldo utama.`}
            </p>
            <div>
              <label className="text-sm font-medium text-slate-700">Nominal (Rp)</label>
              <input
                type="text"
                inputMode="numeric"
                required
                value={transferAmount}
                onChange={(e) => setTransferAmount(formatRupiahInput(e.target.value))}
                className="mt-1 w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <Button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-2">
              {transferModal.mode === "deposit" ? (
                <>
                  <ArrowDownToLine className="w-4 h-4" /> Tambah Tabungan
                </>
              ) : (
                <>
                  <ArrowUpFromLine className="w-4 h-4" /> Tarik Dana
                </>
              )}
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
};
