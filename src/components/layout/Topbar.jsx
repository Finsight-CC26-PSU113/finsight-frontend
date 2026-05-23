import React, { useState } from 'react';
import { Bell, Search, Menu, AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Modal } from '../ui/Modal';

export const Topbar = () => {
  const { 
    user, 
    insights, 
    hasUnreadNotifications, 
    setHasUnreadNotifications, 
    globalSearchTerm, 
    setGlobalSearchTerm 
  } = useAppContext();

  const navigate = useNavigate();
  const location = useLocation();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Get greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Selamat Pagi' : hour < 18 ? 'Selamat Siang' : 'Selamat Malam';

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setGlobalSearchTerm(value);
    if (location.pathname !== '/transactions') {
      navigate('/transactions');
    }
  };

  const handleOpenNotifications = () => {
    setIsNotifOpen(true);
    setHasUnreadNotifications(false);
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30 transition-all duration-300">
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
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input 
            type="text" 
            placeholder="Cari transaksi..." 
            value={globalSearchTerm}
            onChange={handleSearchChange}
            className="pl-9 pr-4 py-2 bg-slate-100 border-transparent rounded-full text-sm focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition-all w-48 md:w-64 outline-none font-medium"
          />
        </div>
        
        <button 
          onClick={handleOpenNotifications}
          className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
        >
          <Bell className="w-5 h-5" />
          {hasUnreadNotifications && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>
          )}
        </button>

        <div 
          onClick={() => navigate('/profile')}
          title="Profil Saya"
          className="w-10 h-10 rounded-full border-2 border-primary-100 overflow-hidden cursor-pointer hover:border-primary-300 transition-colors"
        >
          <img src={user.avatar} alt="User Avatar" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Notification Modal */}
      <Modal isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} title="Notifikasi & Analisis Keuangan">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {insights.map((notif) => {
            const isAlert = notif.type === 'alert';
            const isRec = notif.type === 'recommendation';
            
            return (
              <div 
                key={notif.id} 
                className={`p-4 rounded-xl border flex gap-3 transition-all ${
                  isAlert 
                    ? 'bg-red-50/50 border-red-100 hover:bg-red-50' 
                    : isRec
                    ? 'bg-blue-50/50 border-blue-100 hover:bg-blue-50'
                    : 'bg-green-50/50 border-green-100 hover:bg-green-50'
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {isAlert ? (
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  ) : isRec ? (
                    <Sparkles className="w-5 h-5 text-blue-500" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">{notif.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{notif.description}</p>
                  {notif.action && (
                    <button className={`text-xs font-semibold mt-2 hover:underline block ${
                      isAlert ? 'text-red-600' : isRec ? 'text-blue-600' : 'text-green-600'
                    }`}>
                      {notif.action} &rarr;
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {insights.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm">
              Tidak ada notifikasi baru.
            </div>
          )}
        </div>
      </Modal>
    </header>
  );
};
