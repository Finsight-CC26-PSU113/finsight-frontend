import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useAppContext } from '../context/AppContext';
import { AlertTriangle, Plus, Target, Wallet, Save, Edit2, Trash2, Car, Utensils, Clapperboard, Zap, PiggyBank, Bot, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const BudgetPage = () => {
  const { budgets, addBudget } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBudget, setNewBudget] = useState({ category: 'transportasi', total: '', color: 'bg-blue-500' });

  const categories = [
    "transportasi", "belanja", "makanan", "hiburan", "sosial", 
    "pendidikan", "travel", "kesehatan dan perawatan diri", "tagihan", "lainnya"
  ];

  const colors = [
    { name: 'Blue', value: 'bg-blue-500' },
    { name: 'Purple', value: 'bg-purple-500' },
    { name: 'Red', value: 'bg-red-500' },
    { name: 'Yellow', value: 'bg-yellow-500' },
    { name: 'Green', value: 'bg-green-500' },
    { name: 'Indigo', value: 'bg-indigo-500' },
    { name: 'Pink', value: 'bg-pink-500' },
  ];

  const handleCreateBudget = (e) => {
    e.preventDefault();
    if (!newBudget.total) return;
    
    addBudget({
      category: newBudget.category,
      total: parseFloat(newBudget.total),
      color: newBudget.color
    });
    
    setIsModalOpen(false);
    setNewBudget({ category: 'transportasi', total: '', color: 'bg-blue-500' });
  };

  const getCategoryIcon = (category) => {
    switch(category.toLowerCase()) {
      case 'makanan': return <Utensils className="w-6 h-6 text-orange-500" />;
      case 'transportasi': return <Car className="w-6 h-6 text-red-500" />;
      case 'hiburan': return <Clapperboard className="w-6 h-6 text-slate-700" />;
      case 'tagihan': return <Zap className="w-6 h-6 text-yellow-500" />;
      default: return <Target className="w-6 h-6 text-primary-500" />;
    }
  };

  const getNeumorphicBg = (category) => {
    switch(category.toLowerCase()) {
      case 'makanan': return 'bg-orange-50 shadow-[2px_2px_8px_#ffedd5,-2px_-2px_8px_#ffffff]';
      case 'transportasi': return 'bg-blue-50 shadow-[2px_2px_8px_#dbeafe,-2px_-2px_8px_#ffffff]';
      case 'hiburan': return 'bg-purple-50 shadow-[2px_2px_8px_#f3e8ff,-2px_-2px_8px_#ffffff]';
      case 'tagihan': return 'bg-yellow-50 shadow-[2px_2px_8px_#fef9c3,-2px_-2px_8px_#ffffff]';
      default: return 'bg-slate-50 shadow-[2px_2px_8px_#f1f5f9,-2px_-2px_8px_#ffffff]';
    }
  };

  const formatRp = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Calculate totals
  const totalBudget = budgets.reduce((acc, curr) => acc + curr.total, 0);
  const totalSpent = budgets.reduce((acc, curr) => acc + curr.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallPercentage = (totalSpent / totalBudget) * 100;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ringkasan Anggaran</h1>
          <p className="text-slate-500">Pantau batas pengeluaran dan tujuan Anda.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Buat Anggaran
        </Button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Buat Anggaran Baru">
        <form onSubmit={handleCreateBudget} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
            <select
              value={newBudget.category}
              onChange={(e) => setNewBudget({...newBudget, category: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none capitalize"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Batas Bulanan</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">Rp</span>
              <input
                type="number"
                required
                min="1"
                value={newBudget.total}
                onChange={(e) => setNewBudget({...newBudget, total: e.target.value})}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="0"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Label Warna</label>
            <div className="flex gap-2">
              {colors.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setNewBudget({...newBudget, color: c.value})}
                  className={`w-8 h-8 rounded-full ${c.value} ${newBudget.color === c.value ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`}
                />
              ))}
            </div>
          </div>
          <Button type="submit" fullWidth className="mt-4 flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> Simpan Anggaran
          </Button>
        </form>
      </Modal>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-primary-600 to-primary-800 text-white border-none">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-primary-200" />
              <h3 className="font-medium text-primary-100">Total Anggaran</h3>
            </div>
            <p className="text-3xl font-bold">{formatRp(totalBudget)}</p>
            <p className="text-sm text-primary-200 mt-2">Untuk bulan ini</p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <div className="flex items-center gap-3 mb-2">
              <Wallet className="w-5 h-5 text-slate-400" />
              <h3 className="font-medium text-slate-500">Total Terpakai</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{formatRp(totalSpent)}</p>
            <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5">
              <div 
                className="bg-primary-500 h-1.5 rounded-full" 
                style={{ width: `${Math.min(overallPercentage, 100)}%` }}
              ></div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-5 h-5 rounded-full border-2 border-green-500 flex items-center justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <h3 className="font-medium text-slate-500">Sisa</h3>
            </div>
            <p className={`text-3xl font-bold ${totalRemaining < 0 ? 'text-red-500' : 'text-green-500'}`}>
              {formatRp(Math.abs(totalRemaining))}
            </p>
            <p className="text-sm text-slate-500 mt-2">
              {totalRemaining < 0 ? 'Melebihi anggaran!' : 'Aman untuk dipakai'}
            </p>
          </Card>
        </motion.div>
      </div>

      {/* Allocation Pie Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/2 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={budgets.map(b => ({
                      name: b.category,
                      value: b.total,
                      fill: {
                        'text-orange-500': '#f97316', 'text-blue-500': '#3b82f6', 'text-purple-500': '#a855f7',
                        'text-yellow-500': '#eab308', 'bg-blue-500': '#3b82f6', 'bg-purple-500': '#a855f7',
                        'bg-red-500': '#ef4444', 'bg-yellow-500': '#eab308', 'bg-green-500': '#22c55e',
                        'bg-indigo-500': '#6366f1', 'bg-pink-500': '#ec4899'
                      }[b.color] || '#94a3b8'
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {budgets.map((b, index) => (
                      <Cell key={`cell-${index}`} fill={{
                        'text-orange-500': '#f97316', 'text-blue-500': '#3b82f6', 'text-purple-500': '#a855f7',
                        'text-yellow-500': '#eab308', 'bg-blue-500': '#3b82f6', 'bg-purple-500': '#a855f7',
                        'bg-red-500': '#ef4444', 'bg-yellow-500': '#eab308', 'bg-green-500': '#22c55e',
                        'bg-indigo-500': '#6366f1', 'bg-pink-500': '#ec4899'
                      }[b.color] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatRp(value)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Distribusi Anggaran</h3>
              <p className="text-slate-500 mb-6">Melihat bagaimana dana Anda dialokasikan ke berbagai kategori untuk bulan ini.</p>
              
              <div className="space-y-4">
                {budgets.slice(0, 4).map(b => (
                  <div key={b.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: {
                        'text-orange-500': '#f97316', 'text-blue-500': '#3b82f6', 'text-purple-500': '#a855f7',
                        'text-yellow-500': '#eab308', 'bg-blue-500': '#3b82f6', 'bg-purple-500': '#a855f7',
                        'bg-red-500': '#ef4444', 'bg-yellow-500': '#eab308', 'bg-green-500': '#22c55e',
                        'bg-indigo-500': '#6366f1', 'bg-pink-500': '#ec4899'
                      }[b.color] || '#94a3b8' }}></div>
                      <span className="font-medium text-slate-700 capitalize">{b.category}</span>
                    </div>
                    <span className="font-bold text-slate-900">{((b.total / totalBudget) * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Category Budgets List */}
      <Card className="p-0 overflow-hidden border-none shadow-sm ring-1 ring-slate-100">
        <div className="flex flex-col divide-y divide-slate-100">
          {budgets.map((budget, index) => {
            const percentage = (budget.spent / budget.total) * 100;
            
            // Logic Status
            let statusText = 'Aman';
            let statusColor = 'bg-green-100 text-green-700 border-green-200';
            let progressColor = 'bg-green-500';
            let barColor = '#22c55e'; // green-500

            if (percentage > 90) {
              statusText = 'Bahaya';
              statusColor = 'bg-red-100 text-red-700 border-red-200';
              progressColor = 'bg-red-500';
              barColor = '#ef4444'; // red-500
            } else if (percentage >= 70) {
              statusText = 'Waspada';
              statusColor = 'bg-yellow-100 text-yellow-700 border-yellow-200';
              progressColor = 'bg-yellow-500';
              barColor = '#eab308'; // yellow-500
            }

            // Logic Insight (Asumsi hari ke-15)
            const currentDay = 15;
            const dailyAvg = budget.spent / currentDay;
            const remaining = budget.total - budget.spent;
            const daysLeft = remaining > 0 && dailyAvg > 0 ? Math.floor(remaining / dailyAvg) : 0;
            let insightText = '';
            if (percentage >= 100) {
               insightText = 'Anggaran telah habis.';
            } else {
               insightText = `Jika tren tetap, anggaran habis dalam ${daysLeft} hari.`;
            }

            // Generate mock trend for the sparkline (removed per user request)

            return (
              <motion.div 
                key={budget.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + (index * 0.1) }}
                className="p-6 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  
                  {/* Left: Icon, Title & Status */}
                  <div className="flex items-start gap-4 lg:w-[40%]">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${getNeumorphicBg(budget.category)}`}>
                      {getCategoryIcon(budget.category)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900 text-lg capitalize">{budget.category}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor}`}>
                          {statusText}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mb-2">{budget.subtitle || 'Kategori Pengeluaran'}</p>
                      <p className="text-xs font-medium text-slate-400">Batas: <span className="text-slate-700">{formatRp(budget.total)}</span></p>
                    </div>
                  </div>

                  {/* Middle: Progress & Insight */}
                  <div className="lg:w-[45%] flex flex-col justify-center mt-2 lg:mt-0">
                    <div className="flex justify-between items-end mb-2">
                      <span className={`text-sm font-bold ${progressColor.replace('bg-', 'text-')}`}>
                        Terpakai {percentage.toFixed(0)}%
                      </span>
                      <span className="text-sm font-medium text-slate-700">{formatRp(budget.spent)}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden mb-2">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(percentage, 100)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full ${progressColor}`}
                      />
                    </div>
                    <p className="text-xs text-slate-500 italic flex items-start gap-1">
                      <span>💡</span> <span>{insightText}</span>
                    </p>
                  </div>

                  {/* Actions & Detail */}
                  <div className="lg:w-[15%] flex flex-row lg:flex-col justify-between items-end lg:items-end gap-3 shrink-0 lg:border-l lg:border-slate-100 lg:pl-4 mt-4 lg:mt-0">
                    <div className="flex gap-1 w-full lg:w-auto justify-end">
                      <button className="p-2 text-slate-400 hover:text-primary-600 transition-colors rounded-lg hover:bg-primary-50">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs w-full whitespace-nowrap">
                      Lihat Detail
                    </Button>
                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* Bottom Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* Potensi Tabungan */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="md:col-span-1">
          <Card className="h-full border-none shadow-sm ring-1 ring-slate-100 p-6 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <PiggyBank className="w-5 h-5" />
              </div>
              <span className="font-medium text-slate-700">Potensi Tabungan</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-2">{formatRp(4250000)}</p>
            <p className="text-sm font-medium text-green-500 flex items-center gap-1">
              ↑ 12% dari bulan lalu
            </p>
          </Card>
        </motion.div>

        {/* Insight Finsight AI */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="md:col-span-2">
          <Card className="h-full border-none shadow-sm ring-1 ring-slate-100 p-6 relative overflow-hidden">
            <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
              <Bot className="w-48 h-48" />
            </div>
            <div className="relative z-10">
              <h3 className="text-slate-600 font-medium mb-3">Insight Finsight AI</h3>
              <p className="text-slate-800 leading-relaxed mb-4">
                Kamu bisa menghemat sekitar <span className="text-primary-600 font-bold">{formatRp(500000)}</span> jika membatasi makan di luar minggu ini. Mau kami buatkan rencana makan hemat?
              </p>
              <button className="text-primary-600 font-semibold text-sm hover:text-primary-700 flex items-center gap-1 group">
                Lihat Analisis AI
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
