import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, PieChart, Sparkles, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppContext } from '../../context/AppContext';

const navItems = [
  { name: 'Beranda', path: '/', icon: LayoutDashboard },
  { name: 'Transaksi', path: '/transactions', icon: Receipt },
  { name: 'Anggaran', path: '/budget', icon: PieChart },
  { name: 'Wawasan', path: '/insights', icon: Sparkles },
];

export const BottomNav = () => {
  const { openAddTxModal } = useAppContext();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 z-50 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around px-1 pt-2 pb-3">

        {/* Left 2 items */}
        {navItems.slice(0, 2).map((item) => <NavItem key={item.name} item={item} />)}

        {/* FAB — center */}
        <motion.button
          onClick={openAddTxModal}
          whileTap={{ scale: 0.88 }}
          className="flex flex-col items-center"
        >
          <div className="bg-primary-600 rounded-xl px-3 py-1.5">
            <Plus className="w-[18px] h-[18px] text-white" />
          </div>
          <span className="mt-1 text-[9px] font-bold text-primary-600 leading-none">Tambah</span>
        </motion.button>

        {/* Right 2 items */}
        {navItems.slice(2).map((item) => <NavItem key={item.name} item={item} />)}

      </div>
    </nav>
  );
};

function NavItem({ item }) {
  return (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      className="flex flex-col items-center min-w-0"
    >
      {({ isActive }) =>
        (
          <div className="flex flex-col items-center gap-0.5">
            <div className={`${isActive ? "bg-primary-50" : ""} rounded-xl px-3 py-1.5`}>
              <item.icon className={`w-[18px] h-[18px] ${isActive ? "text-primary-600" : "text-slate-400"}`} />
            </div>
            <span className={`text-[9px] font-bold leading-none ${isActive ? "text-primary-600" : "text-slate-400"}`}>{item.name}</span>
          </div>
        )
      }
    </NavLink>
  );
}
