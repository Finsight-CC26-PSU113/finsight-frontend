import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useAppContext } from "../context/AppContext";
import { User, Bell, Lock, HelpCircle } from "lucide-react";

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAppContext();
  const [pushEnabled, setPushEnabled] = useState(Boolean(user.push_notifications_enabled));

  useEffect(() => {
    setPushEnabled(Boolean(user.push_notifications_enabled));
  }, [user.push_notifications_enabled]);

  const handlePushToggle = async (checked) => {
    setPushEnabled(checked);

    if (checked && typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }

    try {
      await updateProfile({ push_notifications_enabled: checked });
    } catch (error) {
      setPushEnabled(!checked);
      window.alert(error.message || "Gagal menyimpan pengaturan notifikasi push");
    }
  };

  const settingsSections = [
    {
      title: "Akun Saya",
      items: [
        {
          id: "profile-edit",
          icon: User,
          title: "Profil Akun",
          description: "Perbarui informasi pribadi, pendapatan, dan pengeluaran bulanan Anda.",
          action: (
            <Button variant="outline" size="sm" onClick={() => navigate("/profile")}>
              Kelola Profil
            </Button>
          ),
        },
      ],
    },
    {
      title: "Notifikasi",
      items: [
        {
          id: "push-notif",
          icon: Bell,
          title: "Notifikasi Push",
          description: "Terima peringatan untuk transaksi besar dan wawasan AI.",
          action: (
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={pushEnabled} onChange={(event) => handlePushToggle(event.target.checked)} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          ),
        },
      ],
    },
    {
      title: "Keamanan & Privasi",
      items: [
        {
          id: "password",
          icon: Lock,
          title: "Ubah Kata Sandi",
          description: "Perbarui kata sandi akun Anda.",
          action: (
            <Button variant="outline" size="sm" onClick={() => navigate("/forgot-password")}>
              Perbarui
            </Button>
          ),
        },
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-1 sm:px-0">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pengaturan</h1>
        <p className="text-slate-500">Kelola konfigurasi aplikasi dan keamanan Anda.</p>
      </div>

      <div className="space-y-6">
        {settingsSections.map((section, sectionIdx) => (
          <motion.div key={section.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: sectionIdx * 0.1 }}>
            <Card className="overflow-hidden">
              <h3 className="font-bold text-slate-900 px-2 pb-4 mb-2 border-b border-slate-100">{section.title}</h3>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors gap-3">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="p-2 bg-slate-100 rounded-lg text-slate-600 shrink-0">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">{item.title}</p>
                        <p className="text-sm text-slate-500 hidden sm:block">{item.description}</p>
                      </div>
                    </div>
                    <div className="w-full sm:w-auto shrink-0 sm:ml-4">{item.action}</div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex justify-center pt-4 pb-8">
          <Button variant="ghost" className="text-slate-500 flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            Pusat Bantuan & Dukungan
          </Button>
        </motion.div>
      </div>
    </div>
  );
};
