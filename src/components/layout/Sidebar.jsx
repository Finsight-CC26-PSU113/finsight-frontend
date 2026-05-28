import { NavLink } from "react-router-dom";
import { LayoutDashboard, Receipt, PieChart, Sparkles, Settings, LogOut, ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import { useAppContext } from "../../context/AppContext";

export const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { logout } = useAppContext();

  const navItems = [
    { name: "Beranda", path: "/", icon: LayoutDashboard },
    { name: "Transaksi", path: "/transactions", icon: Receipt },
    { name: "Anggaran", path: "/budget", icon: PieChart },
    { name: "Wawasan AI", path: "/insights", icon: Sparkles },
    { name: "Investasi", path: "/investments", icon: TrendingUp },
  ];

  return (
    <aside className={`hidden md:flex flex-col h-screen fixed top-0 left-0 bg-white border-r border-slate-200 z-20 transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"}`}>
      <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3 px-6"} py-8 relative group`}>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-ai flex items-center justify-center shadow-md shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        {!isCollapsed && <span className="text-xl font-bold tracking-tight text-slate-900 truncate">FINSIGHT</span>}

        {/* Toggle Button */}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className={`absolute ${isCollapsed ? "-right-3" : "right-4"} top-1/2 -translate-y-1/2 bg-white border border-slate-200 rounded-full p-1 text-slate-400 hover:text-primary-600 hover:border-primary-200 shadow-sm transition-all z-10 ${isCollapsed ? "opacity-0 group-hover:opacity-100" : ""}`}>
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className={`flex-1 space-y-2 overflow-y-auto mt-2 ${isCollapsed ? "px-3" : "px-4"}`}>
        {navItems.map((item) => (
          <NavLink key={item.name} to={item.path} className={({ isActive }) => `flex items-center gap-3 py-3 rounded-xl transition-all duration-200 ${isCollapsed ? "justify-center px-0" : "px-4"} ${isActive ? "bg-primary-50 text-primary-700 font-semibold shadow-sm border border-primary-100" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent"}`} title={isCollapsed ? item.name : undefined}>
            <item.icon className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      <div className={`p-4 border-t border-slate-100 flex flex-col gap-1 ${isCollapsed ? "px-3" : ""}`}>
        <NavLink to="/settings" className={({ isActive }) => `flex items-center gap-3 py-3 w-full rounded-xl transition-colors ${isCollapsed ? "justify-center px-0" : "px-4"} ${isActive ? "bg-slate-100 text-slate-900 font-semibold" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`} title={isCollapsed ? "Pengaturan" : undefined}>
          <Settings className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span>Pengaturan</span>}
        </NavLink>
        <button onClick={logout} className={`flex items-center gap-3 py-3 w-full text-red-500 hover:bg-red-50 rounded-xl transition-colors ${isCollapsed ? "justify-center px-0" : "px-4"}`} title={isCollapsed ? "Keluar" : undefined}>
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span>Keluar</span>}
        </button>
      </div>
    </aside>
  );
};
