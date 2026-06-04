import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { useAppContext } from "../../context/AppContext";
import { Building, Sparkles, ArrowRight, TrendingUp, Briefcase, BookOpen, Layers, Coins, Landmark } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const LiteInvestmentView = () => {
  const { investments, user } = useAppContext();
  const navigate = useNavigate();
  const [selectedEdu, setSelectedEdu] = useState(null);

  const educationContent = investments?.education || [];
  const portfolioValue = Number(investments?.portfolio?.value ?? user?.investment_portfolio_value ?? 0);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);

  return (
    <div className="space-y-6 md:space-y-8 max-w-5xl mx-auto">
      {/* 1. Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Blue Banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-2">
          <div className="bg-blue-600 rounded-2xl shadow-card p-5 sm:p-6 md:p-8 text-white h-full flex flex-col justify-between relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
              <TrendingUp className="w-64 h-64" />
            </div>
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold mb-4 backdrop-blur-sm">Market Update</span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 leading-tight max-w-lg">Waktunya Kembangkan Aset Kamu Hari Ini.</h2>
              <p className="text-blue-100 mb-0 max-w-md text-sm md:text-base leading-relaxed">IHSG terpantau menguat 0.5% hari ini. Cek portofolio kamu dan temukan peluang baru di pasar obligasi negara.</p>
            </div>
          </div>
        </motion.div>

        {/* Total Investment Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6 sm:p-8 h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <Building className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Total Investasi</p>
            <h3 className="text-3xl font-bold text-slate-900 mb-2">{formatCurrency(portfolioValue)}</h3>
            <p className="text-sm font-semibold text-green-500 flex items-center gap-1 text-center justify-center">
              <TrendingUp className="w-4 h-4" /> Portofolio yang sedang kamu bangun
            </p>
            <p className="text-xs text-slate-500 mt-3 max-w-xs">Pantau pertumbuhan asetmu dari satu angka total yang selalu terbarui.</p>
          </Card>
        </motion.div>
      </div>

      {/* 2. Middle Section: Categories */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Kategori Investasi</h2>
          <Button variant="outline" onClick={() => navigate("/investments/portfolio")} className="text-sm">
            Portofolio
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
          <CategoryCard title="Saham" desc="Pantau harga saham dan performa." icon={TrendingUp} onClick={() => navigate("/investments/stock")} />
          <CategoryCard title="Reksa Dana" desc="Lihat produk reksa dana berdasarkan profil risiko." icon={Layers} onClick={() => navigate("/investments/mutual_fund")} />
          <CategoryCard title="Obligasi" desc="SBN/ORI dan instrumen obligasi lainnya." icon={Landmark} onClick={() => navigate("/investments/bond")} />
          <CategoryCard title="Emas" desc="Harga emas dan tracking gram yang dimiliki." icon={Coins} onClick={() => navigate("/investments/gold")} />
        </div>
      </motion.div>

      {/* 3. Bottom Section: AI Summary & Education */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
          <div className="bg-slate-100/80 rounded-2xl p-5 sm:p-6 md:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 border border-slate-200/60">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="flex-grow text-center sm:text-left">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Rangkuman AI untuk Kamu</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4 sm:mb-0">Berdasarkan nilai portofolio yang tersimpan, kami bisa menyesuaikan rekomendasi dan edukasi investasi supaya tidak lagi bergantung pada angka dummy.</p>
            </div>
          </div>
        </motion.div>

        {/* Education Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-1">
          <Card className="p-6 h-full border-t-4 border-t-ai">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-ai" />
              Pusat Edukasi
            </h3>
            <div className="space-y-4">
              {educationContent.map((edu) => (
                <div key={edu.id} onClick={() => setSelectedEdu(edu)} className="p-4 bg-slate-50 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all cursor-pointer group">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Briefcase className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 mb-1 text-sm">{edu.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-2">{edu.desc}</p>
                      <span className="text-[11px] font-semibold text-blue-600 group-hover:underline flex items-center gap-1">Baca Selengkapnya &rarr;</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Education Detail Modal */}
      <Modal isOpen={selectedEdu !== null} onClose={() => setSelectedEdu(null)} title={selectedEdu?.title || "Artikel Edukasi"}>
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Artikel Investasi</p>
              <p className="text-xs text-slate-500">Estimasi waktu baca: 2 menit</p>
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-800 italic leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">"{selectedEdu?.desc}"</p>
          <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line space-y-2 pt-2">{selectedEdu?.content}</div>
          <div className="flex justify-end pt-4 border-t border-slate-100 mt-6">
            <Button onClick={() => setSelectedEdu(null)} className="rounded-xl py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm cursor-pointer">
              Selesai Membaca
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const CategoryCard = ({ title, desc, icon: Icon, onClick }) => {
  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className="bg-white rounded-2xl shadow-card border border-slate-100 p-6 hover:shadow-lg hover:border-primary-200 transition-all cursor-pointer text-left w-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-lg font-bold text-slate-900">{title}</div>
          <div className="text-sm text-slate-500 mt-1">{desc}</div>
        </div>
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 shrink-0">
          <Icon className="w-6 h-6 text-primary-600" />
        </div>
      </div>
      <div className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
        Lihat Produk <ArrowRight className="w-4 h-4" />
      </div>
    </div>
  );
};
