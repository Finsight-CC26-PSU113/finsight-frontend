import { motion } from "framer-motion";
import { PiggyBank, ArrowRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "../ui/Card";
import { useAppContext } from "../../context/AppContext";

const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);

/** Satu format persen di semua tempat (hindari 49.5% vs 50% karena pembulatan beda) */
const formatProgressPercent = (saved, target) => {
  const t = Number(target) || 0;
  const s = Number(saved) || 0;
  if (t <= 0) return "0.0";
  const pct = Math.min(100, (s / t) * 100);
  return pct.toFixed(1);
};

const progressValue = (saved, target) => {
  const t = Number(target) || 0;
  const s = Number(saved) || 0;
  if (t <= 0) return 0;
  return Math.min(100, (s / t) * 100);
};

export const SavingsOverviewWidget = () => {
  const { savingsGoals, savingsReady } = useAppContext();

  const totalTarget = savingsGoals.reduce((sum, g) => sum + Number(g.target_amount || 0), 0);
  const totalSaved = savingsGoals.reduce((sum, g) => sum + Number(g.saved_amount || 0), 0);
  const totalRemaining = Math.max(0, totalTarget - totalSaved);
  const overallProgress = progressValue(totalSaved, totalTarget);

  const topGoals = [...savingsGoals]
    .sort((a, b) => Number(b.saved_amount || 0) - Number(a.saved_amount || 0))
    .slice(0, 3);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="h-full">
      <Card className="h-full flex flex-col hover:shadow-float transition-all duration-300 border-none shadow-sm ring-1 ring-slate-100">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-sky-50 rounded-lg text-sky-600 shrink-0">
            <PiggyBank className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-slate-900">Ringkasan Tabungan</h3>
            <p className="text-sm text-slate-500">Overview tujuan tabungan Anda dari fitur Tabungan.</p>
          </div>
        </div>

        {!savingsReady ? (
          <p className="text-sm text-slate-400 py-6 text-center">Memuat data tabungan...</p>
        ) : savingsGoals.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-4 gap-3">
            <p className="text-sm text-slate-500">Belum ada tujuan tabungan. Buat target pertama untuk mulai menabung.</p>
            <Link to="/savings" className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl transition-colors">
              <Plus className="w-4 h-4" />
              Buat Tujuan Tabungan
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Terkumpul</p>
                <p className="text-base font-bold text-primary-700 mt-0.5">{formatCurrency(totalSaved)}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Target</p>
                <p className="text-base font-bold text-slate-900 mt-0.5">{formatCurrency(totalTarget)}</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-xs text-slate-600 mb-1.5">
                <span>Progres keseluruhan</span>
                <span className="font-semibold">{formatProgressPercent(totalSaved, totalTarget)}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-primary-600 rounded-full transition-all"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1.5 text-right">Sisa menuju target: {formatCurrency(totalRemaining)}</p>
            </div>

            <div className="space-y-3 flex-1 min-h-0">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {savingsGoals.length} tujuan aktif
              </p>
              {topGoals.map((goal) => {
                const target = Number(goal.target_amount || 0);
                const saved = Number(goal.saved_amount || 0);
                const progress = progressValue(saved, target);

                return (
                  <div key={goal.id} className="space-y-1">
                    <div className="flex justify-between gap-2 text-sm">
                      <span className="font-medium text-slate-800 truncate">{goal.name}</span>
                      <span className="text-xs text-slate-500 shrink-0">{formatProgressPercent(saved, target)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                );
              })}
              {savingsGoals.length > 3 && (
                <p className="text-xs text-slate-400">+{savingsGoals.length - 3} tujuan lainnya</p>
              )}
            </div>

            <Link
              to="/savings"
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-colors"
            >
              Kelola Tabungan
              <ArrowRight className="w-4 h-4" />
            </Link>
          </>
        )}
      </Card>
    </motion.div>
  );
};
