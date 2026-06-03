import React, { useState, useEffect } from "react";
import { LiteDashboardView } from "../components/dashboard/LiteDashboardView";
import { ProDashboardView } from "../components/dashboard/ProDashboardView";
import { Modal } from "../components/ui/Modal";
import { Button } from "../components/ui/Button";
import { OnboardingSurveyModal } from "../components/onboarding/OnboardingSurveyModal";
import { useAppContext } from "../context/AppContext";
import { ShieldCheck, Target, TrendingUp } from "lucide-react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export const DashboardPage = () => {
  const { dashboardMode } = useAppContext();
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

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

    if (dashboardMode === "lite") {
      setTimeout(() => {
        startTour();
      }, 450);
    }
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
      ],
    });

    driverObj.drive();
  };

  return (
    <>
      {dashboardMode === "pro" ? <ProDashboardView /> : <LiteDashboardView />}

      <OnboardingSurveyModal isOpen={isSurveyModalOpen} onComplete={handleSurveyComplete} />

      <Modal isOpen={isResultModalOpen} onClose={handleCloseResultModal} title="Selamat Datang di FINSIGHT! 🎉">
        <div className="space-y-6 text-center">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${
              riskProfile.includes("Low") || riskProfile.includes("Konservatif")
                ? "text-green-500 bg-green-50"
                : riskProfile.includes("High") || riskProfile.includes("Agresif")
                  ? "text-orange-500 bg-orange-50"
                  : "text-blue-500 bg-blue-50"
            }`}
          >
            {riskProfile.includes("Low") || riskProfile.includes("Konservatif") ? (
              <ShieldCheck className="w-10 h-10" />
            ) : riskProfile.includes("High") || riskProfile.includes("Agresif") ? (
              <TrendingUp className="w-10 h-10" />
            ) : (
              <Target className="w-10 h-10" />
            )}
          </div>

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
    </>
  );
};
