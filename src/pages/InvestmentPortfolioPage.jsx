import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { ArrowLeft, Plus, Trash2, Pencil, Search } from "lucide-react";
import { Modal } from "../components/ui/Modal";
import { useAppContext } from "../context/AppContext";

export const InvestmentPortfolioPage = () => {
  const navigate = useNavigate();
  const { fetchInvestmentProducts, fetchInvestmentPortfolio, savePortfolioPosition, updatePortfolioPosition, deletePortfolioPosition } = useAppContext();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [portfolio, setPortfolio] = useState(null);

  const [products, setProducts] = useState([]);
  const [productsSearch, setProductsSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [formProductId, setFormProductId] = useState("");
  const [formQuantity, setFormQuantity] = useState("");
  const [formAvgCost, setFormAvgCost] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(value || 0));

  const loadPortfolio = async () => {
    const next = await fetchInvestmentPortfolio();
    setPortfolio(next);
    return next;
  };

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError("");

    (async () => {
      try {
        // Load minimal catalog for selection (all categories)
        const categories = ["stock", "mutual_fund", "bond", "gold"];
        const all = [];
        for (const category of categories) {
          const chunk = await fetchInvestmentProducts({ category });
          all.push(...chunk);
        }

        if (cancelled) return;
        setProducts(all);
        await loadPortfolio();
      } catch (e) {
        if (cancelled) return;
        setError(e?.message || "Gagal memuat portofolio");
      } finally {
        if (cancelled) return;
        setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredProducts = useMemo(() => {
    const q = productsSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => `${p.name} ${p.symbol}`.toLowerCase().includes(q));
  }, [products, productsSearch]);

  const openCreate = () => {
    setEditingPosition(null);
    setFormProductId(filteredProducts[0]?.id || products[0]?.id || "");
    setFormQuantity("");
    setFormAvgCost("");
    setIsModalOpen(true);
  };

  const openEdit = (position) => {
    setEditingPosition(position);
    setFormProductId(position.product?.id || "");
    setFormQuantity(String(position.quantity ?? ""));
    setFormAvgCost(position.avg_cost !== null && position.avg_cost !== undefined ? String(position.avg_cost) : "");
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formProductId) return;
    if (!formQuantity || Number(formQuantity) <= 0) return;

    setIsSaving(true);
    try {
      const payload = {
        product_id: formProductId,
        quantity: Number(formQuantity),
        avg_cost: formAvgCost ? Number(formAvgCost) : null,
      };

      if (editingPosition?.id) {
        await updatePortfolioPosition(editingPosition.id, payload);
      } else {
        await savePortfolioPosition(payload);
      }

      await loadPortfolio();
      setIsModalOpen(false);
    } catch (e2) {
      window.alert(e2?.message || "Gagal menyimpan posisi");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (positionId) => {
    if (!window.confirm("Hapus posisi ini?")) return;
    try {
      await deletePortfolioPosition(positionId);
      await loadPortfolio();
    } catch (e) {
      window.alert(e?.message || "Gagal menghapus posisi");
    }
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={() => navigate("/investments")} className="px-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Portofolio Investasi</h1>
          <p className="text-sm text-slate-500">Tracking manual posisi + valuasi realtime dari API.</p>
        </div>
      </div>

      {error ? (
        <Card className="border border-red-100 bg-red-50/50">
          <div className="text-sm text-red-700">{error}</div>
        </Card>
      ) : isLoading ? (
        <Card className="border-dashed border-slate-200 bg-slate-50/70">
          <div className="text-sm text-slate-600">Memuat portofolio...</div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <div className="text-sm text-slate-500 font-medium">Total Portofolio</div>
              <div className="text-3xl font-extrabold text-slate-900 mt-2">{formatCurrency(portfolio?.value || 0)}</div>
              <div className="text-sm text-slate-500 mt-2">P/L: <span className="font-semibold text-slate-700">{formatCurrency(portfolio?.pnl || 0)}</span></div>
            </Card>
            <Card className="flex flex-col justify-between">
              <div>
                <div className="text-sm text-slate-500 font-medium">Aksi</div>
                <div className="text-sm text-slate-600 mt-2">Tambah posisi yang Anda beli secara manual.</div>
              </div>
              <Button onClick={openCreate} className="mt-4 flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Tambah Posisi
              </Button>
            </Card>
          </div>

          <Card className="p-0 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="text-sm font-semibold text-slate-700">Posisi</div>
              <div className="text-xs text-slate-400">{portfolio?.positions?.length || 0} item</div>
            </div>

            {(portfolio?.positions || []).length === 0 ? (
              <div className="p-4 text-sm text-slate-500">Belum ada posisi. Tambahkan posisi pertama Anda.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {portfolio.positions.map((pos) => (
                  <div key={pos.id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 truncate">
                        {pos.product?.name || "Produk"} <span className="text-xs font-bold text-slate-400">{pos.product?.symbol}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Qty: <span className="font-semibold text-slate-700">{pos.quantity}</span> • Harga:{" "}
                        <span className="font-semibold text-slate-700">{pos.quote?.price ? formatCurrency(pos.quote.price) : "-"}</span> • Nilai:{" "}
                        <span className="font-semibold text-slate-700">{formatCurrency(pos.market_value || 0)}</span>
                      </div>
                      {pos.avg_cost !== null && pos.avg_cost !== undefined && (
                        <div className="text-xs text-slate-500 mt-1">
                          Avg cost: <span className="font-semibold text-slate-700">{formatCurrency(pos.avg_cost)}</span> • P/L:{" "}
                          <span className="font-semibold text-slate-700">{pos.pnl !== null ? formatCurrency(pos.pnl) : "-"}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => openEdit(pos)} className="flex items-center gap-2">
                        <Pencil className="w-4 h-4" /> Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(pos.id)} className="text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-2">
                        <Trash2 className="w-4 h-4" /> Hapus
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={editingPosition ? "Edit Posisi" : "Tambah Posisi"}
            maxWidth="max-w-lg"
          >
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Produk</label>
                <div className="relative mb-2">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    value={productsSearch}
                    onChange={(e) => setProductsSearch(e.target.value)}
                    placeholder="Cari produk..."
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <select
                  value={formProductId}
                  onChange={(e) => setFormProductId(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {filteredProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.symbol} — {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    step="0.0001"
                    required
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="contoh: 10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Avg Cost (opsional)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formAvgCost}
                    onChange={(e) => setFormAvgCost(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="harga per unit"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={isSaving} className="flex items-center gap-2">
                  {isSaving ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
          </Modal>
        </>
      )}
    </div>
  );
};

