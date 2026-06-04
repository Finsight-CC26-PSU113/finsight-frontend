import React, { useState, useEffect, useRef, useCallback } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { useAppContext } from "../../context/AppContext";
import { Save, Sparkles, UploadCloud, Camera, Loader2, Check, AlertCircle, X, ZoomIn } from "lucide-react";
import { formatRupiahInput, parseRupiahInput } from "../../utils/currencyInput";
import { apiRequest } from "../../utils/apiClient";
import { RECEIPT_IMAGE_ACCEPT, preprocessReceiptImage, isAllowedReceiptImageFile, buildTransactionFromScan } from "../../utils/transactionPage";

export const AddTransactionModal = ({ isOpen, onClose }) => {
  const { addTransaction, editTx, updateTransaction, categories, customCategories, authToken } = useAppContext();

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    type: "expense",
    date: new Date().toISOString().split("T")[0],
  });

  const [isScanningReceipt, setIsScanningReceipt] = useState(false);
  const [scanMessage, setScanMessage] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const scanInputRef = useRef(null);
  const scanMsgTimerRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraStreamRef = useRef(null);

  // Stop camera stream and close camera view
  const stopCamera = useCallback(() => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
    }
    setIsCameraOpen(false);
    setCameraError("");
  }, []);

  // Attach stream to video element after camera view mounts
  useEffect(() => {
    if (isCameraOpen && videoRef.current && cameraStreamRef.current) {
      videoRef.current.srcObject = cameraStreamRef.current;
    }
  }, [isCameraOpen]);

  // Reset form + stop camera when modal opens/closes
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
      setScanMessage(null);
    } else {
      stopCamera();
    }
  }, [isOpen, editTx, stopCamera]);

  const expenseCategories = Array.from(
    new Set([...categories, ...customCategories].map((c) => c?.name).filter(Boolean))
  );
  const fallbackExpenseCategories = [
    "transportasi", "belanja", "makanan", "hiburan", "sosial",
    "pendidikan", "travel", "kesehatan dan perawatan diri", "tagihan", "lainnya",
  ];
  const incomeCategories = ["pendapatan", "lainnya"];
  const categoryOptions =
    formData.type === "expense"
      ? expenseCategories.length > 0 ? expenseCategories : fallbackExpenseCategories
      : incomeCategories;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === "amount" ? formatRupiahInput(value) : value }));
  };

  const showScanMsg = (type, text, duration = 0) => {
    if (scanMsgTimerRef.current) clearTimeout(scanMsgTimerRef.current);
    setScanMessage({ type, text });
    if (duration > 0) {
      scanMsgTimerRef.current = setTimeout(() => setScanMessage(null), duration);
    }
  };

  // Core scan logic — shared by file upload and camera capture
  const processScanFile = async (file) => {
    if (!authToken) {
      showScanMsg("error", "Silakan masuk terlebih dahulu.", 3000);
      return;
    }

    setIsScanningReceipt(true);
    showScanMsg("loading", "Memproses struk...");

    try {
      const fd = new FormData();
      const uploadFile = await preprocessReceiptImage(file);
      fd.append("image", uploadFile);

      const payload = await apiRequest("/api/scan", {
        method: "POST",
        token: authToken,
        body: fd,
      });

      const scan = payload?.data?.scan || payload?.scan || payload;
      const result = buildTransactionFromScan(scan);

      if (!result) {
        showScanMsg("error", "Total struk belum terbaca. Coba ambil foto ulang.", 3500);
        return;
      }

      setFormData((prev) => ({
        ...prev,
        title: result.title || prev.title,
        amount: formatRupiahInput(result.amount),
        type: "expense",
        date: result.date || prev.date,
      }));
      showScanMsg("success", "Struk terbaca! Periksa dan lengkapi data lalu simpan.", 4000);
    } catch {
      showScanMsg("error", "Gambar tidak dapat diproses saat ini.", 3000);
    } finally {
      setIsScanningReceipt(false);
    }
  };

  const handleScanFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isAllowedReceiptImageFile(file)) {
      showScanMsg("error", "Hanya file PNG, JPG, atau JPEG yang bisa diproses.", 3000);
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      showScanMsg("error", "Ukuran gambar terlalu besar.", 3000);
      return;
    }
    await processScanFile(file);
    e.target.value = "";
  };

  const handleOpenCamera = async () => {
    setCameraError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Browser tidak mendukung akses kamera.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      cameraStreamRef.current = stream;
      setIsCameraOpen(true);
    } catch (err) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError("Akses kamera ditolak. Izinkan akses kamera di pengaturan browser.");
      } else if (err.name === "NotFoundError") {
        setCameraError("Kamera tidak ditemukan di perangkat ini.");
      } else {
        setCameraError("Kamera tidak dapat diakses saat ini.");
      }
    }
  };

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    // Scale down to max 1024px wide — cukup untuk OCR, ukuran file lebih kecil
    const MAX_W = 1024;
    const scale = Math.min(1, MAX_W / video.videoWidth);
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

    stopCamera();

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          showScanMsg("error", "Gagal mengambil gambar dari kamera.", 3000);
          return;
        }
        const file = new File([blob], "struk.jpg", { type: "image/jpeg" });
        await processScanFile(file);
      },
      "image/jpeg",
      0.82
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    <Modal isOpen={isOpen} onClose={() => { stopCamera(); onClose(); }} title={editTx ? "Edit Transaksi" : "Tambah Transaksi Baru"} maxWidth="max-w-lg">
      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* ── Camera view ── */}
      {isCameraOpen ? (
        <div className="space-y-3">
          <div className="relative rounded-2xl overflow-hidden bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full max-h-[55vh] object-cover"
            />
            {/* Viewfinder overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="border-2 border-white/60 rounded-xl w-4/5 h-3/5 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
            </div>
            <p className="absolute bottom-3 left-0 right-0 text-center text-[11px] text-white/70 font-medium">
              Arahkan kamera ke struk lalu tekan Ambil Foto
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={stopCamera}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
            >
              <X className="w-4 h-4" />
              Batal
            </button>
            <button
              type="button"
              onClick={handleCapture}
              className="flex-[2] flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-all shadow-sm"
            >
              <ZoomIn className="w-4 h-4" />
              Ambil Foto
            </button>
          </div>
        </div>
      ) : (
        /* ── Normal form view ── */
        <div className="relative overflow-hidden">
          <div className="absolute -top-6 -right-6 p-4 opacity-10 pointer-events-none">
            <Sparkles className="w-20 h-20 text-indigo-600" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {/* Scan options — only for new transactions */}
            {!editTx && (
              <div>
                <div className="grid grid-cols-2 gap-2">
                  {/* Upload file */}
                  <div>
                    <input ref={scanInputRef} type="file" accept={RECEIPT_IMAGE_ACCEPT} className="hidden" onChange={handleScanFileChange} />
                    <button
                      type="button"
                      onClick={() => scanInputRef.current?.click()}
                      disabled={isScanningReceipt}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-3 border-2 border-dashed border-slate-300 hover:border-primary-400 hover:bg-primary-50 rounded-xl text-xs font-semibold text-slate-600 hover:text-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <UploadCloud className="w-4 h-4 shrink-0" />
                      Upload Struk
                    </button>
                  </div>

                  {/* Live camera */}
                  <button
                    type="button"
                    onClick={handleOpenCamera}
                    disabled={isScanningReceipt}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 border-2 border-dashed border-slate-300 hover:border-primary-400 hover:bg-primary-50 rounded-xl text-xs font-semibold text-slate-600 hover:text-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Camera className="w-4 h-4 shrink-0" />
                    Kamera Langsung
                  </button>
                </div>

                {/* Status messages */}
                {cameraError && (
                  <p className="mt-2 text-xs text-center flex items-center justify-center gap-1 text-rose-600">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {cameraError}
                  </p>
                )}
                {isScanningReceipt && (
                  <p className="mt-2 text-xs text-center flex items-center justify-center gap-1 text-slate-500">
                    <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                    Memproses struk...
                  </p>
                )}
                {scanMessage && !isScanningReceipt && (
                  <p className={`mt-2 text-xs text-center flex items-center justify-center gap-1 ${scanMessage.type === "success" ? "text-emerald-600" : scanMessage.type === "error" ? "text-rose-600" : "text-slate-500"}`}>
                    {scanMessage.type === "success" && <Check className="w-3 h-3 shrink-0" />}
                    {scanMessage.type === "error" && <AlertCircle className="w-3 h-3 shrink-0" />}
                    {scanMessage.text}
                  </p>
                )}

                <div className="relative flex items-center gap-3 mt-4">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">atau isi manual</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
              </div>
            )}

            {/* Type Toggle */}
            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={() => setFormData({ ...formData, type: "expense", category: "" })} className={`py-2.5 rounded-xl border-2 font-semibold transition-all text-sm flex items-center justify-center gap-1.5 ${formData.type === "expense" ? "border-red-500 bg-red-50 text-red-700 shadow-sm" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                Pengeluaran
              </button>
              <button type="button" onClick={() => setFormData({ ...formData, type: "income", category: "" })} className={`py-2.5 rounded-xl border-2 font-semibold transition-all text-sm flex items-center justify-center gap-1.5 ${formData.type === "income" ? "border-green-500 bg-green-50 text-green-700 shadow-sm" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
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
                  <option value="" disabled>Pilih Kategori</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
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
              <Button type="submit" fullWidth size="lg" disabled={isScanningReceipt} className="flex items-center justify-center gap-2">
                <Save className="w-4 h-4" />
                {editTx ? "Perbarui Transaksi" : "Simpan Transaksi"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
};
