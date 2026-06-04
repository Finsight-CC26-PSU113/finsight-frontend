import { motion } from "framer-motion";
import { Card } from "../ui/Card";
import { useAppContext } from "../../context/AppContext";
import { Sparkles, AlertTriangle, Lightbulb, Target, TrendingUp, ShieldAlert } from "lucide-react";

export const LiteInsightsView = () => {
  const { insights } = useAppContext();

  // Categorize insights based on their type
  const alerts = insights.filter((i) => i.type === "alert");
  const recommendations = insights.filter((i) => i.type === "recommendation");
  const positives = insights.filter((i) => i.type === "positive");

  const getIcon = (type) => {
    switch (type) {
      case "alert":
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      case "recommendation":
        return <Lightbulb className="w-6 h-6 text-ai" />;
      case "positive":
        return <Target className="w-6 h-6 text-green-500" />;
      case "anomaly":
        return <ShieldAlert className="w-6 h-6 text-red-500" />;
      default:
        return <Sparkles className="w-6 h-6 text-primary-500" />;
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-ai-dark to-primary-600 p-5 sm:p-6 md:p-8 rounded-3xl text-white shadow-xl shadow-ai/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-ai-light mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-bold tracking-wider uppercase">FINSIGHT AI</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Kecerdasan Keuangan Anda</h1>
          <p className="text-primary-100 max-w-xl">Kami telah menganalisis pola pengeluaran, anggaran, dan transaksi terbaru Anda untuk memberikan rekomendasi personal.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Left Column: Alerts & Anomalies */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            Tindakan Diperlukan
          </h2>

          <div className="space-y-4">
            {/* Dynamic Anomaly Alerts from Context */}
            {alerts.length === 0 && !insights.find(i => i.type === 'anomaly') && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-l-4 border-l-green-400 bg-green-50/50">
                  <div className="flex gap-4">
                    <div className="shrink-0 mt-1">
                      <div className="p-3 bg-green-100 rounded-full">
                        <ShieldAlert className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-green-900">Tidak Ada Anomali Terdeteksi</h3>
                      <p className="text-green-700 mt-1">Semua transaksi Anda terlihat normal. Sistem terus memantau pola pengeluaran Anda secara otomatis.</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Dynamic Alerts from Context */}
            {alerts.map((alert, index) => (
              <motion.div key={alert.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + index * 0.1 }}>
                <Card className="border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="shrink-0 mt-1">
                      <div className="p-3 bg-yellow-50 rounded-full">{getIcon(alert.type)}</div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900">{alert.title}</h3>
                      <p className="text-slate-600 mt-1">{alert.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mt-8 pt-4">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Perilaku Pengeluaran
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.length > 0 ? (
              insights.slice(0, 2).map((insight, idx) => (
                <Card key={idx} className="bg-slate-50 border-none">
                  <h4 className="font-semibold text-slate-700 mb-2">{insight.title}</h4>
                  <p className="text-sm text-slate-500">{insight.description}</p>
                </Card>
              ))
            ) : (
              <Card className="bg-slate-50 border-none md:col-span-2">
                <h4 className="font-semibold text-slate-700 mb-2">Belum Ada Data Pengeluaran</h4>
                <p className="text-sm text-slate-500">Tambahkan transaksi agar AI dapat menganalisis pola pengeluaran Anda secara personal.</p>
              </Card>
            )}
          </div>
        </div>

        {/* Right Column: Recommendations & Positives */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-ai" />
            Rekomendasi
          </h2>

          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <motion.div key={rec.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + index * 0.1 }}>
                <Card className="bg-ai-light/30 border-ai/20 hover:border-ai/50 transition-colors">
                  <div className="flex gap-3 mb-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">{getIcon(rec.type)}</div>
                    <h3 className="font-bold text-slate-900">{rec.title}</h3>
                  </div>
                  <p className="text-sm text-slate-600">{rec.description}</p>
                </Card>
              </motion.div>
            ))}

            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 pt-4">
              <Target className="w-5 h-5 text-green-500" />
              Sesuai Rencana
            </h2>

            {positives.map((pos, index) => (
              <motion.div key={pos.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + index * 0.1 }}>
                <Card className="border border-green-100 bg-gradient-to-b from-white to-green-50/50">
                  <div className="flex items-center gap-3 mb-2">
                    {getIcon(pos.type)}
                    <h3 className="font-bold text-slate-900">{pos.title}</h3>
                  </div>
                  <p className="text-sm text-slate-600">{pos.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
