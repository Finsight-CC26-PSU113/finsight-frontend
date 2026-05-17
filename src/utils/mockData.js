import { Activity, CalendarDays, Coffee, CreditCard, Gift, Home, Package, ShoppingCart, ShieldCheck, Sparkles, TrendingUp, Truck } from 'lucide-react'

export const summaryData = [
  {
    index: 0,
    key: 'spending',
    label: 'Total Spending',
    value: 'Rp 24.8J',
    subtitle: 'Bulan ini',
    iconBg: 'bg-blue-500',
  },
  {
    index: 1,
    key: 'budget',
    label: 'Remaining Budget',
    value: 'Rp 8.2J',
    subtitle: 'Sisa dari alokasi bulanan',
    iconBg: 'bg-cyan-500',
  },
  {
    index: 2,
    key: 'savings',
    label: 'Monthly Savings',
    value: 'Rp 4.5J',
    subtitle: 'Tabungan AI rekomendasi',
    iconBg: 'bg-violet-500',
  },
  {
    index: 3,
    key: 'transactions',
    label: 'Total Transactions',
    value: '128',
    subtitle: 'Semua akun',
    iconBg: 'bg-slate-900',
  },
]

export const chartData = [
  { day: 'Mon', spent: 570 },
  { day: 'Tue', spent: 620 },
  { day: 'Wed', spent: 540 },
  { day: 'Thu', spent: 720 },
  { day: 'Fri', spent: 680 },
  { day: 'Sat', spent: 760 },
  { day: 'Sun', spent: 690 },
]

export const insightsData = [
  {
    id: 1,
    type: 'recommendation',
    label: 'Rekomendasi',
    title: 'Potong biaya langganan',
    description: 'AI merekomendasikan review paket streaming dan membership yang jarang digunakan.',
    color: 'from-violet-500 to-fuchsia-500',
  },
  {
    id: 2,
    type: 'anomaly',
    label: 'Anomali',
    title: 'Transaksi tak biasa terdeteksi',
    description: 'Pembayaran travel malam hari terdeteksi di luar pola kebiasaan kamu.',
    color: 'from-rose-500 to-orange-500',
  },
  {
    id: 3,
    type: 'behavior',
    label: 'Perilaku',
    title: 'Pengeluaran makan meningkat',
    description: 'Laju pengeluaran makanan naik 18% dibanding minggu lalu.',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    id: 4,
    type: 'suggestion',
    label: 'Saran',
    title: 'Simpan lebih banyak secara otomatis',
    description: 'AI menyarankan alokasi tabungan darurat untuk target 6 bulan.',
    color: 'from-violet-500 to-cyan-500',
  },
]

export const transactions = [
  {
    id: 'T-1001',
    name: 'Coffee House',
    category: 'Food & Drink',
    amount: -56.0,
    date: '14 Mei',
    badgeBg: 'bg-violet-500',
    icon: Coffee,
  },
  {
    id: 'T-1002',
    name: 'Grocery Market',
    category: 'Groceries',
    amount: -240.0,
    date: '13 Mei',
    badgeBg: 'bg-cyan-500',
    icon: ShoppingCart,
  },
  {
    id: 'T-1003',
    name: 'Salary Bonus',
    category: 'Income',
    amount: 2750.0,
    date: '12 Mei',
    badgeBg: 'bg-emerald-500',
    icon: CreditCard,
  },
  {
    id: 'T-1004',
    name: 'Ride Share',
    category: 'Transport',
    amount: -34.0,
    date: '12 Mei',
    badgeBg: 'bg-slate-900',
    icon: Truck,
  },
]

export const budgetData = [
  {
    id: 1,
    category: 'Dining',
    usedLabel: 'Rp 2.8J',
    limitLabel: 'Rp 3.4J',
    percent: 82,
    status: 'Nearly full',
    statusTextClass: 'bg-amber-100 text-amber-700',
    fillClass: 'bg-amber-500',
  },
  {
    id: 2,
    category: 'Travel',
    usedLabel: 'Rp 1.1J',
    limitLabel: 'Rp 2.0J',
    percent: 55,
    status: 'On track',
    statusTextClass: 'bg-emerald-100 text-emerald-700',
    fillClass: 'bg-emerald-500',
  },
  {
    id: 3,
    category: 'Shopping',
    usedLabel: 'Rp 1.9J',
    limitLabel: 'Rp 2.2J',
    percent: 87,
    status: 'Warning',
    statusTextClass: 'bg-rose-100 text-rose-700',
    fillClass: 'bg-rose-500',
  },
  {
    id: 4,
    category: 'Health',
    usedLabel: 'Rp 820K',
    limitLabel: 'Rp 1.2J',
    percent: 68,
    status: 'Stable',
    statusTextClass: 'bg-sky-100 text-sky-700',
    fillClass: 'bg-sky-500',
  },
]
