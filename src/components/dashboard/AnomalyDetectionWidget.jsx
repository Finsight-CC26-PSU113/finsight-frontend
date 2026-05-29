import React from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";

export const AnomalyDetectionWidget = () => {
  const navigate = useNavigate();
  const { insights, transactions } = useAppContext();

  const alertInsight = insights.find((insight) => insight.type === "alert");
  const anomalyTransaction = transactions.find((transaction) => transaction.is_anomaly);
  const hasSignal = Boolean(alertInsight || anomalyTransaction);
  const title = hasSignal ? "Deteksi Anomali" : "Monitoring Transaksi";
  const severityLabel = hasSignal ? "Tinggi" : "Rendah";
  const description = alertInsight?.description || (anomalyTransaction ? `${anomalyTransaction.title} terdeteksi sebagai transaksi tidak biasa pada kategori ${anomalyTransaction.category}.` : "Belum ada anomali yang terdeteksi dari transaksi terbaru Anda.");
  const buttonLabel = hasSignal ? "Tinjau Anggaran" : "Lihat Transaksi";
  const handleNavigation = () => {
    navigate(hasSignal ? "/budget" : "/transactions");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
      <Card className="bg-red-50/80 border-red-100 shadow-sm relative overflow-hidden group">
        <div className="absolute right-0 top-0 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
          <AlertTriangle className="w-32 h-32 text-red-500" />
        </div>

        <div className="flex gap-4 relative z-10">
          <div className="shrink-0 mt-1">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-red-900">{title}</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-200 text-red-800 uppercase tracking-wider">{severityLabel}</span>
            </div>
            <p className="text-sm text-red-700/80 mb-3 leading-relaxed">{description}</p>
            <button onClick={handleNavigation} className="text-red-700 font-semibold text-sm hover:text-red-800 flex items-center gap-1 group-hover:gap-2 transition-all">
              {buttonLabel}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
