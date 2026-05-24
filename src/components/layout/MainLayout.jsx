import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { BottomNav } from './BottomNav';
import { AddTransactionModal } from './AddTransactionModal';
import { useAppContext } from '../../context/AppContext';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export const MainLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isAddTxModalOpen, openAddTxModal, closeAddTxModal } = useAppContext();

  return (
    <div className="min-h-screen bg-surface-muted flex relative">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className={`flex-1 flex flex-col w-full relative transition-all duration-300 ${isCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        <Topbar />
        <main className="flex-1 p-6 md:p-8 pb-32 md:pb-8 w-full max-w-7xl mx-auto">
          <Outlet />
        </main>

        {/* Desktop FAB */}
        <motion.button
          onClick={openAddTxModal}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="hidden md:flex fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-tr from-primary-600 to-ai rounded-full items-center justify-center text-white shadow-lg shadow-primary-500/30 z-50 hover:shadow-xl transition-shadow cursor-pointer"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      </div>

      <BottomNav />
      <AddTransactionModal isOpen={isAddTxModalOpen} onClose={closeAddTxModal} />
    </div>
  );
};
