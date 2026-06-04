import React from "react";
import { Card } from "../ui/Card";
import { useAppContext } from "../../context/AppContext";
import { motion } from "framer-motion";
import { Sparkles, AlertTriangle, Lightbulb, Target } from "lucide-react";

export const AiRecommendationFeed = () => {
  const { insights } = useAppContext();

  // Filter out alerts since we have a dedicated Anomaly Detection widget
  const feedInsights = insights.filter((insight) => insight.type !== "alert");

  const getIcon = (type) => {
    switch (type) {
      case "recommendation":
        return <Lightbulb className="w-5 h-5 text-ai" />;
      case "alert":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case "positive":
        return <Target className="w-5 h-5 text-green-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-primary-500" />;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900 px-1">Insight AI</h3>

      {feedInsights.length === 0 ? (
        <Card className="border-dashed border-slate-200 bg-slate-50/80">
          <p className="text-sm text-slate-700 mb-2">Hai! Saat ini belum ada insight AI yang tersedia untuk akunmu.</p>
          <p className="text-sm text-slate-500">Tambah beberapa transaksi atau sinkronkan akunmu supaya FINSIGHT dapat menganalisis aktivitas dan memberikan rekomendasi khusus.</p>
        </Card>
      ) : (
        feedInsights.map((insight, index) => (
          <motion.div key={insight.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + index * 0.1 }}>
            <Card className="hover:border-ai/30 transition-colors cursor-pointer group">
              <div className="flex gap-4">
                <div className="shrink-0 mt-1">
                  <div className={`p-2 rounded-full ${insight.type === "positive" ? "bg-green-50" : insight.type === "alert" ? "bg-red-50" : "bg-ai-light"}`}>{getIcon(insight.type)}</div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 group-hover:text-ai transition-colors">{insight.title}</h4>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">{insight.description}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))
      )}
    </motion.div>
  );
};
