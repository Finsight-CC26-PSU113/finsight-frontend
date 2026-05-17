export const mockUser = {
  name: "Alex",
  avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
  balance: 12450000,
  monthlyIncome: 8000000,
  monthlyExpenses: 3500000,
};

export const mockTransactions = [
  { id: 1, title: "Langganan Netflix", amount: -159000, date: "2026-05-12", category: "Hiburan", type: "expense", icon: "Tv" },
  { id: 2, title: "Belanja Supermarket", amount: -1450000, date: "2026-05-10", category: "Makanan", type: "expense", icon: "ShoppingCart" },
  { id: 3, title: "Gaji Bulanan", amount: 8000000, date: "2026-05-01", category: "Pendapatan", type: "income", icon: "Briefcase" },
  { id: 4, title: "Kopi Kenangan", amount: -45000, date: "2026-05-09", category: "Makanan", type: "expense", icon: "Coffee" },
  { id: 5, title: "Tagihan Listrik", amount: -950000, date: "2026-05-05", category: "Tagihan", type: "expense", icon: "Zap" },
  { id: 6, title: "Belanja Tokopedia", amount: -650000, date: "2026-05-03", category: "Belanja", type: "expense", icon: "Package" },
  { id: 7, title: "Klien Freelance", amount: 1850000, date: "2026-04-28", category: "Pendapatan", type: "income", icon: "Briefcase" },
];

export const mockBudgets = [
  { id: 1, category: "Makanan", subtitle: "Restoran, Kafe, Belanja Bulanan", spent: 1575000, total: 3500000, icon: "makanan", color: "text-orange-500", bgColor: "bg-orange-50", shadowColor: "shadow-orange-100" },
  { id: 2, category: "Transportasi", subtitle: "Bensin, Parkir, Ojek Online", spent: 864000, total: 1200000, icon: "transportasi", color: "text-blue-500", bgColor: "bg-blue-50", shadowColor: "shadow-blue-100" },
  { id: 3, category: "Hiburan", subtitle: "Streaming, Bioskop, Hobby", spent: 680000, total: 800000, icon: "hiburan", color: "text-purple-500", bgColor: "bg-purple-50", shadowColor: "shadow-purple-100" },
  { id: 4, category: "Tagihan", subtitle: "Listrik, Air, Internet", spent: 1880000, total: 2000000, icon: "tagihan", color: "text-yellow-500", bgColor: "bg-yellow-50", shadowColor: "shadow-yellow-100" },
];

export const mockInsights = [
  {
    id: 1,
    type: "alert",
    title: "Pengeluaran Tidak Biasa Terdeteksi",
    description: "Kamu menghabiskan 40% lebih banyak untuk Makanan minggu ini dibandingkan minggu lalu.",
    action: "Tinjau Anggaran",
  },
  {
    id: 2,
    type: "recommendation",
    title: "Hemat dari Langganan",
    description: "Kamu memiliki 3 langganan tidak aktif seharga Rp 450.000/bulan. Pertimbangkan untuk membatalkannya.",
    action: "Lihat Langganan",
  },
  {
    id: 3,
    type: "positive",
    title: "Sesuai Target",
    description: "Kerja bagus! Kamu berada di jalur yang tepat untuk mencapai target tabungan Rp 10.000.000 pada bulan Desember.",
    action: "Lihat Target",
  }
];

export const mockChartData = [
  { name: 'Mon', spent: 45 },
  { name: 'Tue', spent: 120 },
  { name: 'Wed', spent: 35 },
  { name: 'Thu', spent: 250 },
  { name: 'Fri', spent: 65 },
  { name: 'Sat', spent: 180 },
  { name: 'Sun', spent: 90 },
];
