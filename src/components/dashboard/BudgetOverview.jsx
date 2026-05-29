import { motion } from "framer-motion";
import { useAppContext } from "../../context/AppContext";

const getStatusMeta = (percent) => {
  if (percent >= 100) {
    return {
      status: "Over budget",
      statusTextClass: "bg-rose-100 text-rose-700",
      fillClass: "bg-rose-500",
    };
  }

  if (percent >= 90) {
    return {
      status: "Warning",
      statusTextClass: "bg-amber-100 text-amber-700",
      fillClass: "bg-amber-500",
    };
  }

  if (percent >= 70) {
    return {
      status: "Nearly full",
      statusTextClass: "bg-amber-100 text-amber-700",
      fillClass: "bg-amber-500",
    };
  }

  return {
    status: "On track",
    statusTextClass: "bg-emerald-100 text-emerald-700",
    fillClass: "bg-emerald-500",
  };
};

export default function BudgetOverview() {
  const { budgets } = useAppContext();
  const visibleBudgets = budgets.slice(0, 7);

  return (
    <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Budget Overview</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">Progress anggaran</h3>
        </div>
        <span className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">{visibleBudgets.length} kategori</span>
      </div>
      <div className="space-y-5">
        {visibleBudgets.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200/80 bg-slate-50 p-5 text-sm text-slate-500">Belum ada budget yang tersambung dari backend.</div>
        ) : (
          visibleBudgets.map((item) => {
            const percent = item.percent ?? (item.total > 0 ? Math.round((item.spent / item.total) * 100) : 0);
            const statusMeta = getStatusMeta(percent);

            return (
              <div key={item.id} className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{item.category}</p>
                    <p className="text-sm text-slate-500">
                      {item.spent.toLocaleString("id-ID")} dari {item.total.toLocaleString("id-ID")} digunakan
                    </p>
                  </div>
                  <span className={`inline-flex rounded-2xl px-3 py-1 text-sm font-semibold ${statusMeta.statusTextClass}`}>{statusMeta.status}</span>
                </div>
                <div className="mt-4 rounded-full bg-slate-200/80 p-1">
                  <div className={`h-3 rounded-full ${statusMeta.fillClass}`} style={{ width: `${Math.min(percent, 100)}%` }} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.section>
  );
}
