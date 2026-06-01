import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { ArrowLeft, TrendingUp, Shield, Calendar } from "lucide-react";
import { useAppContext } from "../context/AppContext";

export const InvestmentProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchInvestmentProductById, fetchInvestmentQuotes } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [product, setProduct] = useState(null);
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError("");

    (async () => {
      try {
        const next = await fetchInvestmentProductById(id);
        if (cancelled) return;
        setProduct(next);

        const quotes = await fetchInvestmentQuotes(next?.symbol ? [next.symbol] : []);
        if (cancelled) return;
        setQuote(quotes[0] || null);
      } catch (e) {
        if (cancelled) return;
        setError(e?.message || "Gagal memuat detail produk");
      } finally {
        if (cancelled) return;
        setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, fetchInvestmentProductById, fetchInvestmentQuotes]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(value || 0));

  const return1yLabel = useMemo(() => {
    if (product?.return_1y === null || product?.return_1y === undefined) return "-";
    return `${Math.round(Number(product.return_1y) * 100)}%`;
  }, [product]);

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={() => navigate(-1)} className="px-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Detail Produk</h1>
          <p className="text-sm text-slate-500">{product?.symbol ? `${product.symbol} • ` : ""}{product?.provider || "Investasi"}</p>
        </div>
      </div>

      {error ? (
        <Card className="border border-red-100 bg-red-50/50">
          <div className="text-sm text-red-700">{error}</div>
        </Card>
      ) : isLoading ? (
        <Card className="border-dashed border-slate-200 bg-slate-50/70">
          <div className="text-sm text-slate-600">Memuat detail produk...</div>
        </Card>
      ) : !product ? (
        <Card className="border-dashed border-slate-200 bg-slate-50/70">
          <div className="text-sm text-slate-600">Produk tidak ditemukan.</div>
        </Card>
      ) : (
        <>
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="min-w-0">
                <div className="text-lg font-bold text-slate-900">{product.name}</div>
                <div className="text-sm text-slate-500 mt-1">
                  Kategori: <span className="font-semibold text-slate-700">{product.category}</span>
                </div>
              </div>
              <div className="shrink-0 text-left sm:text-right">
                <div className="text-xs text-slate-500">Harga (realtime)</div>
                <div className="text-2xl font-extrabold text-slate-900">{quote?.price ? formatCurrency(quote.price) : "-"}</div>
                <div className="text-[10px] text-slate-400 mt-1">As of: {quote?.as_of ? new Date(quote.as_of).toLocaleString("id-ID") : "-"}</div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <TrendingUp className="w-4 h-4" />
                Return_1Y
              </div>
              <div className="text-lg font-bold text-slate-900 mt-2">{return1yLabel}</div>
            </Card>
            <Card>
              <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <Shield className="w-4 h-4" />
                Risiko
              </div>
              <div className="text-lg font-bold text-slate-900 mt-2">{product.risk_level || "-"}</div>
            </Card>
            <Card>
              <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <Calendar className="w-4 h-4" />
                Tenor
              </div>
              <div className="text-lg font-bold text-slate-900 mt-2">{product.tenor_months ? `${product.tenor_months} bulan` : "-"}</div>
              <div className="text-xs text-slate-500 mt-1">{product.coupon_rate ? `Kupon: ${Math.round(product.coupon_rate * 10000) / 100}%` : ""}</div>
            </Card>
          </div>

          <Card className="bg-slate-50/60 border border-slate-100">
            <div className="text-sm font-semibold text-slate-700 mb-2">Catatan</div>
            <div className="text-sm text-slate-600 leading-relaxed">
              Aplikasi ini hanya untuk informasi & tracking portofolio. Fitur pembelian tidak tersedia.
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

