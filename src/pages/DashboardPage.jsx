import React, { useState, useEffect } from "react";
import { HeroInsight } from "../components/dashboard/HeroInsight";
import { SummaryCards } from "../components/dashboard/SummaryCards";
import { SpendingChart } from "../components/dashboard/SpendingChart";
import { RecentTransactions } from "../components/dashboard/RecentTransactions";
import { AiRecommendationFeed } from "../components/dashboard/AiRecommendationFeed";
import { AnomalyDetectionWidget } from "../components/dashboard/AnomalyDetectionWidget";
import { InvestmentPortfolioWidget } from "../components/dashboard/InvestmentPortfolioWidget";
import { Modal } from "../components/ui/Modal";
import { Button } from "../components/ui/Button";
import { OnboardingSurveyModal } from "../components/onboarding/OnboardingSurveyModal";
import { ShieldCheck, Target, TrendingUp } from "lucide-react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export const DashboardPage = () => {
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  // Retrieve onboarding results with solid Moderat fallbacks
  const [riskProfile, setRiskProfile] = useState(localStorage.getItem("onboarding_profile") || "Mid Risk (Moderat)");
  const [riskDesc, setRiskDesc] = useState(localStorage.getItem("onboarding_desc") || "Anda cukup toleran terhadap risiko demi pertumbuhan aset. FINSIGHT akan membantu merancang strategi seimbang antara keamanan dan investasi.");

  useEffect(() => {
    const needsSurvey = localStorage.getItem("needs_onboarding_survey") === "true";
    if (needsSurvey) {
      setIsSurveyModalOpen(true);
      return;
    }

    const showPopup = localStorage.getItem("show_onboarding_popup");
    if (showPopup === "true") {
      const newProfile = localStorage.getItem("onboarding_profile") || "Mid Risk (Moderat)";
      const newDesc = localStorage.getItem("onboarding_desc") || "Anda cukup toleran terhadap risiko demi pertumbuhan aset.";
      setRiskProfile(newProfile);
      setRiskDesc(newDesc);
      setIsResultModalOpen(true);
    }
  }, []);

  const handleSurveyComplete = () => {
    setIsSurveyModalOpen(false);
    const newProfile = localStorage.getItem("onboarding_profile") || "Mid Risk (Moderat)";
    const newDesc = localStorage.getItem("onboarding_desc") || "Anda cukup toleran terhadap risiko demi pertumbuhan aset.";
    setRiskProfile(newProfile);
    setRiskDesc(newDesc);
    setIsResultModalOpen(true);
  };

  const handleCloseResultModal = () => {
    setIsResultModalOpen(false);
    localStorage.setItem("show_onboarding_popup", "false");

    // Auto-start driver.js tour after a tiny delay for modal close transition
    setTimeout(() => {
      startTour();
    }, 450);
  };

  const startTour = () => {
    if (window.innerWidth < 768) return;

    const driverObj = driver({
      showProgress: true,
      nextBtnText: "Lanjut",
      prevBtnText: "&larr; Kembali",
      doneBtnText: "Selesai Tour",
      popoverClass: "driverjs-premium-theme",
      steps: [
        {
          popover: {
            title: "Selamat Datang di FINSIGHT! 🌟",
            description: "Mari ikuti panduan tour singkat untuk mengenal berbagai fitur premium di dasbor keuangan pintar Anda.",
            position: "center",
            showButtons: ["next"],
          },
        },
        {
          element: "#tour-hero-insight",
          popover: {
            title: "Rekomendasi Utama AI 💡",
            description: "Di sini, AI Finsight menampilkan rekomendasi atau peringatan keuangan paling krusial untuk Anda hari ini.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#tour-summary-cards",
          popover: {
            title: "Arus Kas & Saldo 💰",
            description: "Pantau total saldo bersih, serta perbandingan pendapatan dan pengeluaran Anda dalam sebulan secara seketika.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#tour-spending-chart",
          popover: {
            title: "Grafik Pengeluaran Mingguan 📊",
            description: "Menganalisis tren pengeluaran harian Anda sepanjang minggu untuk memantau batas pengeluaran sehat.",
            side: "top",
            align: "start",
          },
        },
        {
          element: "#tour-recent-transactions",
          popover: {
            title: "Riwayat Transaksi Terbaru 🧾",
            description: "Daftar transaksi pengeluaran dan pemasukan Anda baru-baru ini. Anda juga bisa mengelolanya di halaman Transaksi.",
            side: "top",
            align: "start",
          },
        },
        {
          element: "#tour-anomaly-widget",
          popover: {
            title: "Detektor Anomali Keuangan 🚨",
            description: "AI Finsight akan melacak pengeluaran Anda secara cerdas dan memberikan peringatan instan jika ada lonjakan dana yang mencurigakan.",
            side: "left",
            align: "start",
          },
        },
        {
          element: "#tour-ai-recommendations",
          popover: {
            title: "Rekomendasi Keuangan AI 🧠",
            description: "Umpan wawasan AI Finsight yang disesuaikan secara khusus dengan kondisi keuangan Anda untuk membantu menghemat pengeluaran.",
            side: "left",
            align: "start",
          },
        },
        {
          element: "#tour-portfolio-widget",
          popover: {
            title: "Portofolio Investasi Pintar 📈",
            description: "Pantau perkembangan aset dan alokasi dana investasi Anda agar tumbuh maksimal berdasar profil risiko Anda.",
            side: "left",
            align: "start",
          },
        },
      ],
    });

    driverObj.drive();
  };

  return (
    <div className="space-y-6 relative">
      <div id="tour-hero-insight">
        <HeroInsight />
      </div>

      <div id="tour-summary-cards">
        <SummaryCards />
      </div>

      {/* Main Layout: Two Columns */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Charts & Transactions */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          <div id="tour-spending-chart">
            <SpendingChart />
          </div>
          <div id="tour-recent-transactions">
            <RecentTransactions />
          </div>
        </div>

        {/* Right Column: AI Insights, Anomaly, & Portfolio */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <div id="tour-anomaly-widget">
            <AnomalyDetectionWidget />
          </div>
          <div id="tour-ai-recommendations">
            <AiRecommendationFeed />
          </div>
          <div id="tour-portfolio-widget">
            <InvestmentPortfolioWidget />
          </div>
        </div>
      </div>

      <OnboardingSurveyModal isOpen={isSurveyModalOpen} onComplete={handleSurveyComplete} />

      {/* Onboarding Result Popup Modal */}
      <Modal isOpen={isResultModalOpen} onClose={handleCloseResultModal} title="Selamat Datang di FINSIGHT! 🎉">
        <div className="space-y-6 text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${riskProfile.includes("Low") || riskProfile.includes("Konservatif") ? "text-green-500 bg-green-50" : riskProfile.includes("High") || riskProfile.includes("Agresif") ? "text-orange-500 bg-orange-50" : "text-blue-500 bg-blue-50"}`}>{riskProfile.includes("Low") || riskProfile.includes("Konservatif") ? <ShieldCheck className="w-10 h-10" /> : riskProfile.includes("High") || riskProfile.includes("Agresif") ? <TrendingUp className="w-10 h-10" /> : <Target className="w-10 h-10" />}</div>

          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Profil Risiko Finansial</span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1 leading-snug">{riskProfile}</h2>
            <p className="text-slate-500 text-sm mt-3 leading-relaxed max-w-sm mx-auto">{riskDesc}</p>
          </div>

          <div className="pt-2">
            <Button onClick={handleCloseResultModal} fullWidth size="lg" className="rounded-xl flex items-center justify-center gap-2 font-bold cursor-pointer">
              Mulai Panduan Aplikasi &rarr;
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
