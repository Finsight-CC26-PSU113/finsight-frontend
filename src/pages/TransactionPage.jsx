import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useAppContext } from '../context/AppContext';
import { 
  Search, Plus, Tv, ShoppingCart, Briefcase, Coffee, Zap, 
  Trash2, Utensils, ShoppingBag, Car, Heart, BookOpen, 
  Plane, HelpCircle, ArrowUpRight, ArrowDownRight, SlidersHorizontal, 
  Calendar, Wallet, Sparkles, Check
} from 'lucide-react';

export const TransactionPage = () => {
  const { 
    transactions, 
    deleteTransaction, 
    openAddTxModal, 
    globalSearchTerm, 
    setGlobalSearchTerm 
  } = useAppContext();
  
  const [filter, setFilter] = useState('all'); // all, income, expense
  const [showExtraFilters, setShowExtraFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc'); // date-desc, date-asc, amount-desc, amount-asc
  const [selectedMonth, setSelectedMonth] = useState('all'); // e.g. "2026-05", "all"

  // Confirmation and Success Notification States
  const [txToDelete, setTxToDelete] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleConfirmDelete = () => {
    if (txToDelete) {
      deleteTransaction(txToDelete.id);
      setToastMessage(`Transaksi "${txToDelete.title}" berhasil dihapus!`);
      setShowSuccessToast(true);
      setTxToDelete(null);
      
      // Auto close toast after 3 seconds
      setTimeout(() => {
        setShowSuccessToast(false);
      }, 3000);
    }
  };

  // Helper to extract unique months/years from transactions for date filter
  const getUniqueMonths = () => {
    const unique = [];
    transactions.forEach(tx => {
      const d = new Date(tx.date);
      const monthLabel = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!unique.some(item => item.val === val)) {
        unique.push({ label: monthLabel, val });
      }
    });
    // Sort descending
    return unique.sort((a, b) => b.val.localeCompare(a.val));
  };

  // Helper for Payment Methods
  const getPaymentMethod = (tx) => {
    if (tx.paymentMethod) return tx.paymentMethod;
    if (tx.type === 'income') {
      return tx.id % 2 === 0 ? 'Bank Mandiri' : 'BCA';
    } else {
      const methods = ['BCA', 'GoPay', 'Kartu Kredit', 'Dana'];
      return methods[tx.id % methods.length];
    }
  };

  // Helper for Times
  const getTime = (tx) => {
    if (tx.time) return tx.time;
    const times = ['13:20', '08:45', '09:00', '19:45', '10:15'];
    return times[tx.id % times.length];
  };

  // Helper for Category Styles, Icons, and Labels
  const getCategoryStyles = (category = '') => {
    const cat = category.toLowerCase();
    switch (cat) {
      case 'makanan':
      case 'makan & minum':
        return {
          bg: 'bg-orange-50 text-orange-600 border-orange-100',
          label: 'Makan & Minum',
          iconBg: 'bg-orange-100 text-orange-600',
          icon: Coffee
        };
      case 'transportasi':
        return {
          bg: 'bg-blue-50 text-blue-600 border-blue-100',
          label: 'Transportasi',
          iconBg: 'bg-blue-100 text-blue-600',
          icon: Car
        };
      case 'belanja':
        return {
          bg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
          label: 'Belanja',
          iconBg: 'bg-indigo-100 text-indigo-600',
          icon: ShoppingBag
        };
      case 'hiburan':
        return {
          bg: 'bg-purple-50 text-purple-600 border-purple-100',
          label: 'Hiburan',
          iconBg: 'bg-purple-100 text-purple-600',
          icon: Tv
        };
      case 'tagihan':
        return {
          bg: 'bg-amber-50 text-amber-600 border-amber-100',
          label: 'Tagihan',
          iconBg: 'bg-amber-100 text-amber-600',
          icon: Zap
        };
      case 'pendapatan':
      case 'pemasukan':
        return {
          bg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
          label: 'Pemasukan',
          iconBg: 'bg-emerald-100 text-emerald-600',
          icon: Wallet
        };
      case 'sosial':
        return {
          bg: 'bg-rose-50 text-rose-600 border-rose-100',
          label: 'Sosial',
          iconBg: 'bg-rose-100 text-rose-600',
          icon: Heart
        };
      case 'pendidikan':
        return {
          bg: 'bg-teal-50 text-teal-600 border-teal-100',
          label: 'Pendidikan',
          iconBg: 'bg-teal-100 text-teal-600',
          icon: BookOpen
        };
      case 'travel':
        return {
          bg: 'bg-cyan-50 text-cyan-600 border-cyan-100',
          label: 'Travel',
          iconBg: 'bg-cyan-100 text-cyan-600',
          icon: Plane
        };
      case 'kesehatan dan perawatan diri':
        return {
          bg: 'bg-red-50 text-red-600 border-red-100',
          label: 'Kesehatan & Perawatan',
          iconBg: 'bg-red-100 text-red-600',
          icon: Heart
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-600 border-slate-100',
          label: category || 'Lainnya',
          iconBg: 'bg-slate-100 text-slate-600',
          icon: HelpCircle
        };
    }
  };

  // 1. Calculate Monthly Summary based on most recent transaction's month
  const getLatestTxMonthAndYear = () => {
    if (transactions.length === 0) {
      return { month: new Date().getMonth(), year: new Date().getFullYear() };
    }
    const dates = transactions.map(t => new Date(t.date));
    const latestDate = new Date(Math.max(...dates));
    return { month: latestDate.getMonth(), year: latestDate.getFullYear() };
  };

  const activeDateInfo = getLatestTxMonthAndYear();

  const monthlyIncomeTotal = transactions
    .filter(tx => {
      const d = new Date(tx.date);
      return tx.type === 'income' && d.getMonth() === activeDateInfo.month && d.getFullYear() === activeDateInfo.year;
    })
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const monthlyExpenseTotal = transactions
    .filter(tx => {
      const d = new Date(tx.date);
      return tx.type === 'expense' && d.getMonth() === activeDateInfo.month && d.getFullYear() === activeDateInfo.year;
    })
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  // 2. Filter & Sort Transactions
  const filteredTransactions = transactions
    .filter(tx => {
      const matchesSearch = tx.title.toLowerCase().includes(globalSearchTerm.toLowerCase()) || 
                            tx.category.toLowerCase().includes(globalSearchTerm.toLowerCase());
      const matchesFilter = filter === 'all' || tx.type === filter;
      const matchesCategory = selectedCategory === 'all' || tx.category.toLowerCase() === selectedCategory.toLowerCase();
      
      let matchesMonth = true;
      if (selectedMonth !== 'all') {
        const txDate = new Date(tx.date);
        const monthVal = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
        matchesMonth = monthVal === selectedMonth;
      }
      
      return matchesSearch && matchesFilter && matchesCategory && matchesMonth;
    })
    .sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.date) - new Date(a.date);
      }
      if (sortBy === 'date-asc') {
        return new Date(a.date) - new Date(b.date);
      }
      if (sortBy === 'amount-desc') {
        return Math.abs(b.amount) - Math.abs(a.amount);
      }
      if (sortBy === 'amount-asc') {
        return Math.abs(a.amount) - Math.abs(b.amount);
      }
      return 0;
    });

  // 3. Group filtered transactions by date
  const groupedTransactions = filteredTransactions.reduce((groups, tx) => {
    const date = tx.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(tx);
    return groups;
  }, {});

  // Date Header Formatter (e.g. "Selasa, 25 Mei")
  const formatDateHeader = (dateStr) => {
    const date = new Date(dateStr);
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    const formatted = date.toLocaleDateString('id-ID', options);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Title & Add Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transaksi</h1>
          <p className="text-slate-500">Kelola pendapatan dan pengeluaran Anda.</p>
        </div>
        <Button onClick={openAddTxModal} className="flex items-center gap-2 shadow-sm rounded-xl py-2.5">
          <Plus className="w-4 h-4" />
          Tambah Transaksi
        </Button>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Income Card */}
        <Card className="p-6 bg-white border border-slate-100 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pemasukan Bulan Ini</p>
              <h3 className="text-2xl md:text-3xl font-extrabold text-slate-950 tracking-tight">
                Rp {monthlyIncomeTotal.toLocaleString('id-ID')}
              </h3>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+12%</span>
                <span className="text-[11px] text-slate-400 font-medium">vs bulan lalu</span>
              </div>
            </div>
            <div className="p-3 bg-emerald-50/50 rounded-2xl text-emerald-500 shrink-0">
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Expense Card */}
        <Card className="p-6 bg-white border border-slate-100 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pengeluaran Bulan Ini</p>
              <h3 className="text-2xl md:text-3xl font-extrabold text-red-500 tracking-tight">
                Rp {monthlyExpenseTotal.toLocaleString('id-ID')}
              </h3>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">+5%</span>
                <span className="text-[11px] text-slate-400 font-medium">vs bulan lalu</span>
              </div>
            </div>
            <div className="p-3 bg-red-50/50 rounded-2xl text-red-500 shrink-0">
              <ArrowDownRight className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Container */}
      <div className="space-y-6">
        {/* Filters Controls Row */}
        <div className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Cari transaksi (e.g. Starbucks, Gaji)..." 
              value={globalSearchTerm}
              onChange={(e) => setGlobalSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-2.5 w-full border border-slate-200 bg-white rounded-full text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm"
            />
          </div>

          {/* Segmented Controls & Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Segmented filter buttons */}
            <div className="bg-slate-100 p-1 rounded-full flex items-center border border-slate-200/50 shadow-sm shrink-0">
              <button 
                onClick={() => setFilter('all')}
                className={`px-5 py-2 text-xs md:text-sm font-semibold rounded-full transition-all cursor-pointer ${
                  filter === 'all' 
                    ? 'bg-primary-600 text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'
                }`}
              >
                Semua
              </button>
              <button 
                onClick={() => setFilter('income')}
                className={`px-5 py-2 text-xs md:text-sm font-semibold rounded-full transition-all cursor-pointer ${
                  filter === 'income' 
                    ? 'bg-primary-600 text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'
                }`}
              >
                Pemasukan
              </button>
              <button 
                onClick={() => setFilter('expense')}
                className={`px-5 py-2 text-xs md:text-sm font-semibold rounded-full transition-all cursor-pointer ${
                  filter === 'expense' 
                    ? 'bg-primary-600 text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'
                }`}
              >
                Pengeluaran
              </button>
            </div>

            {/* Calendar Select Month */}
            <div className="relative shrink-0">
              <Calendar className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-full text-xs md:text-sm font-semibold text-slate-700 outline-none hover:bg-slate-50 transition-all shadow-sm cursor-pointer appearance-none"
              >
                <option value="all">Semua Waktu</option>
                {getUniqueMonths().map(m => (
                  <option key={m.val} value={m.val}>{m.label}</option>
                ))}
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-500"></span>
            </div>

            {/* Extra filter button */}
            <button 
              onClick={() => setShowExtraFilters(!showExtraFilters)}
              className={`w-10 h-10 bg-white border rounded-full hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center cursor-pointer shrink-0 ${
                showExtraFilters ? 'border-primary-500 text-primary-600 ring-2 ring-primary-100' : 'border-slate-200 text-slate-600'
              }`}
              title="Filter Kategori & Urutan"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Collapsible Extra Filters Panel */}
        {showExtraFilters && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-white border border-slate-200/60 rounded-3xl shadow-sm"
          >
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Filter Kategori</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-primary-500 capitalize"
              >
                <option value="all">Semua Kategori</option>
                <option value="makanan">Makanan & Minum</option>
                <option value="belanja">Belanja</option>
                <option value="transportasi">Transportasi</option>
                <option value="hiburan">Hiburan</option>
                <option value="tagihan">Tagihan</option>
                <option value="pendapatan">Pemasukan / Pendapatan</option>
                <option value="sosial">Sosial</option>
                <option value="pendidikan">Pendidikan</option>
                <option value="travel">Travel</option>
                <option value="kesehatan dan perawatan diri">Kesehatan & Perawatan</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Urutkan Berdasarkan</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="date-desc">Tanggal: Terbaru ke Terlama</option>
                <option value="date-asc">Tanggal: Terlama ke Terbaru</option>
                <option value="amount-desc">Jumlah: Terbesar ke Terkecil</option>
                <option value="amount-asc">Jumlah: Terkecil ke Terbesar</option>
              </select>
            </div>
          </motion.div>
        )}

        {/* Grouped Transaction Lists */}
        {Object.keys(groupedTransactions).length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-white border border-slate-100 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
            Tidak ada transaksi yang ditemukan.
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedTransactions).map(([dateStr, txs]) => (
              <div key={dateStr} className="space-y-3">
                {/* Date Group Header */}
                <h3 className="text-xs md:text-sm font-bold text-slate-800 tracking-wide px-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                  {formatDateHeader(dateStr)}
                </h3>
                {/* Transactions Card Container */}
                <div className="space-y-3">
                  {txs.map((tx, index) => {
                    const catStyles = getCategoryStyles(tx.category);
                    const CatIcon = catStyles.icon;
                    const isIncome = tx.type === 'income';

                    return (
                      <motion.div 
                        key={tx.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="bg-white border border-slate-100 hover:border-slate-200 rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.015)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.035)] transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${catStyles.iconBg}`}>
                            <CatIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-800 text-sm md:text-base leading-snug">{tx.title}</h4>
                            <p className="text-[11px] md:text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                              <span>{getPaymentMethod(tx)}</span>
                              <span className="text-slate-300">•</span>
                              <span>{getTime(tx)}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right">
                            <p className={`font-bold text-sm md:text-base ${isIncome ? 'text-green-600' : 'text-red-500'}`}>
                              {isIncome ? '+ ' : '- '}Rp {Math.abs(tx.amount).toLocaleString('id-ID')}
                            </p>
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${catStyles.bg} mt-1 capitalize`}>
                              {catStyles.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setTxToDelete(tx);
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                              title="Hapus Transaksi"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rangkuman AI Finsight Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative overflow-hidden bg-gradient-to-r from-primary-600 to-blue-500 rounded-3xl p-6 text-white shadow-lg shadow-blue-500/20"
      >
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
          <Sparkles className="w-32 h-32 text-white animate-pulse" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <h4 className="text-sm font-extrabold tracking-wider uppercase text-blue-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-200" />
              Rangkuman AI Finsight
            </h4>
            <p className="text-sm md:text-base text-white font-medium leading-relaxed">
              "Pengeluaranmu di kategori Belanja naik 15% dibanding minggu lalu. Coba batasi pembelian impulsif di akhir pekan untuk tetap sesuai anggaran bulananmu."
            </p>
          </div>
        </div>
      </motion.div>

      {/* Confirmation Modal */}
      <Modal 
        isOpen={txToDelete !== null} 
        onClose={() => setTxToDelete(null)} 
        title="Konfirmasi Hapus"
      >
        <div className="space-y-4">
          <p className="text-slate-600 text-sm leading-relaxed">
            Apakah Anda yakin ingin menghapus transaksi <strong className="text-slate-900">"{txToDelete?.title}"</strong> senilai <strong className="text-slate-900">Rp {Math.abs(txToDelete?.amount || 0).toLocaleString('id-ID')}</strong>? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button 
              onClick={() => setTxToDelete(null)}
              className="rounded-xl py-2 px-4 text-slate-700 font-semibold hover:bg-slate-50 border border-slate-200 cursor-pointer text-sm transition-colors"
            >
              Batal
            </button>
            <button 
              onClick={handleConfirmDelete}
              className="rounded-xl py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center gap-1.5 cursor-pointer text-sm transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Hapus
            </button>
          </div>
        </div>
      </Modal>

      {/* Toast Success Notification */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900/95 backdrop-blur-md text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-800"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <div className="font-semibold text-sm tracking-wide">
              {toastMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
