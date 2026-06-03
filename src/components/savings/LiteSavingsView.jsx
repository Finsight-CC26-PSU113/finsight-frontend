import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { useAppContext } from "../../context/AppContext";
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
} from "lucide-react";
import { formatRupiahInput, parseRupiahInput } from "../../utils/currencyInput";

const formatCurrency = (value) =>
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

export const LiteSavingsView = () => {
  const {
    user,
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

  const [error, setError] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [transferModal, setTransferModal] = useState(null);
  const [transferAmount, setTransferAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [newGoal, setNewGoal] = useState({
    name: "",
    target_amount: "",
    deadline: "",
  });

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

  const insightIcon = (type) => {
    if (type === "alert") return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
    if (type === "positive") return <TrendingUp className="w-5 h-5 text-green-500 shrink-0" />;
    return <Sparkles className="w-5 h-5 text-blue-500 shrink-0" />;
  };

  return (
    <div className="space-y-6 md:space-y-8 max-w-5xl mx-auto pb-24 md:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <PiggyBank className="w-7 h-7 text-primary-600" />
            Tujuan Tabungan
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola target tabungan dan alokasikan dana dari saldo utama.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Buat Tujuan
        </Button>
      </div>

      <Card className="p-5 md:p-6 bg-gradient-to-br from-primary-50 to-white border-primary-100">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-white border border-primary-100 shadow-sm">
            <Wallet className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Saldo Utama Tersedia</p>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(savingsAvailableBalance ?? user.balance)}</p>
          </div>
        </div>
      </Card>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">{error}</div>
      )}

      {savingsInsights.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-ai" />
            AI Insight Tabungan
          </h2>
          <div className="grid gap-3">
            {savingsInsights.map((insight, index) => (
              <motion.div
                key={`${insight.goal_id || "global"}-${index}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm flex gap-3"
              >
                {insightIcon(insight.type)}
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">{insight.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{insight.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {!isAuthReady || !savingsReady ? (
        <div className="text-center py-16 text-slate-400 text-sm min-h-[200px] flex items-center justify-center">
          Memuat tujuan tabungan...
        </div>
      ) : savingsGoals.length === 0 ? (
        <Card className="p-10 text-center">
          <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-bold text-slate-800">Belum ada tujuan tabungan</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
            Buat target pertama Anda — misalnya liburan, dana darurat, atau gadget impian.
          </p>
          <Button onClick={() => setIsCreateOpen(true)} className="mt-6">
            Buat Tujuan Pertama
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {savingsGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onDeposit={() => {
                setTransferAmount("");
                setTransferModal({ mode: "deposit", goal });
              }}
              onWithdraw={() => {
                setTransferAmount("");
                setTransferModal({ mode: "withdraw", goal });
              }}
              onDelete={() => handleDeleteGoal(goal)}
            />
          ))}
        </div>
      )}

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
              placeholder="5000000"
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

      <Modal
        isOpen={Boolean(transferModal)}
        onClose={() => setTransferModal(null)}
        title={transferModal?.mode === "deposit" ? "Tambah Tabungan" : "Tarik Dana"}
      >
        {transferModal && (
          <form onSubmit={handleTransfer} className="space-y-4">
            <p className="text-sm text-slate-600">
              {transferModal.mode === "deposit"
                ? `Memindahkan dana dari saldo utama ke "${transferModal.goal.name}".`
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

function GoalCard({ goal, onDeposit, onWithdraw, onDelete }) {
  const progress = Math.min(100, Number(goal.progress_percent) || 0);

  return (
    <Card className="p-5 md:p-6 flex flex-col h-full">
      <div className="flex items-start justify-between gap-2 mb-4">
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-slate-900 truncate">{goal.name}</h3>
          {goal.deadline && (
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(goal.deadline)}
            </p>
          )}
        </div>
        {Number(goal.saved_amount) === 0 && (
          <button
            type="button"
            onClick={onDelete}
            className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50"
            aria-label="Hapus tujuan"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-3 flex-1">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Target</span>
          <span className="font-semibold text-slate-800">{formatCurrency(goal.target_amount)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Dana terkumpul</span>
          <span className="font-semibold text-primary-700">{formatCurrency(goal.saved_amount)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Sisa target</span>
          <span className="font-semibold text-slate-800">{formatCurrency(goal.remaining_amount)}</span>
        </div>

        <div className="pt-2">
          <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
            <span>Progres</span>
            <span>{progress.toFixed(1)}%</span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-5">
        <Button variant="outline" onClick={onDeposit} className="flex items-center justify-center gap-1.5 text-sm">
          <ArrowDownToLine className="w-4 h-4" />
          Tambah Tabungan
        </Button>
        <Button
          variant="outline"
          onClick={onWithdraw}
          disabled={Number(goal.saved_amount) <= 0}
          className="flex items-center justify-center gap-1.5 text-sm"
        >
          <ArrowUpFromLine className="w-4 h-4" />
          Tarik Dana
        </Button>
      </div>
    </Card>
  );
}
