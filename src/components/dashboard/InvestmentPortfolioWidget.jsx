import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { motion } from "framer-motion";
import { TrendingUp, ArrowRight, Banknote, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";

export const InvestmentPortfolioWidget = () => {
  const navigate = useNavigate();
  const { user, investments } = useAppContext();

  const portfolioValue = Number(investments?.portfolio?.value ?? user?.investment_portfolio_value ?? 0);
  const hasPortfolio = portfolioValue > 0;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="h-full">
      <Card className="h-full flex flex-col hover:shadow-float transition-all duration-300 border-none shadow-sm ring-1 ring-slate-100">
        {/* Header/Summary */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-medium text-slate-500">Portofolio Investasi</h3>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{hasPortfolio ? formatCurrency(portfolioValue) : "Belum ada"}</p>
          </div>
          {hasPortfolio && (
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Tersimpan di profil
            </span>
          )}
        </div>

        {/* Empty State */}
        {!hasPortfolio && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-4 gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
              <Banknote className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Anda belum memiliki portofolio investasi.
              <br />
              Mulai investasi sekarang!
            </p>
            <Button variant="primary" size="sm" onClick={() => navigate("/investments")} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white">
              <PlusCircle className="w-4 h-4" />
              Mulai Investasi
            </Button>
          </div>
        )}

        {/* Footer Action */}
        <div className="mt-auto pt-2 border-t border-slate-100">
          <Button variant="ghost" fullWidth onClick={() => navigate("/investments")} className="flex items-center justify-center gap-2 group text-primary-600 hover:text-primary-700 hover:bg-primary-50">
            Lihat Produk Investasi
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};
