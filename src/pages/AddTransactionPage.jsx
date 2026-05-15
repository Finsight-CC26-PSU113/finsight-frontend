import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, Save, Sparkles } from 'lucide-react';

export const AddTransactionPage = () => {
  const navigate = useNavigate();
  const { addTransaction } = useAppContext();
  
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'makanan',
    type: 'expense',
    date: new Date().toISOString().split('T')[0]
  });

  const categories = [
    "transportasi", 
    "belanja", 
    "makanan", 
    "hiburan", 
    "sosial", 
    "pendidikan", 
    "travel", 
    "kesehatan dan perawatan diri", 
    "tagihan", 
    "lainnya"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Auto simulate AI category detection if title is empty
    const finalTitle = formData.title || `Transaksi ${formData.category}`;
    const amountVal = parseFloat(formData.amount);
    
    const newTx = {
      title: finalTitle,
      amount: formData.type === 'expense' ? -amountVal : amountVal,
      category: formData.category,
      type: formData.type,
      date: formData.date,
      icon: "ShoppingCart" // generic icon for now
    };
    
    addTransaction(newTx);
    navigate('/transactions');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 bg-white rounded-full border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tambah Transaksi</h1>
          <p className="text-slate-500">Catat pemasukan atau pengeluaran baru Anda.</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-50">
            <Sparkles className="w-24 h-24 text-ai-light" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({...formData, type: 'expense'})}
                className={`py-3 rounded-xl border-2 font-semibold transition-colors ${
                  formData.type === 'expense' 
                    ? 'border-red-500 bg-red-50 text-red-700' 
                    : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                Pengeluaran
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, type: 'income'})}
                className={`py-3 rounded-xl border-2 font-semibold transition-colors ${
                  formData.type === 'income' 
                    ? 'border-green-500 bg-green-50 text-green-700' 
                    : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                Pemasukan
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Jumlah
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg font-medium">Rp</span>
                <input
                  type="number"
                  name="amount"
                  required
                  min="0"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 text-lg font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Judul Transaksi (Opsional)
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                placeholder="e.g. Makan siang di Mall"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Kategori
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all capitalize"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tanggal
                </label>
                <input
                  type="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" fullWidth size="lg" className="flex items-center justify-center gap-2 text-lg">
                <Save className="w-5 h-5" />
                Simpan Transaksi
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};
