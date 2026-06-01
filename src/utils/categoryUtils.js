/** Maps frontend / legacy labels to system category names in the database (Prisma seed). */
export const SYSTEM_CATEGORY_ALIASES = {
  transportasi: "transport",
  transport: "transport",
  makanan: "makanan",
  "makanan & minum": "makanan",
  food: "makanan",
  belanja: "belanja",
  shopping: "belanja",
  hiburan: "hiburan",
  entertainment: "hiburan",
  tagihan: "tagihan",
  bill: "tagihan",
  kesehatan: "kesehatan",
  "kesehatan dan perawatan diri": "kesehatan",
  health: "kesehatan",
  lainnya: "lainnya",
  other: "lainnya",
};

export const SYSTEM_CATEGORY_NAMES = ["makanan", "transport", "hiburan", "belanja", "kesehatan", "tagihan", "lainnya"];

/** 7 kategori pengeluaran untuk filter transaksi & saran anggaran */
export const EXPENSE_FILTER_CATEGORIES = ["makanan", "belanja", "tagihan", "kesehatan", "transport", "hiburan", "lainnya"];

export const normalizeCategoryName = (name) => {
  const key = `${name || ""}`.trim().toLowerCase();
  return SYSTEM_CATEGORY_ALIASES[key] || key;
};

export const formatCategoryLabel = (name) => {
  const normalized = normalizeCategoryName(name);
  if (normalized === "transport") return "Transportasi";
  if (normalized === "kesehatan") return "Kesehatan";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

export const findCategoryByName = (name, categories = [], customCategories = []) => {
  const normalized = normalizeCategoryName(name);

  const matchInList = (list) =>
    list.find((category) => {
      const categoryName = normalizeCategoryName(category?.name);
      return categoryName === normalized;
    });

  return matchInList(categories) || matchInList(customCategories) || null;
};

export const resolveCategoryId = (name, categories = [], customCategories = []) => {
  const match = findCategoryByName(name, categories, customCategories);
  return match?.id || null;
};

export const buildExpenseCategoryOptions = (categories = [], customCategories = []) => {
  const seen = new Set();
  const options = [];

  for (const category of [...categories, ...customCategories]) {
    if (!category?.id || !category?.name) continue;
    const key = normalizeCategoryName(category.name);
    if (seen.has(key)) continue;
    seen.add(key);
    options.push({
      id: category.id,
      name: category.name,
      label: formatCategoryLabel(category.name),
    });
  }

  return options;
};
