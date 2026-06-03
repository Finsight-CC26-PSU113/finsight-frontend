import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { useAppContext } from "../../context/AppContext";
import { Save, Sparkles } from "lucide-react";
import { formatRupiahInput, parseRupiahInput } from "../../utils/currencyInput";

export const AddTransactionModal = ({ isOpen, onClose }) => {
  const { addTransaction, editTx, updateTransaction, categories, customCategories } = useAppContext();

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    type: "expense",
    date: new Date().toISOString().split("T")[0],
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (editTx) {
        setFormData({
          title: editTx.title || "",
          amount: formatRupiahInput(Math.abs(editTx.amount)),
          category: editTx.category || "",
          type: editTx.type || "expense",
          date: editTx.date || new Date().toISOString().split("T")[0],
        });
      } else {
        setFormData({
          title: "",
          amount: "",
          category: "",
          type: "expense",
          date: new Date().toISOString().split("T")[0],
        });
      }
    }
  }, [isOpen, editTx]);

  const expenseCategories = Array.from(new Set([...categories, ...customCategories].map((category) => category?.name).filter(Boolean)));
  const fallbackExpenseCategories = ["transportasi", "belanja", "makanan", "hiburan", "sosial", "pendidikan", "travel", "kesehatan dan perawatan diri", "tagihan", "lainnya"];

  const incomeCategories = ["pendapatan", "lainnya"];

  const categoryOptions = formData.type === "expense" ? (expenseCategories.length > 0 ? expenseCategories : fallbackExpenseCategories) : incomeCategories;

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextValue = name === "amount" ? formatRupiahInput(value) : value;
    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check validation manually just in case
    if (!formData.title || !formData.amount || !formData.category) {
      alert("Harap isi semua kolom wajib!");
      return;
    }

    const amountVal = parseRupiahInput(formData.amount);

    if (amountVal <= 0) {
      alert("Nominal harus lebih dari 0");
      return;
    }

    const txPayload = {
      title: formData.title,
      amount: formData.type === "expense" ? -amountVal : amountVal,
      category: formData.category,
      type: formData.type,
      date: formData.date,
      icon: formData.type === "expense" ? "ShoppingCart" : "Briefcase",
    };

    try {
      if (editTx && editTx.id) {
        await updateTransaction(editTx.id, txPayload);
      } else {
        await addTransaction(txPayload);
      }
      onClose();
    } catch (error) {
      alert(error.message || "Gagal menyimpan transaksi");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editTx ? "Edit Transaksi" : "Tambah Transaksi Baru"}>
      <div className="relative overflow-hidden">
        <div className="absolute -top-6 -right-6 p-4 opacity-10 pointer-events-none">
          <Sparkles className="w-20 h-20 text-indigo-600" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-4">
            <button type="button" onClick={() => setFormData({ ...formData, type: "expense", category: "" })} className={`py-2.5 rounded-xl border-2 font-semibold transition-all text-sm flex items-center justify-center gap-1.5 ${formData.type === "expense" ? "border-red-500 bg-red-50 text-red-700 shadow-sm" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              Pengeluaran
            </button>
            <button type="button" onClick={() => setFormData({ ...formData, type: "income", category: "" })} className={`py-2.5 rounded-xl border-2 font-semibold transition-all text-sm flex items-center justify-center gap-1.5 ${formData.type === "income" ? "border-green-500 bg-green-50 text-green-700 shadow-sm" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
              Pemasukan
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Jumlah <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">Rp</span>
              <input type="text" inputMode="numeric" name="amount" required value={formData.amount} onChange={handleChange} className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all font-semibold" placeholder="0" />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Judul Transaksi <span className="text-red-500">*</span>
            </label>
            <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" placeholder="e.g. Makan siang, Gaji Bulanan" />
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select name="category" required value={formData.category} onChange={handleChange} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all capitalize text-sm">
                <option value="" disabled>
                  Pilih Kategori
                </option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Tanggal <span className="text-red-500">*</span>
              </label>
              <input type="date" name="date" required value={formData.date} onChange={handleChange} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm" />
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" fullWidth size="lg" className="flex items-center justify-center gap-2">
              <Save className="w-4 h-4" />
              {editTx ? "Perbarui Transaksi" : "Simpan Transaksi"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
