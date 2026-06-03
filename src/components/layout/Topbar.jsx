import React, { useState } from "react";
import { Bell, Search, AlertTriangle, Sparkles, CheckCircle2, Menu, Settings, TrendingUp, UserCircle, PiggyBank } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Modal } from "../ui/Modal";
import { getAvatarFallbackStyle, getAvatarInitials } from "../../utils/profileAvatar";
import { getApiBaseUrl } from "../../utils/apiClient";

const resolveAvatarUrl = (value) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value) || value.startsWith("data:") || value.startsWith("blob:")) {
    return value;
  }
  return `${getApiBaseUrl()}/${String(value).replace(/^\/+/, "")}`;
};

export const Topbar = () => {
  const { user, insights, hasUnreadNotifications, setHasUnreadNotifications, globalSearchTerm, setGlobalSearchTerm, dashboardMode, setDashboardMode } = useAppContext();

  const navigate = useNavigate();
  const location = useLocation();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Selamat Pagi" : hour < 18 ? "Selamat Siang" : "Selamat Malam";

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setGlobalSearchTerm(value);
    if (location.pathname !== "/transactions") {
      navigate("/transactions");
    }
  };

  const handleOpenNotifications = () => {
    setIsNotifOpen(true);
    setHasUnreadNotifications(false);
  };

  return (
    <header className="h-16 md:h-20 bg-white border-b border-slate-200 flex items-center gap-4 px-4 md:px-6 sticky top-0 z-30">
      {/* Left: greeting (desktop only) + search bar */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="Buka menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden md:block shrink-0">
          <h1 className="text-xl font-semibold text-slate-900">
            {greeting}, {user.name} 👋
          </h1>
          <p className="text-sm text-slate-500">
            {location.pathname === "/transactions"
              ? dashboardMode === "pro"
                ? "Analisis transaksi mendalam dengan grafik dan filter lanjutan."
                : "Kelola dan lacak semua transaksi keuangan Anda."
              : location.pathname === "/budget"
                ? dashboardMode === "pro"
                  ? "Analisis anggaran mendalam: budget vs realisasi, prediksi, dan rekomendasi AI."
                  : "Pantau batas pengeluaran dan tujuan anggaran Anda."
                : location.pathname === "/savings"
                  ? dashboardMode === "pro"
                    ? "Analisis tabungan mendalam: progress target, prediksi, dan strategi menabung."
                    : "Kelola target tabungan dan alokasikan dana dari saldo utama."
                  : location.pathname === "/insights"
                    ? dashboardMode === "pro"
                      ? "Wawasan AI mendalam: health score, prediksi, anomali, dan prioritas keuangan."
                      : "Rekomendasi personal dari analisis pola keuangan Anda."
                    : location.pathname === "/investments"
                      ? dashboardMode === "pro"
                        ? "Analisis portofolio mendalam: alokasi, return, simulasi, dan rekomendasi instrumen."
                        : "Kembangkan aset dan jelajahi produk investasi."
                      : dashboardMode === "pro"
                  ? "Dasbor analitik lanjutan untuk monitoring keuangan mendalam."
                  : "Berikut ini ringkasan keuangan Anda."}
          </p>
        </div>

        <div className="relative flex-1 md:flex-none">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input type="text" placeholder="Cari transaksi..." value={globalSearchTerm} onChange={handleSearchChange} className="w-full md:w-64 pl-9 pr-4 py-2 bg-slate-100 border-transparent rounded-full text-sm focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition-all outline-none font-medium" />
        </div>
      </div>

      {/* Right: Lite/Pro + bell + avatar */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <div className="flex items-center bg-slate-100 rounded-full p-0.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setDashboardMode("lite");
              if (location.pathname !== "/") navigate("/");
            }}
            className={`px-3 py-1 rounded-full transition-all duration-200 ${dashboardMode === "lite" ? "bg-white text-primary-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
          >
            Lite
          </button>
          <button
            type="button"
            onClick={() => {
              setDashboardMode("pro");
              if (location.pathname !== "/") navigate("/");
            }}
            className={`px-3 py-1 rounded-full transition-all duration-200 ${dashboardMode === "pro" ? "bg-white text-primary-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
          >
            Pro
          </button>
        </div>

        <button onClick={handleOpenNotifications} className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
          <Bell className="w-5 h-5" />
          {hasUnreadNotifications && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>}
        </button>

        <div onClick={() => navigate("/profile")} title="Profil Saya" className="hidden md:block w-10 h-10 rounded-full border-2 border-primary-100 overflow-hidden cursor-pointer hover:border-primary-300 transition-colors shrink-0">
          {user.avatar ? (
            <img src={resolveAvatarUrl(user.avatar)} alt="User Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs font-bold" style={getAvatarFallbackStyle(user)}>
              {getAvatarInitials(user.name)}
            </div>
          )}
        </div>
      </div>

      {/* Notification Modal */}
      <Modal isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} title="Notifikasi & Analisis Keuangan">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {insights.map((notif) => {
            const isAlert = notif.type === "alert";
            const isRec = notif.type === "recommendation";

            return (
              <div key={notif.id} className={`p-4 rounded-xl border flex gap-3 transition-all ${isAlert ? "bg-red-50/50 border-red-100 hover:bg-red-50" : isRec ? "bg-blue-50/50 border-blue-100 hover:bg-blue-50" : "bg-green-50/50 border-green-100 hover:bg-green-50"}`}>
                <div className="shrink-0 mt-0.5">{isAlert ? <AlertTriangle className="w-5 h-5 text-red-500" /> : isRec ? <Sparkles className="w-5 h-5 text-blue-500" /> : <CheckCircle2 className="w-5 h-5 text-green-500" />}</div>
                <div className="flex-1 space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">{notif.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{notif.description}</p>
                  {notif.action && <button className={`text-xs font-semibold mt-2 hover:underline block ${isAlert ? "text-red-600" : isRec ? "text-blue-600" : "text-green-600"}`}>{notif.action} &rarr;</button>}
                </div>
              </div>
            );
          })}
          {insights.length === 0 && <div className="text-center py-8 text-slate-400 text-sm">Tidak ada notifikasi baru.</div>}
        </div>
      </Modal>

      {/* Mobile menu (hamburger) */}
      <Modal isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} title="Menu">
        <div className="space-y-2">
          <div className="flex items-center bg-slate-100 rounded-full p-0.5 text-xs font-bold mb-2">
            <button
              type="button"
              onClick={() => {
                setDashboardMode("lite");
                setIsMobileMenuOpen(false);
                navigate("/");
              }}
              className={`flex-1 px-3 py-1.5 rounded-full ${dashboardMode === "lite" ? "bg-white text-primary-600 shadow-sm" : "text-slate-400"}`}
            >
              Lite
            </button>
            <button
              type="button"
              onClick={() => {
                setDashboardMode("pro");
                setIsMobileMenuOpen(false);
                navigate("/");
              }}
              className={`flex-1 px-3 py-1.5 rounded-full ${dashboardMode === "pro" ? "bg-white text-primary-600 shadow-sm" : "text-slate-400"}`}
            >
              Pro
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              navigate("/savings");
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
          >
            <PiggyBank className="w-5 h-5 text-slate-500" />
            <span className="font-medium text-slate-900">Tabungan</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              navigate("/investments");
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
          >
            <TrendingUp className="w-5 h-5 text-slate-500" />
            <span className="font-medium text-slate-900">Investasi</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              navigate("/profile");
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
          >
            <UserCircle className="w-5 h-5 text-slate-500" />
            <span className="font-medium text-slate-900">Profil</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              navigate("/settings");
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
          >
            <Settings className="w-5 h-5 text-slate-500" />
            <span className="font-medium text-slate-900">Pengaturan</span>
          </button>
        </div>
      </Modal>
    </header>
  );
};
