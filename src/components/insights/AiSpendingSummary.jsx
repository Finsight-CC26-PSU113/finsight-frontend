import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw, Bot } from "lucide-react";
import { Card } from "../ui/Card";
import { apiRequest } from "../../utils/apiClient";
import { useAppContext } from "../../context/AppContext";

export const AiSpendingSummary = () => {
  const { authToken } = useAppContext();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetched, setFetched] = useState(false);

  const fetchSummary = async () => {
    if (!authToken) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest("/api/ai/spending-summary", { token: authToken });
      setSummary(res?.data?.summary || null);
      setFetched(true);
    } catch {
      setError("Gagal memuat ringkasan AI. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="relative overflow-hidden border border-ai/20 bg-gradient-to-br from-ai-dark via-primary-800 to-primary-900 text-white p-6 shadow-xl shadow-ai/20">
      {/* Decorative blobs */}
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Bot className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-200/80">Gemini AI</p>
              <h3 className="text-base font-bold leading-tight">Ringkasan Keuangan Bulan Ini</h3>
            </div>
          </div>

          <button
            onClick={fetchSummary}
            disabled={loading}
            className="shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            {fetched ? "Perbarui" : "Analisis"}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4">
              <div className="flex items-center gap-2 text-sm text-cyan-200/70">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>Menganalisis data keuangan kamu...</span>
              </div>
              <div className="mt-3 space-y-2">
                {[100, 80, 90].map((w, i) => (
                  <div key={i} className={`h-3 bg-white/10 rounded-full animate-pulse`} style={{ width: `${w}%` }} />
                ))}
              </div>
            </motion.div>
          )}

          {!loading && error && (
            <motion.p key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-sm text-red-300">
              {error}
            </motion.p>
          )}

          {!loading && summary && (
            <motion.p
              key="summary"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-4 text-sm leading-relaxed text-slate-100/90"
            >
              {summary}
            </motion.p>
          )}

          {!loading && !fetched && !error && (
            <motion.div key="prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
              <p className="text-sm text-slate-300/70 leading-relaxed">
                Klik <strong className="text-white">Analisis</strong> untuk mendapatkan ringkasan keuangan personal bulan ini dari Gemini AI — berdasarkan transaksi, budget, dan tujuan tabungan kamu.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
};
