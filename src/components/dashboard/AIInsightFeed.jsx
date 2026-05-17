import { motion } from 'framer-motion'
import { Star, AlertTriangle, TrendingUp, Sparkles } from 'lucide-react'
import { insightsData } from '../../utils/mockData'

const iconMapper = {
  recommendation: Star,
  anomaly: AlertTriangle,
  behavior: TrendUp,
  suggestion: Sparkles,
}

export default function AIInsightFeed() {
  return (
    <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-4">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">AI Insight Feed</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">Rekomendasi keuangan pintar</h3>
            </div>
            <span className="rounded-2xl bg-slate-50 px-4 py-2 text-sm text-slate-600">Realtime update</span>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {insightsData.map((item) => {
            const Icon = iconMapper[item.type]
            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: item.id * 0.08 }}
                className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm hover:border-blue-300/40 hover:shadow-xl"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br ${item.color} text-white shadow-lg`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {item.label}
                  </span>
                </div>
                <h4 className="mt-5 text-lg font-semibold text-slate-900">{item.title}</h4>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
              </motion.article>
            )
          })}
        </div>
      </div>
      <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-cyan-50 p-6 shadow-sm">
        <div className="rounded-3xl bg-slate-900/95 p-6 text-white shadow-xl">
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-200/80">AI Recommendation</p>
          <h4 className="mt-4 text-2xl font-semibold">Konsolidasi pengeluaran sekarang</h4>
          <p className="mt-4 text-sm leading-7 text-slate-200/90">
            FinSight merekomendasikan 3 kategori untuk pengurangan otomatis dan alokasi ulang sisa budget ke tabungan darurat.
          </p>
          <div className="mt-6 rounded-3xl bg-white/10 p-4 ring-1 ring-white/10">
            <div className="flex items-center justify-between text-sm text-slate-200">
              <span>Cash flow health</span>
              <span className="font-semibold text-white">Stabil</span>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800/40">
              <div className="h-full w-3/4 rounded-full bg-cyan-300 shadow-lg shadow-cyan-500/30" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
