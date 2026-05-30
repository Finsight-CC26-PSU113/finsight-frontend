import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Target, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { useAppContext } from "../../context/AppContext";

const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);

export const FinancialGoalWidget = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAppContext();

  const recommendedTarget = Math.max(Number(user.monthlyExpenses || 0) * 6, 0);
  const [goalName, setGoalName] = useState(user.financial_goal_name || "Dana Darurat");
  const [goalTarget, setGoalTarget] = useState(user.financial_goal_target ? String(user.financial_goal_target) : recommendedTarget > 0 ? String(recommendedTarget) : "");
  const [goalSaved, setGoalSaved] = useState(user.financial_goal_saved ? String(user.financial_goal_saved) : "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const nextRecommendedTarget = Math.max(Number(user.monthlyExpenses || 0) * 6, 0);
    setGoalName(user.financial_goal_name || "Dana Darurat");
    setGoalTarget(user.financial_goal_target ? String(user.financial_goal_target) : nextRecommendedTarget > 0 ? String(nextRecommendedTarget) : "");
    setGoalSaved(user.financial_goal_saved ? String(user.financial_goal_saved) : "");
  }, [user.financial_goal_name, user.financial_goal_target, user.financial_goal_saved, user.monthlyExpenses]);

  const targetAmount = Number(user.financial_goal_target || goalTarget || recommendedTarget || 0);
  const savedAmount = Number(user.financial_goal_saved || 0);
  const progress = targetAmount > 0 ? Math.min(100, (savedAmount / targetAmount) * 100) : 0;

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      setIsSaving(true);
      await updateProfile({
        financial_goal_name: goalName,
        financial_goal_target: goalTarget === "" ? null : Number(goalTarget),
        financial_goal_saved: goalSaved === "" ? null : Number(goalSaved),
      });
    } catch (error) {
      window.alert(error.message || "Gagal menyimpan tujuan keuangan");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="h-full">
      <Card className="h-full flex flex-col hover:shadow-float transition-all duration-300 border-none shadow-sm ring-1 ring-slate-100">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-primary-50 rounded-lg text-primary-600 shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-slate-900">Tujuan Keuangan</h3>
            <p className="text-sm text-slate-500">Dana darurat yang sehat biasanya setara 3-6 bulan pengeluaran pokok.</p>
          </div>
        </div>

        <form className="space-y-3 flex-1" onSubmit={handleSave}>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nama tujuan</label>
            <input value={goalName} onChange={(event) => setGoalName(event.target.value)} type="text" placeholder="Dana Darurat" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Target</label>
              <input value={goalTarget} onChange={(event) => setGoalTarget(event.target.value)} type="number" min="0" placeholder={recommendedTarget > 0 ? String(recommendedTarget) : "0"} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Tersimpan</label>
              <input value={goalSaved} onChange={(event) => setGoalSaved(event.target.value)} type="number" min="0" placeholder="0" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
          </div>

          <div className="pt-1">
            <div className="flex justify-between items-end mb-2 gap-3">
              <span className="text-sm font-medium text-slate-700 truncate">{goalName || "Dana Darurat"}</span>
              <span className="text-sm font-bold text-slate-900 whitespace-nowrap">{targetAmount > 0 ? formatCurrency(targetAmount) : "Belum diatur"}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
              <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-xs text-slate-500 text-right">{targetAmount > 0 ? `Tercapai ${progress.toFixed(0)}%` : "Gunakan target 3-6 bulan pengeluaran untuk dana darurat."}</p>
          </div>

          <div className="pt-1 flex flex-col gap-2">
            <Button type="submit" fullWidth className="bg-primary-600 hover:bg-primary-700" disabled={isSaving}>
              {isSaving ? "Menyimpan..." : "Simpan Tujuan"}
            </Button>
            <Button type="button" variant="ghost" fullWidth onClick={() => navigate("/budget")} className="flex items-center justify-center gap-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50">
              Kelola di Anggaran
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
};
