import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'

export default function FloatingActionButton() {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-4 text-white shadow-2xl shadow-cyan-500/20 transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-cyan-300/60 md:bottom-8 md:right-8"
      aria-label="Tambah transaksi"
    >
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white shadow-lg shadow-cyan-500/20">
        <Plus className="h-5 w-5" />
      </span>
      <span className="font-semibold">Tambah Transaksi</span>
    </motion.button>
  )
}
