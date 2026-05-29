import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { useAppContext } from "../context/AppContext";
import { Building, Banknote, Gem, Sparkles, ArrowRight, TrendingUp, Briefcase, BookOpen } from "lucide-react";

const iconMap = {
  sbr: Building,
  rdpu: Banknote,
  emas: Gem,
};

export const InvestmentPage = () => {
  const { investments, user, updateProfile } = useAppContext();
  const [selectedEdu, setSelectedEdu] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [portfolioDraft, setPortfolioDraft] = useState("");
  const [isSavingPortfolio, setIsSavingPortfolio] = useState(false);

  const investmentProducts = investments?.products || [];
  const educationContent = investments?.education || [];
  const portfolioValue = Number(investments?.portfolio?.value ?? user?.investment_portfolio_value ?? 0);
  const hasPortfolio = portfolioValue > 0;

  useEffect(() => {
    setPortfolioDraft(hasPortfolio ? String(portfolioValue) : "");
  }, [hasPortfolio, portfolioValue]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);

  const handlePortfolioSave = async (event) => {
    event.preventDefault();

    const parsedValue = Number(portfolioDraft);
    if (Number.isNaN(parsedValue) || parsedValue < 0) {
      window.alert("Masukkan nilai portofolio yang valid.");
      return;
    }

    try {
      setIsSavingPortfolio(true);
      await updateProfile({ investment_portfolio_value: parsedValue });
    } catch (error) {
      window.alert(error.message || "Gagal menyimpan portofolio investasi");
    } finally {
      setIsSavingPortfolio(false);
    }
  };

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
          <Card className="p-8 h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <Building className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Total Investasi</p>
            {hasPortfolio ? (
              <>
                <h3 className="text-3xl font-bold text-slate-900 mb-2">{formatCurrency(portfolioValue)}</h3>
                <p className="text-sm font-semibold text-green-500 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" /> Tersimpan di profil kamu
                </p>
              </>
            ) : (
              <form className="w-full space-y-3" onSubmit={handlePortfolioSave}>
                <div className="text-left">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Masukkan total portofolio</label>
                  <input type="number" min="0" value={portfolioDraft} onChange={(e) => setPortfolioDraft(e.target.value)} placeholder="0" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <Button type="submit" fullWidth className="bg-blue-600 hover:bg-blue-700" disabled={isSavingPortfolio}>
                  {isSavingPortfolio ? "Menyimpan..." : "Simpan Portofolio"}
                </Button>
                <p className="text-xs text-slate-500">Masukkan nilai portofolio aktual yang ingin kamu pantau.</p>
              </form>
            )}
          </Card>
        </motion.div>
      </div>

      {/* 2. Middle Section: Products */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Produk Investasi Pilihan</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {investmentProducts.map((product) => (
            <Card key={product.id} className={`p-6 flex flex-col h-full border-b-4 ${product.borderColor} hover:shadow-lg transition-shadow`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl ${product.iconBg} flex items-center justify-center`}>{React.createElement(iconMap[product.id] || Building, { className: `w-6 h-6 ${product.iconColor}` })}</div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${product.badgeColor}`}>{product.badgeText}</span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-2">{product.title}</h3>
              <p className="text-slate-500 text-sm mb-6 flex-grow">{product.desc}</p>

              <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{product.detail1Label}</p>
                  <p className="font-bold text-green-600">{product.detail1Value}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{product.detail2Label}</p>
                  <p className="font-bold text-slate-900">{product.detail2Value}</p>
                </div>
              </div>

              <Button variant="outline" fullWidth onClick={() => setSelectedProduct(product)} className="text-blue-600 border-blue-200 hover:bg-blue-50 font-semibold group cursor-pointer">
                Lihat Detail <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Card>
          ))}
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
            <div className="shrink-0 w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">Detail Analisis</Button>
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

      {/* Product Detail Modal */}
      <Modal isOpen={selectedProduct !== null} onClose={() => setSelectedProduct(null)} title={selectedProduct?.title || "Detail Produk Investasi"}>
        <div className="space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            {selectedProduct && <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${selectedProduct.iconBg}`}>{React.createElement(iconMap[selectedProduct.id] || Building, { className: `w-6 h-6 ${selectedProduct.iconColor}` })}</div>}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Informasi Instrumen</p>
              <h4 className="font-bold text-slate-900 text-sm leading-snug">{selectedProduct?.title}</h4>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Estimasi Imbal Hasil</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Tingkat Risiko</p>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-0.5 ${selectedProduct?.badgeColor}`}>{selectedProduct?.riskLevel}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Min. Pembelian</span>
              <span className="text-lg font-bold text-slate-900">{selectedProduct?.minPurchase}</span>
            </div>
          </div>

          <div>
            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Deskripsi Produk</h5>
            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">{selectedProduct?.fullDesc}</p>
          </div>

          {selectedProduct?.features && (
            <div>
              <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Keunggulan & Fitur Utama</h5>
              <ul className="space-y-2 text-xs text-slate-600 pl-5 list-disc leading-relaxed">
                {selectedProduct.features.map((feat, index) => (
                  <li key={index}>{feat}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-slate-100 mt-6">
            <Button onClick={() => setSelectedProduct(null)} className="rounded-xl py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm cursor-pointer">
              Tutup Detail
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
