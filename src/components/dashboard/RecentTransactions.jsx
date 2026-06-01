import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAppContext } from '../../context/AppContext';
import { motion } from 'framer-motion';
import { Tv, ShoppingCart, Briefcase, Coffee, Zap, Package, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const iconMap = {
  Tv: Tv,
  ShoppingCart: ShoppingCart,
  Briefcase: Briefcase,
  Coffee: Coffee,
  Zap: Zap,
  Package: Package,
};

export const RecentTransactions = () => {
  const { transactions } = useAppContext();
  const recentTx = transactions.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="h-full flex flex-col overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-900">Transaksi Terakhir</h3>
          <Link to="/transactions">
            <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700">
              Lihat Semua
            </Button>
          </Link>
        </div>

        <div className="space-y-4 flex-1">
          {recentTx.map((tx, index) => {
            const Icon = iconMap[tx.icon] || ShoppingCart;
            const isIncome = tx.type === 'income';

            return (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (index * 0.1) }}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`p-3 rounded-xl ${isIncome ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate max-w-[160px] sm:max-w-[220px]">{tx.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500">{new Date(tx.date).toLocaleDateString('id-ID')}</span>
                      <Badge variant="default" className="text-[10px]">{tx.category}</Badge>
                    </div>
                  </div>
                </div>

                <div className={`flex items-center gap-1 font-bold flex-shrink-0 text-right ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                  {isIncome ? <ArrowUpRight className="w-4 h-4 text-green-600" /> : <ArrowDownRight className="w-4 h-4 text-red-600" />}
                  <span className="whitespace-nowrap">{isIncome ? '+' : '-'}{Math.abs(tx.amount).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
};
