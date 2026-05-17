import React from 'react';
import { Card } from '../ui/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockChartData } from '../../utils/dummyData';
import { motion } from 'framer-motion';

export const SpendingChart = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="h-full min-h-[400px] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Ringkasan Pengeluaran</h3>
            <p className="text-sm text-slate-500">Pengeluaran Anda dalam 7 hari terakhir</p>
          </div>
          <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2">
            <option>7 hari terakhir</option>
            <option>Bulan Ini</option>
            <option>Tahun Ini</option>
          </select>
        </div>

        <div className="w-full mt-4">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={mockChartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickFormatter={(value) => `Rp ${value}`}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                formatter={(value) => [`Rp ${value}`, 'Terpakai']}
              />
              <Area 
                type="monotone" 
                dataKey="spent" 
                stroke="#6366f1" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorSpent)" 
                activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  );
};
