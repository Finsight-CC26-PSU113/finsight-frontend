import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowRight, ShieldCheck, Gem } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const InvestmentPortfolioWidget = () => {
  const navigate = useNavigate();

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  const assets = [
    { name: 'SBR013', type: 'Obligasi', value: 10000000, icon: ShieldCheck, color: 'text-blue-500', bg: 'bg-blue-50' },
    { name: 'Emas Digital', type: 'Komoditas', value: 5000000, icon: Gem, color: 'text-yellow-500', bg: 'bg-yellow-50' }
  ];

  const totalValue = assets.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col hover:shadow-float transition-all duration-300 border-none shadow-sm ring-1 ring-slate-100">
        {/* Header/Summary */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-medium text-slate-500">Portofolio Investasi</h3>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{formatCurrency(totalValue)}</p>
          </div>
          <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +12.4%
          </span>
        </div>
        
        {/* Quick Assets List */}
        <div className="space-y-3 mb-6">
          {assets.map((asset, idx) => (
            <div key={idx} className="flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors rounded-xl p-3 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${asset.bg} ${asset.color}`}>
                  <asset.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{asset.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">{asset.type}</p>
                </div>
              </div>
              <p className="text-sm font-bold text-slate-700">{formatCurrency(asset.value)}</p>
            </div>
          ))}
        </div>

        {/* Footer Action */}
        <div className="mt-auto pt-2 border-t border-slate-100">
          <Button 
            variant="ghost" 
            fullWidth 
            onClick={() => navigate('/investments')}
            className="flex items-center justify-center gap-2 group text-primary-600 hover:text-primary-700 hover:bg-primary-50"
          >
            Kelola Portofolio
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};
