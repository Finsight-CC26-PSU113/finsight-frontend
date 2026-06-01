import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Search, ArrowLeft, ArrowUpDown, ExternalLink } from "lucide-react";
import { useAppContext } from "../context/AppContext";

const CATEGORY_LABEL = {
  stock: "Saham",
  mutual_fund: "Reksa Dana",
  bond: "Obligasi",
  gold: "Emas",
};

const CATEGORY_TABS = ["stock", "mutual_fund", "bond", "gold"];

export const InvestmentsCatalogPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const { fetchInvestmentProducts, fetchInvestmentQuotes } = useAppContext();
  const activeCategory = CATEGORY_TABS.includes(category) ? category : "stock";

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name_asc");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [quotesBySymbol, setQuotesBySymbol] = useState({});

  const tabs = useMemo(
    () =>
      CATEGORY_TABS.map((id) => ({
        id,
        label: CATEGORY_LABEL[id] || id,
      })),
    []
  );

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError("");

    (async () => {
      try {
        const nextProducts = await fetchInvestmentProducts({
          category: activeCategory,
          search,
          sort: sort.startsWith("price") ? undefined : sort.replace("name_asc", ""),
        });

        if (cancelled) return;
        setProducts(nextProducts);

        const symbols = nextProducts.map((p) => p.symbol).filter(Boolean);
        const quotes = await fetchInvestmentQuotes(symbols);
        if (cancelled) return;

        const mapped = quotes.reduce((map, q) => {
          map[q.symbol] = q;
          return map;
        }, {});
        setQuotesBySymbol(mapped);
      } catch (e) {
        if (cancelled) return;
        setError(e?.message || "Gagal memuat produk investasi");
      } finally {
        if (cancelled) return;
        setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeCategory, search, sort, fetchInvestmentProducts, fetchInvestmentQuotes]);

  const sortedProducts = useMemo(() => {
    if (!sort.startsWith("price")) return products;
    const direction = sort === "price_desc" ? -1 : 1;
    return [...products].sort((a, b) => {
      const qa = quotesBySymbol[a.symbol];
      const qb = quotesBySymbol[b.symbol];
      const pa = Number(qa?.price || 0);
      const pb = Number(qb?.price || 0);
      return (pa - pb) * direction;
    });
  }, [products, sort, quotesBySymbol]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(value || 0));

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={() => navigate("/investments")} className="px-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Produk {CATEGORY_LABEL[activeCategory]}</h1>
          <p className="text-sm text-slate-500">Cari, filter kategori, dan urutkan produk investasi.</p>
        </div>
      </div>

      <Card>
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {tabs.map((tab) => {
              const isActive = tab.id === activeCategory;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => navigate(`/investments/${tab.id}`)}
                  className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                    isActive ? "bg-primary-600 text-white border-primary-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari produk (mis. BBCA, ORI024)..."
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="name_asc">Urutkan: Nama (A-Z)</option>
              <option value="price_desc">Urutkan: Harga (tinggi)</option>
              <option value="price_asc">Urutkan: Harga (rendah)</option>
              <option value="risk_asc">Urutkan: Risiko (rendah-tinggi)</option>
              <option value="risk_desc">Urutkan: Risiko (tinggi-rendah)</option>
              <option value="return_1y_desc">Urutkan: Return 1Y (tinggi)</option>
              <option value="return_1y_asc">Urutkan: Return 1Y (rendah)</option>
            </select>
          </div>
        </div>
      </Card>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-700">Daftar Produk</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/investments/portfolio")}>
              Portofolio
            </Button>
          </div>

          {error ? (
            <div className="p-4 text-sm text-red-600">{error}</div>
          ) : isLoading ? (
            <div className="p-4 text-sm text-slate-500">Memuat produk...</div>
          ) : sortedProducts.length === 0 ? (
            <div className="p-4 text-sm text-slate-500">Tidak ada produk yang cocok.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {sortedProducts.map((product) => {
                const quote = quotesBySymbol[product.symbol];
                const price = quote?.price ?? null;

                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => navigate(`/investments/product/${product.id}`)}
                    className="w-full text-left p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-slate-900 truncate">{product.name}</div>
                          <span className="text-xs font-bold text-slate-400">{product.symbol}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {product.provider ? `${product.provider} • ` : ""}
                          Risiko: {product.risk_level || "-"} • Return 1Y: {product.return_1y !== null && product.return_1y !== undefined ? `${Math.round(product.return_1y * 100)}%` : "-"}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <div className="text-sm font-bold text-slate-900">{price !== null ? formatCurrency(price) : "-"}</div>
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-end gap-1">
                          <ExternalLink className="w-3 h-3" />
                          Detail
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

