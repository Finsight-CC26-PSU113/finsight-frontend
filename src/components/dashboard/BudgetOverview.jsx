import { motion } from 'framer-motion'
import { budgetData } from '../../utils/mockData'

export default function BudgetOverview() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm"
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Budget Overview</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">Progress anggaran</h3>
        </div>
        <span className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">7 kategori</span>
      </div>
      <div className="space-y-5">
        {budgetData.map((item) => (
          <div key={item.id} className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-900">{item.category}</p>
                <p className="text-sm text-slate-500">{item.usedLabel} dari {item.limitLabel} digunakan</p>
              </div>
              <span className={`inline-flex rounded-2xl px-3 py-1 text-sm font-semibold ${item.statusTextClass}`}>{item.status}</span>
            </div>
            <div className="mt-4 rounded-full bg-slate-200/80 p-1">
              <div className={`h-3 rounded-full ${item.fillClass}`} style={{ width: `${item.percent}%` }} />
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  )
}
