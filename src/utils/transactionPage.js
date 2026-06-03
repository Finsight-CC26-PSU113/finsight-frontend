import { BookOpen, Car, Coffee, Heart, HelpCircle, PiggyBank, Plane, ShoppingBag, Tv, Wallet, Zap } from "lucide-react";

const allowedReceiptMimeTypes = new Set(["image/png", "image/jpeg", "image/jpg"]);

export const RECEIPT_IMAGE_ACCEPT = "image/png,image/jpeg,image/jpg,.png,.jpg,.jpeg";

const loadImageElement = (file) =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Gagal membaca gambar struk"));
    };

    image.src = objectUrl;
  });

export const preprocessReceiptImage = async (file) => {
  if (!file) return file;

  if (typeof window === "undefined" || typeof document === "undefined") {
    return file;
  }

  const shouldCompress = file.size > 2 * 1024 * 1024 || file.type !== "image/jpeg";
  if (!shouldCompress) {
    return file;
  }

  const image = await loadImageElement(file);
  const maxWidth = 1600;
  const scale = image.naturalWidth > maxWidth ? maxWidth / image.naturalWidth : 1;
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    return file;
  }

  context.drawImage(image, 0, 0, width, height);

  const blob = await new Promise((resolve) => {
    canvas.toBlob((value) => resolve(value), "image/jpeg", 0.82);
  });

  if (!blob) {
    return file;
  }

  const baseName = file.name.replace(/\.[^.]+$/, "") || "receipt";
  return new File([blob], `${baseName}-ocr.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
};

export const isAllowedReceiptImageFile = (file) => {
  if (!file?.type) return false;
  return allowedReceiptMimeTypes.has(file.type.toLowerCase());
};

export const getUniqueMonths = (transactions = []) => {
  const unique = [];

  transactions.forEach((tx) => {
    const d = new Date(tx.date);
    const monthLabel = d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    if (!unique.some((item) => item.val === val)) {
      unique.push({ label: monthLabel, val });
    }
  });

  return unique.sort((a, b) => b.val.localeCompare(a.val));
};

export const getPaymentMethod = (tx) => {
  if (tx.paymentMethod) return tx.paymentMethod;
  if (tx.type === "income") {
    return tx.id % 2 === 0 ? "Bank Mandiri" : "BCA";
  }

  const methods = ["BCA", "GoPay", "Kartu Kredit", "Dana"];
  return methods[tx.id % methods.length];
};

export const getTime = (tx) => {
  if (tx.time) return tx.time;
  const times = ["13:20", "08:45", "09:00", "19:45", "10:15"];
  return times[tx.id % times.length];
};

export const getCategoryStyles = (category = "") => {
  const cat = category.toLowerCase();

  switch (cat) {
    case "makanan":
    case "makan & minum":
      return {
        bg: "bg-orange-50 text-orange-600 border-orange-100",
        label: "Makan & Minum",
        iconBg: "bg-orange-100 text-orange-600",
        icon: Coffee,
      };
    case "transportasi":
      return {
        bg: "bg-blue-50 text-blue-600 border-blue-100",
        label: "Transportasi",
        iconBg: "bg-blue-100 text-blue-600",
        icon: Car,
      };
    case "belanja":
      return {
        bg: "bg-indigo-50 text-indigo-600 border-indigo-100",
        label: "Belanja",
        iconBg: "bg-indigo-100 text-indigo-600",
        icon: ShoppingBag,
      };
    case "hiburan":
      return {
        bg: "bg-purple-50 text-purple-600 border-purple-100",
        label: "Hiburan",
        iconBg: "bg-purple-100 text-purple-600",
        icon: Tv,
      };
    case "tagihan":
      return {
        bg: "bg-amber-50 text-amber-600 border-amber-100",
        label: "Tagihan",
        iconBg: "bg-amber-100 text-amber-600",
        icon: Zap,
      };
    case "pendapatan":
    case "pemasukan":
      return {
        bg: "bg-emerald-50 text-emerald-600 border-emerald-100",
        label: "Pemasukan",
        iconBg: "bg-emerald-100 text-emerald-600",
        icon: Wallet,
      };
    case "sosial":
      return {
        bg: "bg-rose-50 text-rose-600 border-rose-100",
        label: "Sosial",
        iconBg: "bg-rose-100 text-rose-600",
        icon: Heart,
      };
    case "pendidikan":
      return {
        bg: "bg-teal-50 text-teal-600 border-teal-100",
        label: "Pendidikan",
        iconBg: "bg-teal-100 text-teal-600",
        icon: BookOpen,
      };
    case "travel":
      return {
        bg: "bg-cyan-50 text-cyan-600 border-cyan-100",
        label: "Travel",
        iconBg: "bg-cyan-100 text-cyan-600",
        icon: Plane,
      };
    case "kesehatan dan perawatan diri":
      return {
        bg: "bg-red-50 text-red-600 border-red-100",
        label: "Kesehatan & Perawatan",
        iconBg: "bg-red-100 text-red-600",
        icon: Heart,
      };
    case "tabungan":
      return {
        bg: "bg-sky-50 text-sky-600 border-sky-100",
        label: "Tabungan",
        iconBg: "bg-sky-100 text-sky-600",
        icon: PiggyBank,
      };
    default:
      return {
        bg: "bg-slate-50 text-slate-600 border-slate-100",
        label: category || "Lainnya",
        iconBg: "bg-slate-100 text-slate-600",
        icon: HelpCircle,
      };
  }
};

export const getLatestTxMonthAndYear = (transactions = []) => {
  if (transactions.length === 0) {
    return { month: new Date().getMonth(), year: new Date().getFullYear() };
  }

  const dates = transactions.map((transaction) => new Date(transaction.date));
  const latestDate = new Date(Math.max(...dates));
  return { month: latestDate.getMonth(), year: latestDate.getFullYear() };
};

export const formatDateHeader = (dateStr) => {
  const date = new Date(dateStr);
  const options = { weekday: "long", day: "numeric", month: "long" };
  const formatted = date.toLocaleDateString("id-ID", options);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

const parseReceiptTotal = (scan) => {
  const candidates = [scan?.total, scan?.totals?.grand_total, scan?.extracted?.total, scan?.data?.extracted?.total];

  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined) continue;

    if (typeof candidate === "number" && Number.isFinite(candidate)) {
      return candidate;
    }

    const parsed = Number(String(candidate).replace(/[^\d-]/g, ""));
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return 0;
};

export const buildTransactionFromScan = (scan) => {
  const grandTotal = parseReceiptTotal(scan);
  if (!grandTotal || grandTotal <= 0) {
    return null;
  }

  const parsedDate = new Date(scan?.date || scan?.extracted?.date || new Date().toISOString());
  const transactionDate = Number.isNaN(parsedDate.getTime()) ? new Date().toISOString().slice(0, 10) : parsedDate.toISOString().slice(0, 10);

  const itemNames = [...(scan?.items || []), ...(scan?.extracted?.items || [])]
    .map((item) => (typeof item === "string" ? item : item?.name))
    .filter(Boolean)
    .slice(0, 5)
    .join(", ");

  return {
    title: scan?.store || scan?.merchant || scan?.extracted?.store || "Struk",
    amount: grandTotal,
    category: "",
    type: "expense",
    date: transactionDate,
    paymentMethod: "cash",
    description: itemNames ? `${scan?.store || scan?.extracted?.store || ""} - ${itemNames}` : scan?.store || scan?.extracted?.store || "",
  };
};
