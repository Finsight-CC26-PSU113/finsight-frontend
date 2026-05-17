import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAppContext } from '../context/AppContext';
import { Sparkles, AlertTriangle, Lightbulb, Target, TrendingUp, ShieldAlert } from 'lucide-react';

export const InsightsPage = () => {
  const { insights } = useAppContext();

  // Categorize insights based on their type
  const alerts = insights.filter(i => i.type === 'alert');
  const recommendations = insights.filter(i => i.type === 'recommendation');
  const positives = insights.filter(i => i.type === 'positive');

  const getIcon = (type) => {
    switch(type) {
      case 'alert': return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      case 'recommendation': return <Lightbulb className="w-6 h-6 text-ai" />;
      case 'positive': return <Target className="w-6 h-6 text-green-500" />;
      case 'anomaly': return <ShieldAlert className="w-6 h-6 text-red-500" />;
      default: return <Sparkles className="w-6 h-6 text-primary-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-ai-dark to-primary-600 p-8 rounded-3xl text-white shadow-xl shadow-ai/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-ai-light mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-bold tracking-wider uppercase">FINSIGHT AI</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Kecerdasan Keuangan Anda</h1>
          <p className="text-primary-100 max-w-xl">
            Kami telah menganalisis pola pengeluaran, anggaran, dan transaksi terbaru Anda untuk memberikan rekomendasi personal.
          </p>
        </div>
        <div className="relative z-10 shrink-0 mt-4 md:mt-0">
          <Button variant="secondary" className="font-semibold text-ai-dark shadow-lg">
            Buat Laporan Baru
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Alerts & Anomalies */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            Tindakan Diperlukan
          </h2>
          
          <div className="space-y-4">
            {/* Hardcoded Anomaly Example for Demo */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  <div className="shrink-0 mt-1">
                    <div className="p-3 bg-red-50 rounded-full">
                      {getIcon('anomaly')}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold text-slate-900">Transaksi Ganda Terdeteksi</h3>
                      <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded-full">Prioritas Tinggi</span>
                    </div>
                    <p className="text-slate-600 mt-1 mb-4">
                      Kami mendeteksi dua tagihan identik sebesar Rp 159.000 untuk "Langganan Netflix" dalam waktu 48 jam. Ini mungkin merupakan kesalahan tagihan.
                    </p>
                    <div className="flex gap-3">
                      <Button variant="danger" size="sm">Laporkan Masalah</Button>
                      <Button variant="outline" size="sm">Abaikan</Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Dynamic Alerts from Context */}
            {alerts.map((alert, index) => (
              <motion.div key={alert.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + (index * 0.1) }}>
                <Card className="border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow">
                  <div className="flex gap-4">
                    <div className="shrink-0 mt-1">
                      <div className="p-3 bg-yellow-50 rounded-full">
                        {getIcon(alert.type)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900">{alert.title}</h3>
                      <p className="text-slate-600 mt-1 mb-4">{alert.description}</p>
                      {alert.action && (
                        <Button variant="outline" size="sm" className="border-yellow-200 hover:bg-yellow-50 hover:text-yellow-700">
                          {alert.action}
                        </Button>
                      )}
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
            <Card className="bg-slate-50 border-none">
              <h4 className="font-semibold text-slate-700 mb-2">Pengeluaran Akhir Pekan</h4>
              <p className="text-sm text-slate-500">65% dari pengeluaran opsional Anda terjadi antara Jumat malam dan Minggu.</p>
            </Card>
            <Card className="bg-slate-50 border-none">
              <h4 className="font-semibold text-slate-700 mb-2">Kebiasaan Ngopi</h4>
              <p className="text-sm text-slate-500">Anda menghabiskan rata-rata Rp 1.200.000/bulan di kedai kopi. Itu setara Rp 14.400.000 setahun.</p>
            </Card>
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
              <motion.div key={rec.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + (index * 0.1) }}>
                <Card className="bg-ai-light/30 border-ai/20 hover:border-ai/50 transition-colors">
                  <div className="flex gap-3 mb-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
                      {getIcon(rec.type)}
                    </div>
                    <h3 className="font-bold text-slate-900">{rec.title}</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">{rec.description}</p>
                  {rec.action && (
                    <Button variant="primary" size="sm" className="w-full bg-ai hover:bg-ai-dark text-white">
                      {rec.action}
                    </Button>
                  )}
                </Card>
              </motion.div>
            ))}

            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 pt-4">
              <Target className="w-5 h-5 text-green-500" />
              Sesuai Rencana
            </h2>

            {positives.map((pos, index) => (
              <motion.div key={pos.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + (index * 0.1) }}>
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
