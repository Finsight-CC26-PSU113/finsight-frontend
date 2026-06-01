/** Shared palette — each entry must have a unique hex for the chart. */
export const BUDGET_LABEL_COLORS = [
  { name: "Blue", value: "bg-blue-500", hex: "#3b82f6" },
  { name: "Purple", value: "bg-purple-500", hex: "#a855f7" },
  { name: "Red", value: "bg-red-500", hex: "#ef4444" },
  { name: "Yellow", value: "bg-yellow-500", hex: "#eab308" },
  { name: "Green", value: "bg-green-500", hex: "#22c55e" },
  { name: "Indigo", value: "bg-indigo-500", hex: "#6366f1" },
  { name: "Pink", value: "bg-pink-500", hex: "#ec4899" },
  { name: "Orange", value: "bg-orange-500", hex: "#f97316" },
  { name: "Teal", value: "bg-teal-500", hex: "#14b8a6" },
  { name: "Cyan", value: "bg-cyan-500", hex: "#06b6d4" },
];

const STORAGE_KEY = "finsight_budget_colors";

const LEGACY_COLOR_HEX = {
  "text-orange-500": "#f97316",
  "text-blue-500": "#3b82f6",
  "text-purple-500": "#a855f7",
  "text-yellow-500": "#eab308",
  "text-sky-500": "#0ea5e9",
  "text-slate-500": "#64748b",
};

const persistStoredBudgetColors = (mapping) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mapping));
};

export const getStoredBudgetColors = () => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const setBudgetColorForCategory = (categoryId, colorValue) => {
  if (!categoryId || !colorValue || typeof window === "undefined") return;
  const stored = getStoredBudgetColors();
  stored[categoryId] = colorValue;
  persistStoredBudgetColors(stored);
};

export const getBudgetColorHex = (colorValue, fallbackIndex = 0) => {
  const fromPalette = BUDGET_LABEL_COLORS.find((item) => item.value === colorValue)?.hex;
  if (fromPalette) return fromPalette;
  if (LEGACY_COLOR_HEX[colorValue]) return LEGACY_COLOR_HEX[colorValue];
  return BUDGET_LABEL_COLORS[fallbackIndex % BUDGET_LABEL_COLORS.length].hex;
};

export const getNextBudgetColor = (budgetCount = 0) => BUDGET_LABEL_COLORS[budgetCount % BUDGET_LABEL_COLORS.length].value;

/** Picks a palette color not yet used by current budgets (or stored map). */
export const getNextUnusedBudgetColor = (budgets = []) => {
  const used = new Set();
  budgets.forEach((budget) => {
    if (budget?.color) used.add(budget.color);
    if (budget?.chartColor) used.add(budget.chartColor);
  });
  Object.values(getStoredBudgetColors()).forEach((colorValue) => used.add(colorValue));

  const unused = BUDGET_LABEL_COLORS.find((item) => !used.has(item.value));
  return unused?.value ?? getNextBudgetColor(budgets.length);
};

const pickUniqueColor = (usedHex, preferredValue, fallbackIndex) => {
  if (preferredValue) {
    const hex = getBudgetColorHex(preferredValue, fallbackIndex);
    if (!usedHex.has(hex)) {
      return preferredValue;
    }
  }

  const unused = BUDGET_LABEL_COLORS.find((item) => !usedHex.has(item.hex));
  if (unused) return unused.value;

  return BUDGET_LABEL_COLORS[fallbackIndex % BUDGET_LABEL_COLORS.length].value;
};

/** Ensures every budget in the list gets a distinct chart color. */
export const applyBudgetColors = (budgets = []) => {
  const sorted = [...budgets].sort(
    (a, b) => `${a.category || ""}`.localeCompare(`${b.category || ""}`, "id") || `${a.id || ""}`.localeCompare(`${b.id || ""}`)
  );
  const stored = getStoredBudgetColors();
  const usedHex = new Set();
  const nextStored = { ...stored };

  const colored = sorted.map((budget, index) => {
    const preferred = budget.category_id ? stored[budget.category_id] : null;
    const color = pickUniqueColor(usedHex, preferred, index);
    const chartColor = getBudgetColorHex(color, index);

    usedHex.add(chartColor);
    if (budget.category_id) {
      nextStored[budget.category_id] = color;
    }

    return { ...budget, color, chartColor };
  });

  persistStoredBudgetColors(nextStored);
  return colored;
};
