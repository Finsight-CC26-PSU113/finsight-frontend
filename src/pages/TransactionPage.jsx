import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAppContext } from '../context/AppContext';
import { Search, Filter, Plus, Tv, ShoppingCart, Briefcase, Coffee, Zap, Package, Trash2, Edit } from 'lucide-react';

const iconMap = {
  Tv: Tv,
  ShoppingCart: ShoppingCart,
  Briefcase: Briefcase,
  Coffee: Coffee,
  Zap: Zap,
  Package: Package,
};

export const TransactionPage = () => {
  const { transactions, deleteTransaction } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, income, expense

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tx.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || tx.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transaksi</h1>
          <p className="text-slate-500">Kelola pendapatan dan pengeluaran Anda.</p>
        </div>
        <Link to="/add">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Tambah Transaksi
          </Button>
        </Link>
      </div>

      <Card className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Cari berdasarkan judul atau kategori..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={filter === 'all' ? 'primary' : 'outline'} 
              size="sm" 
              onClick={() => setFilter('all')}
            >
              Semua
            </Button>
            <Button 
              variant={filter === 'income' ? 'primary' : 'outline'} 
              size="sm" 
              onClick={() => setFilter('income')}
            >
              Pemasukan
            </Button>
            <Button 
              variant={filter === 'expense' ? 'primary' : 'outline'} 
              size="sm" 
              onClick={() => setFilter('expense')}
            >
              Pengeluaran
            </Button>
            <Button variant="ghost" size="sm" className="ml-2">
              <Filter className="w-4 h-4 mr-2" />
              Filter Lainnya
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-sm font-semibold text-slate-500">
                <th className="py-3 px-4">Transaksi</th>
                <th className="py-3 px-4 hidden md:table-cell">Kategori</th>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4 text-right">Jumlah</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx, index) => {
                const Icon = iconMap[tx.icon] || ShoppingCart;
                const isIncome = tx.type === 'income';

                return (
                  <motion.tr 
                    key={tx.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isIncome ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-slate-900">{tx.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <Badge variant="default">{tx.category}</Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-sm">
                      {new Date(tx.date).toLocaleDateString('id-ID')}
                    </td>
                    <td className={`py-3 px-4 text-right font-semibold ${isIncome ? 'text-green-600' : 'text-slate-900'}`}>
                      {isIncome ? '+' : ''}{Math.abs(tx.amount).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteTransaction(tx.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          {filteredTransactions.length === 0 && (
            <div className="py-12 text-center text-slate-500">
              Tidak ada transaksi yang ditemukan.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
