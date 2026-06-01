import React, { useMemo, useState } from "react";
import { Card } from "../ui/Card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { useAppContext } from "../../context/AppContext";

const weekdayLabels = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const rangeOptions = [
  { value: "7d", label: "7 hari terakhir", description: "Pengeluaran Anda dalam 7 hari terakhir" },
  { value: "month", label: "Bulan ini", description: "Pengeluaran Anda selama bulan ini" },
  { value: "year", label: "Tahun ini", description: "Pengeluaran Anda selama tahun ini" },
  { value: "all", label: "Semua waktu", description: "Pengeluaran Anda dari seluruh riwayat transaksi" },
];

const formatLocalDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getTransactionDateKey = (transactionDate) => {
  if (!transactionDate) return "";

  const rawDate = typeof transactionDate === "string" ? transactionDate : new Date(transactionDate).toISOString();
  return rawDate.slice(0, 10);
};

const parseLocalDate = (dateKey) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
};

const buildWeeklyData = (transactions) => {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const dayKey = formatLocalDateKey(date);
    const spent = transactions.filter((transaction) => transaction.type === "expense" && getTransactionDateKey(transaction.date) === dayKey).reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);

    return {
      name: weekdayLabels[date.getDay()],
      spent,
    };
  });

  return days;
};

const buildMonthlyData = (transactions) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const dayKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const spent = transactions.filter((transaction) => transaction.type === "expense" && getTransactionDateKey(transaction.date) === dayKey).reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);

    return {
      name: String(day),
      spent,
    };
  });
};

const buildYearlyData = (transactions) => {
  const today = new Date();
  const year = today.getFullYear();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

  return Array.from({ length: 12 }, (_, index) => {
    const spent = transactions
      .filter((transaction) => {
        if (transaction.type !== "expense") return false;

        const transactionDate = parseLocalDate(getTransactionDateKey(transaction.date));
        return transactionDate.getFullYear() === year && transactionDate.getMonth() === index;
      })
      .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);

    return {
      name: monthNames[index],
      spent,
    };
  });
};

const buildAllTimeData = (transactions) => {
  const grouped = new Map();

  transactions.forEach((transaction) => {
    if (transaction.type !== "expense") return;

    const transactionDate = parseLocalDate(getTransactionDateKey(transaction.date));
    const key = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, "0")}`;
    const label = transactionDate.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
    const current = grouped.get(key) || { name: label, spent: 0 };
    current.spent += Math.abs(transaction.amount);
    grouped.set(key, current);
  });

  return [...grouped.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([, value]) => value);
};

export const SpendingChart = () => {
  const { transactions } = useAppContext();
  const [selectedRange, setSelectedRange] = useState("7d");

  const chartData = useMemo(() => {
    switch (selectedRange) {
      case "month":
        return buildMonthlyData(transactions);
      case "year":
        return buildYearlyData(transactions);
      case "all":
        return buildAllTimeData(transactions);
      case "7d":
      default:
        return buildWeeklyData(transactions);
    }
  }, [selectedRange, transactions]);

  const activeOption = rangeOptions.find((option) => option.value === selectedRange) || rangeOptions[0];
  const hasChartData = chartData.some((item) => item.spent > 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
      <Card className="h-full min-h-[400px] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Ringkasan Pengeluaran</h3>
            <p className="text-sm text-slate-500">{activeOption.description}</p>
          </div>
          <select value={selectedRange} onChange={(e) => setSelectedRange(e.target.value)} className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2">
            {rangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full mt-4">
          {hasChartData ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 28, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dy={10} interval={0} />
                <YAxis width={78} axisLine={false} tickLine={false} tickMargin={12} tick={{ fill: "#64748b", fontSize: 12 }} tickFormatter={(value) => `Rp ${value}`} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }} itemStyle={{ color: "#0f172a", fontWeight: "bold" }} formatter={(value) => [`Rp ${value}`, "Terpakai"]} />
                <Area type="monotone" dataKey="spent" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSpent)" activeDot={{ r: 6, strokeWidth: 0, fill: "#4f46e5" }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 flex items-center justify-center text-center px-6">
              <div>
                <p className="text-base font-semibold text-slate-900">Belum ada data pengeluaran untuk {activeOption.label.toLowerCase()}.</p>
                <p className="text-sm text-slate-500 mt-2">Tambahkan transaksi expense agar grafik muncul otomatis.</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};
