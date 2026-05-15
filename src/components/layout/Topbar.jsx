import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export const Topbar = () => {
  const { user } = useAppContext();

  // Get greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Selamat Pagi' : hour < 18 ? 'Selamat Siang' : 'Selamat Malam';

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10 md:ml-64 transition-all duration-300">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
          <Menu className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-slate-900 hidden md:block">{greeting}, {user.name} 👋</h1>
          <p className="text-sm text-slate-500 hidden md:block">Berikut ini ringkasan keuangan Anda.</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Cari transaksi..." 
            className="pl-9 pr-4 py-2 bg-slate-100 border-transparent rounded-full text-sm focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition-all w-64"
          />
        </div>
        
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        <div className="w-10 h-10 rounded-full border-2 border-primary-100 overflow-hidden cursor-pointer hover:border-primary-300 transition-colors">
          <img src={user.avatar} alt="User Avatar" className="w-full h-full object-cover" />
        </div>
      </div>
    </header>
  );
};
