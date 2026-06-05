import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { useAppContext } from '../../context/AppContext';

export const HeroInsight = () => {
  const { insights } = useAppContext();
  const topInsight = insights[0] || { title: "Terlihat bagus!", description: "Keuangan Anda sesuai rencana.", type: "positive" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-ai-dark border-none text-white shadow-xl shadow-primary-500/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-ai-accent/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-ai-light mb-3">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-semibold tracking-wide uppercase">Asisten Keuangan AI</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              {topInsight.title}
            </h2>
            <p className="text-primary-100 text-base md:text-lg max-w-xl">
              {topInsight.description}
            </p>
          </div>
          
          {topInsight.action && topInsight.link && (
            <div className="shrink-0 w-full md:w-auto">
              <Link
                to={topInsight.link}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-ai-light text-ai-dark hover:bg-indigo-200 font-semibold text-sm rounded-xl transition-colors group"
              >
                {topInsight.action}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};
