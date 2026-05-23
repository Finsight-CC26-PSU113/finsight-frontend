import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { 
  Building, 
  Banknote, 
  Gem, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  Briefcase,
  BookOpen
} from 'lucide-react';

const formatCurrency = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(val);
};

const investmentProducts = [
  {
    id: 'sbr',
    icon: Building,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
    badgeText: 'Rendah',
    badgeColor: 'text-blue-600 bg-blue-50',
    borderColor: 'border-b-blue-600',
    title: 'SBR (Savings Bond Ritel)',
    desc: 'Surat Berharga Negara dengan kupon mengambang.',
    detail1Label: 'EST. RETURN',
    detail1Value: '6.40% p.a',
    detail2Label: 'TENOR',
    detail2Value: '2 Tahun',
    fullDesc: 'Surat Berharga Negara (SBN) ritel yang diterbitkan oleh Pemerintah Indonesia khusus untuk warga negara Indonesia. Produk ini dijamin 100% aman oleh undang-undang, sehingga hampir bebas risiko gagal bayar. Sangat direkomendasikan untuk diversifikasi pasif jangka panjang Anda.',
    minPurchase: 'Rp 1.000.000',
    riskLevel: 'Rendah',
    features: [
      'Imbal hasil berupa kupon bulanan yang langsung masuk rekening.',
      'Likuiditas terjamin dengan opsi Early Redemption (pencairan awal setelah 1 tahun).',
      'Membantu pembiayaan pembangunan infrastruktur negara secara langsung.'
    ]
  },
  {
    id: 'rdpu',
    icon: Banknote,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-50',
    badgeText: 'Rendah',
    badgeColor: 'text-green-600 bg-green-50',
    borderColor: 'border-b-green-400',
    title: 'RDPU',
    desc: 'Reksa Dana Pasar Uang. Likuiditas tinggi & stabil.',
    detail1Label: 'EST. RETURN',
    detail1Value: '4.85% p.a',
    detail2Label: 'MIN. BELI',
    detail2Value: 'Rp 10.000',
    fullDesc: 'Reksa Dana Pasar Uang menginvestasikan dana Anda ke instrumen pasar uang berjangka pendek kurang dari 1 tahun, seperti deposito bank berkualitas tinggi dan surat berharga pasar uang. Sangat aman dan stabil untuk parkir dana darurat.',
    minPurchase: 'Rp 10.000',
    riskLevel: 'Rendah',
    features: [
      'Fleksibilitas pencairan harian tanpa penalti.',
      'Nilai aset bersih (NAB) tumbuh stabil setiap hari tanpa fluktuasi tajam.',
      'Tanpa minimum jangka waktu penahanan dana.'
    ]
  },
  {
    id: 'emas',
    icon: Gem,
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-50',
    badgeText: 'Sedang',
    badgeColor: 'text-orange-600 bg-orange-50',
    borderColor: 'border-b-orange-300',
    title: 'Emas Digital',
    desc: 'Investasi fisik emas secara digital. Lindung nilai inflasi.',
    detail1Label: 'PERGERAKAN',
    detail1Value: '+8.2% / thn',
    detail2Label: 'HARGA BELI',
    detail2Value: 'Rp 1.120k/g',
    fullDesc: 'Investasi emas fisik murni 24 karat yang disimpan secara aman di brankas bersertifikat (seperti ANTAM atau Pegadaian), namun dikelola dan ditransaksikan secara digital mulai dari Rp 10.000. Sangat baik sebagai pelindung nilai (hedge) terhadap inflasi jangka panjang.',
    minPurchase: 'Rp 10.000',
    riskLevel: 'Sedang',
    features: [
      'Emas fisik dapat dicetak dan dikirim ke rumah Anda jika gramasi mencukupi.',
      'Harga emas terupdate secara real-time mengikuti pergerakan pasar global.',
      'Lindung nilai yang terbukti stabil saat kondisi pasar ekonomi mengalami ketidakpastian.'
    ]
  }
];

const educationContent = [
  {
    id: 1,
    title: "Apa itu Diversifikasi?",
    desc: "Strategi membagi modal ke berbagai aset untuk mengurangi risiko.",
    content: "Diversifikasi adalah praktik menyebarkan investasi Anda ke berbagai instrumen keuangan, industri, dan kategori lainnya. Tujuannya adalah untuk memaksimalkan pengembalian dengan berinvestasi di berbagai area yang masing-masing akan bereaksi secara berbeda terhadap peristiwa pasar yang sama.\n\nDengan membagi investasi ke berbagai kelas aset seperti saham, obligasi, reksa dana, dan emas, jika satu aset mengalami penurunan nilai, aset lainnya dapat mengimbangi kerugian tersebut. Ini adalah pilar dasar dalam manajemen risiko portofolio keuangan premium."
  },
  {
    id: 2,
    title: "Kekuatan Compounding",
    desc: "Bagaimana bunga berbunga membuat aset Anda tumbuh eksponensial.",
    content: "Compounding effect (efek bunga berbunga) adalah proses di mana nilai investasi Anda tumbuh secara eksponensial karena Anda menghasilkan keuntungan atas keuntungan investasi sebelumnya, selain atas modal awal.\n\nSebagai contoh, jika Anda menginvestasikan Rp 10.000.000 dengan imbal hasil 10% per tahun, di akhir tahun pertama investasi Anda bernilai Rp 11.000.000. Di tahun kedua, imbal hasil 10% dihitung dari Rp 11.000.000 (bukan Rp 10.000.000 awal), menghasilkan Rp 12.100.000. Seiring berjalannya waktu (10, 20, atau 30 tahun), efek ini akan menghasilkan pelipatgandaan kekayaan yang luar biasa. Kunci utamanya adalah memulai sedini mungkin!"
  }
];

export const InvestmentPage = () => {
  const [selectedEdu, setSelectedEdu] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* 1. Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Blue Banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-2">
          <div className="bg-blue-600 rounded-2xl shadow-card p-6 md:p-8 text-white h-full flex flex-col justify-between relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
              <TrendingUp className="w-64 h-64" />
            </div>
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold mb-4 backdrop-blur-sm">
                Market Update
              </span>
              <h2 className="text-2xl md:text-3xl font-bold mb-3 leading-tight max-w-lg">
                Waktunya Kembangkan Aset Kamu Hari Ini.
              </h2>
              <p className="text-blue-100 mb-0 max-w-md text-sm md:text-base leading-relaxed">
                IHSG terpantau menguat 0.5% hari ini. Cek portofolio kamu dan temukan peluang baru di pasar obligasi negara.
              </p>
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
            <h3 className="text-3xl font-bold text-slate-900 mb-2">Rp 42.850.000</h3>
            <p className="text-sm font-semibold text-green-500 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" /> +12.4% (Thn ini)
            </p>
          </Card>
        </motion.div>

      </div>

      {/* 2. Middle Section: Products */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Produk Investasi Pilihan</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {investmentProducts.map((product) => (
            <Card key={product.id} className={`p-6 flex flex-col h-full border-b-4 ${product.borderColor} hover:shadow-lg transition-shadow`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl ${product.iconBg} flex items-center justify-center`}>
                  <product.icon className={`w-6 h-6 ${product.iconColor}`} />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${product.badgeColor}`}>
                  {product.badgeText}
                </span>
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

              <Button 
                variant="outline" 
                fullWidth 
                onClick={() => setSelectedProduct(product)}
                className="text-blue-600 border-blue-200 hover:bg-blue-50 font-semibold group cursor-pointer"
              >
                Lihat Detail <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* 3. Bottom Section: AI Summary & Education */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
          <div className="bg-slate-100/80 rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 border border-slate-200/60">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="flex-grow text-center sm:text-left">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Rangkuman AI untuk Kamu</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4 sm:mb-0">
                Berdasarkan profil risiko "Moderat", kami menyarankan penambahan alokasi pada <strong className="text-slate-900">SBR013</strong> yang akan segera rilis untuk mengamankan passive income jangka panjang Anda.
              </p>
            </div>
            <div className="shrink-0 w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                Detail Analisis
              </Button>
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
                <div 
                  key={edu.id} 
                  onClick={() => setSelectedEdu(edu)}
                  className="p-4 bg-slate-50 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Briefcase className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 mb-1 text-sm">{edu.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-2">{edu.desc}</p>
                      <span className="text-[11px] font-semibold text-blue-600 group-hover:underline flex items-center gap-1">
                        Baca Selengkapnya &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

      </div>

      {/* Education Detail Modal */}
      <Modal
        isOpen={selectedEdu !== null}
        onClose={() => setSelectedEdu(null)}
        title={selectedEdu?.title || "Artikel Edukasi"}
      >
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
          <p className="text-sm font-semibold text-slate-800 italic leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
            "{selectedEdu?.desc}"
          </p>
          <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line space-y-2 pt-2">
            {selectedEdu?.content}
          </div>
          <div className="flex justify-end pt-4 border-t border-slate-100 mt-6">
            <Button 
              onClick={() => setSelectedEdu(null)}
              className="rounded-xl py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm cursor-pointer"
            >
              Selesai Membaca
            </Button>
          </div>
        </div>
      </Modal>

      {/* Product Detail Modal */}
      <Modal
        isOpen={selectedProduct !== null}
        onClose={() => setSelectedProduct(null)}
        title={selectedProduct?.title || "Detail Produk Investasi"}
      >
        <div className="space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            {selectedProduct && (
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${selectedProduct.iconBg}`}>
                <selectedProduct.icon className={`w-6 h-6 ${selectedProduct.iconColor}`} />
              </div>
            )}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Informasi Instrumen</p>
              <h4 className="font-bold text-slate-900 text-sm leading-snug">{selectedProduct?.title}</h4>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Estimasi Imbal Hasil</p>
              <p className="font-bold text-green-600 text-sm">{selectedProduct?.detail1Value}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Tingkat Risiko</p>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-0.5 ${selectedProduct?.badgeColor}`}>
                {selectedProduct?.riskLevel}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200/50">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{selectedProduct?.detail2Label}</p>
              <p className="font-bold text-slate-900 text-sm">{selectedProduct?.detail2Value}</p>
            </div>
            <div className="pt-2 border-t border-slate-200/50">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Minimum Pembelian</p>
              <p className="font-bold text-slate-900 text-sm">{selectedProduct?.minPurchase}</p>
            </div>
          </div>

          <div>
            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Deskripsi Produk</h5>
            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              {selectedProduct?.fullDesc}
            </p>
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
            <Button 
              onClick={() => setSelectedProduct(null)}
              className="rounded-xl py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm cursor-pointer"
            >
              Tutup Detail
            </Button>
          </div>
        </div>
      </Modal>
      
    </div>
  );
};
