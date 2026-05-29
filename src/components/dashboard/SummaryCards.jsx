import React from "react";
import { motion } from "framer-motion";
import { Wallet, TrendingUp, TrendingDown, CreditCard } from "lucide-react";
import { Card } from "../ui/Card";
import { useAppContext } from "../../context/AppContext";

export const SummaryCards = () => {
  const { user } = useAppContext();
  const periodLabel = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(new Date());

  const cards = [
    {
      title: "Total Saldo",
      amount: user.balance,
      change: `Per ${periodLabel}`,
      isPositive: true,
      icon: Wallet,
      color: "text-primary-600",
      bgColor: "bg-primary-50",
    },
    {
      title: "Pemasukan Bulanan",
      amount: user.monthlyIncome,
      change: `Bulan ${periodLabel}`,
      isPositive: true,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Pengeluaran Bulanan",
      amount: user.monthlyExpenses,
      change: `Bulan ${periodLabel}`,
      isPositive: false,
      icon: TrendingDown,
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
    {
      title: "Kartu Aktif",
      amount: "3",
      change: "Semua aman",
      isPositive: true,
      icon: CreditCard,
      color: "text-ai",
      bgColor: "bg-ai-light",
      isCurrency: false,
    },
  ];

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <motion.div key={index} variants={item}>
          <Card className="hover:shadow-float transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${card.bgColor} ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${card.isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{card.change}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">{card.title}</p>
              <h3 className="text-2xl font-bold text-slate-900">{card.isCurrency !== false ? formatCurrency(card.amount) : card.amount}</h3>
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};
