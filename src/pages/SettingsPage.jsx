import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Bell, Moon, Sun, Shield, Lock, CreditCard, HelpCircle, Smartphone, Globe } from 'lucide-react';

export const SettingsPage = () => {
  const [theme, setTheme] = useState('light');

  const settingsSections = [
    {
      title: "Preferensi Aplikasi",
      items: [
        {
          id: 'theme',
          icon: theme === 'light' ? Sun : Moon,
          title: "Tema Aplikasi",
          description: "Pilih antara mode terang dan gelap untuk aplikasi.",
          action: (
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setTheme('light')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${theme === 'light' ? 'bg-white shadow-sm font-medium text-slate-900' : 'text-slate-500'}`}
              >
                Terang
              </button>
              <button 
                onClick={() => setTheme('dark')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${theme === 'dark' ? 'bg-white shadow-sm font-medium text-slate-900' : 'text-slate-500'}`}
              >
                Gelap
              </button>
            </div>
          )
        },
        {
          id: 'language',
          icon: Globe,
          title: "Bahasa",
          description: "Pilih bahasa antarmuka yang Anda inginkan.",
          action: (
            <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2 outline-none">
              <option>English (US)</option>
              <option>Bahasa Indonesia</option>
            </select>
          )
        }
      ]
    },
    {
      title: "Notifikasi",
      items: [
        {
          id: 'push-notif',
          icon: Bell,
          title: "Notifikasi Push",
          description: "Terima peringatan untuk transaksi besar dan wawasan AI.",
          action: (
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          )
        },
        {
          id: 'email-notif',
          icon: Smartphone,
          title: "Laporan Email",
          description: "Terima ringkasan laporan keuangan mingguan dan bulanan.",
          action: (
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          )
        }
      ]
    },
    {
      title: "Keamanan & Privasi",
      items: [
        {
          id: 'password',
          icon: Lock,
          title: "Ubah Kata Sandi",
          description: "Perbarui kata sandi akun Anda.",
          action: <Button variant="outline" size="sm">Perbarui</Button>
        },
        {
          id: '2fa',
          icon: Shield,
          title: "Autentikasi Dua Faktor",
          description: "Tambahkan lapisan keamanan ekstra pada akun Anda.",
          action: <Button variant="outline" size="sm">Aktifkan 2FA</Button>
        }
      ]
    },
    {
      title: "Tagihan & Langganan",
      items: [
        {
          id: 'plan',
          icon: CreditCard,
          title: "Paket Saat Ini",
          description: "Anda saat ini menggunakan paket FINSIGHT Pro.",
          action: <Button variant="outline" size="sm" className="text-primary-600 border-primary-200 hover:bg-primary-50">Kelola Paket</Button>
        }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pengaturan</h1>
        <p className="text-slate-500">Kelola konfigurasi aplikasi dan keamanan Anda.</p>
      </div>

      <div className="space-y-6">
        {settingsSections.map((section, sectionIdx) => (
          <motion.div 
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIdx * 0.1 }}
          >
            <Card className="overflow-hidden">
              <h3 className="font-bold text-slate-900 px-2 pb-4 mb-2 border-b border-slate-100">
                {section.title}
              </h3>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-slate-100 rounded-lg text-slate-600 shrink-0">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{item.title}</p>
                        <p className="text-sm text-slate-500 hidden sm:block">{item.description}</p>
                      </div>
                    </div>
                    <div className="shrink-0 ml-4">
                      {item.action}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.5 }}
          className="flex justify-center pt-4 pb-8"
        >
          <Button variant="ghost" className="text-slate-500 flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            Pusat Bantuan & Dukungan
          </Button>
        </motion.div>
      </div>
    </div>
  );
};
