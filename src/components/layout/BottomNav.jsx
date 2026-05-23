import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, PieChart, Sparkles, Plus, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppContext } from '../../context/AppContext';

export const BottomNav = () => {
  const { openAddTxModal } = useAppContext();
  
  const navItems = [
    { name: 'Beranda', path: '/', icon: LayoutDashboard },
    { name: 'Transaksi', path: '/transactions', icon: Receipt },
    { name: 'Tambah', path: '/add', icon: Plus, isFab: true },
    { name: 'Anggaran', path: '/budget', icon: PieChart },
    { name: 'Investasi', path: '/investments', icon: TrendingUp },
    { name: 'Wawasan', path: '/insights', icon: Sparkles },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 px-6 py-3 pb-safe z-50 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        if (item.isFab) {
          return (
            <motion.button
              key={item.name}
              onClick={openAddTxModal}
              whileTap={{ scale: 0.9 }}
              className="relative -top-6 bg-gradient-to-tr from-primary-600 to-ai w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg shadow-primary-500/30 border-4 border-white cursor-pointer"
            >
              <item.icon className="w-6 h-6" />
            </motion.button>
          );
        }

        return (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 min-w-[50px] ${
                isActive ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
