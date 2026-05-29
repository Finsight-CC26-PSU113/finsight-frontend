import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Target, TrendingUp, CheckCircle2, Sparkles } from "lucide-react";

const riskQuestions = [
  {
    question: "Seberapa sering kamu mencatat pengeluaranmu sehari-hari?",
    options: [
      { text: "Tidak pernah — aku jarang tahu uangku habis ke mana", score: 1 },
      { text: "Kadang-kadang — kalau ingat saja", score: 2 },
      { text: "Selalu — aku punya catatan atau budget harian", score: 3 },
    ],
  },
  {
    question: "Bagaimana kamu biasanya bereaksi ketika pengeluaranmu melebihi budget bulan ini?",
    options: [
      { text: "Tenang saja, nanti gajian lagi toh", score: 1 },
      { text: "Agak khawatir, tapi sulit mengubah kebiasaan", score: 2 },
      { text: "Langsung evaluasi dan kurangi pengeluaran non-esensial", score: 3 },
    ],
  },
  {
    question: "Berapa persen dari penghasilanmu yang biasanya kamu sisihkan untuk tabungan setiap bulan?",
    options: [
      { text: "0% — sisa uang habis atau tidak ada sisa", score: 1 },
      { text: "1–10% — sedikit-sedikit kalau bisa", score: 2 },
      { text: "Lebih dari 10% — sudah rutinitas", score: 3 },
    ],
  },
  {
    question: "Apakah kamu pernah berinvestasi sebelumnya?",
    options: [
      { text: "Belum pernah sama sekali", score: 1 },
      { text: "Pernah mencoba (reksadana, saham, atau kripto) tapi belum rutin", score: 2 },
      { text: "Ya, sudah rutin dan paham risikonya", score: 3 },
    ],
  },
  {
    question: "Jika nilai investasimu turun 20% dalam sebulan, apa yang akan kamu lakukan?",
    options: [
      { text: "Langsung jual semua — tidak tahan melihat rugi", score: 1 },
      { text: "Khawatir, tapi tunggu dulu dan pantau perkembangannya", score: 2 },
      { text: "Tenang, bahkan mungkin tambah investasi (buy the dip)", score: 3 },
    ],
  },
  {
    question: "Berapa lama kamu bersedia menahan dana yang diinvestasikan tanpa menyentuhnya?",
    options: [
      { text: "Kurang dari 6 bulan — mungkin butuh sewaktu-waktu", score: 1 },
      { text: "6 bulan hingga 2 tahun", score: 2 },
      { text: "Lebih dari 2 tahun — ini uang jangka panjang", score: 3 },
    ],
  },
  {
    question: "Apa tujuan keuangan utamamu saat ini?",
    options: [
      { text: "Punya dana darurat dulu (3–6 bulan pengeluaran)", score: 1 },
      { text: "Menabung untuk tujuan spesifik (liburan, gadget, kendaraan)", score: 2 },
      { text: "Menumbuhkan aset jangka panjang (investasi, properti)", score: 3 },
    ],
  },
  {
    question: "Bagaimana kamu menggambarkan kondisi keuanganmu sekarang?",
    options: [
      { text: "Masih banyak pengeluaran tidak terduga dan sering boncos", score: 1 },
      { text: "Cukup stabil, sudah ada tabungan kecil tapi belum terstruktur", score: 2 },
      { text: "Terstruktur — punya budget, tabungan rutin, dan sudah mulai investasi", score: 3 },
    ],
  },
];

export const OnboardingPage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({});

  const totalQuestions = riskQuestions.length;
  const isFinished = step > totalQuestions;

  const handleNext = () => {
    if (!isFinished && !answers[step]) return;
    setStep(step + 1);
  };

  const handleFinish = () => {
    localStorage.setItem("onboarding_score", totalScore);
    localStorage.setItem("onboarding_profile", riskProfile);
    localStorage.setItem("onboarding_desc", riskDesc);
    localStorage.setItem("show_onboarding_popup", "true");
    localStorage.removeItem("needs_onboarding_survey");
    navigate("/");
  };

  const handleSelectOption = (score) => {
    setAnswers((prev) => ({ ...prev, [step]: score }));
  };

  const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
  let riskProfile = "";
  let riskDesc = "";
  let ProfileIcon = ShieldCheck;
  let iconColor = "text-green-500 bg-green-50";

  if (totalScore >= 8 && totalScore <= 13) {
    riskProfile = "Low Risk (Konservatif)";
    riskDesc = "Anda mengutamakan keamanan dana dan kenyamanan. FINSIGHT akan membantu Anda fokus pada dana darurat dan instrumen berisiko rendah.";
    ProfileIcon = ShieldCheck;
    iconColor = "text-green-500 bg-green-50";
  } else if (totalScore >= 14 && totalScore <= 19) {
    riskProfile = "Mid Risk (Moderat)";
    riskDesc = "Anda cukup toleran terhadap risiko demi pertumbuhan aset. FINSIGHT akan membantu merancang strategi seimbang antara keamanan dan investasi.";
    ProfileIcon = Target;
    iconColor = "text-blue-500 bg-blue-50";
  } else if (totalScore >= 20) {
    riskProfile = "High Risk (Agresif)";
    riskDesc = "Anda mencari pertumbuhan aset maksimal secara jangka panjang. FINSIGHT akan memberikan insight untuk memaksimalkan portfolio agresif Anda.";
    ProfileIcon = TrendingUp;
    iconColor = "text-orange-500 bg-orange-50";
  }

  const currentQ = !isFinished ? riskQuestions[step - 1] : null;

  const navButtons = (
    <>
      {!isFinished && step > 1 ? (
        <Button variant="ghost" onClick={() => setStep(step - 1)}>
          Kembali
        </Button>
      ) : (
        <div />
      )}
      {!isFinished ? (
        <Button onClick={handleNext} disabled={!answers[step]} className="px-8">
          {step === totalQuestions ? "Lihat Hasil" : "Selanjutnya"}
        </Button>
      ) : (
        <Button onClick={handleFinish} fullWidth size="lg">
          Selesai & Ke Dasbor
        </Button>
      )}
    </>
  );

  const questionContent = (
    <AnimatePresence mode="wait">
      {!isFinished ? (
        <motion.div key={`q-${step}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.2 }} className="space-y-4 md:space-y-6">
          <div>
            <span className="text-[11px] md:text-sm font-bold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Pertanyaan {step} dari {totalQuestions}
            </span>
            <h2 className="text-lg md:text-2xl font-bold text-slate-900 mt-3 leading-snug md:leading-relaxed">{currentQ.question}</h2>
          </div>

          <div className="space-y-2.5 md:space-y-3">
            {currentQ.options.map((option, index) => {
              const isSelected = answers[step] === option.score;
              return (
                <div key={index} onClick={() => handleSelectOption(option.score)} className={`flex items-center gap-3 p-3 md:p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 ${isSelected ? "border-primary-500 bg-primary-50 shadow-sm" : "border-slate-100 bg-white hover:border-primary-200 hover:bg-slate-50"}`}>
                  <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${isSelected ? "bg-primary-500 text-white" : "bg-slate-100 text-slate-500"}`}>{String.fromCharCode(65 + index)}</div>
                  <p className={`text-sm font-medium leading-snug ${isSelected ? "text-primary-900" : "text-slate-700"}`}>{option.text}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      ) : (
        <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4 md:space-y-6">
          <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto ${iconColor}`}>
            <ProfileIcon className="w-8 h-8 md:w-10 md:h-10" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Profil Risiko Finansial</span>
            <h2 className="text-xl md:text-3xl font-extrabold text-slate-900 mt-1">Profil Anda: {riskProfile}</h2>
            <p className="text-sm md:text-base text-slate-600 mt-2 leading-relaxed max-w-md mx-auto">{riskDesc}</p>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 md:p-5 text-left space-y-2 md:space-y-4 max-w-md mx-auto">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-green-500 shrink-0" />
              Personalisasi AI Selesai
            </h3>
            <ul className="text-xs md:text-sm text-slate-600 ml-6 list-disc space-y-1 leading-relaxed">
              <li>Rekomendasi anggaran disesuaikan</li>
              <li>Saran instrumen berdasar toleransi risiko</li>
              <li>Notifikasi anomali otomatis diaktifkan</li>
            </ul>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="h-screen overflow-hidden md:h-auto md:min-h-screen bg-slate-50 flex flex-col md:justify-center relative">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[35%] h-[35%] rounded-full bg-primary-200/40 blur-3xl" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[35%] h-[35%] rounded-full bg-indigo-200/40 blur-3xl" />
      </div>

      {/* ── MOBILE layout ── */}
      <div className="md:hidden relative z-10 flex flex-col h-full w-full px-5 justify-center">
        <div className="space-y-5">
          {/* Progress bar */}
          {!isFinished && (
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-400 mb-1.5">
                <span>Profil Risiko & Finansial</span>
                <span>
                  {step} / {totalQuestions}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <motion.div className="h-full bg-primary-600 rounded-full" animate={{ width: `${(step / totalQuestions) * 100}%` }} transition={{ duration: 0.3 }} />
              </div>
            </div>
          )}

          {/* Question */}
          {questionContent}

          {/* Nav buttons */}
          <div className="pt-2 border-t border-slate-100 flex justify-between items-center">{navButtons}</div>
        </div>
      </div>

      {/* ── DESKTOP layout ── */}
      <div className="hidden md:block relative z-10 w-full max-w-2xl mx-auto px-6 py-12">
        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center mb-8 gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-500 flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">FINSIGHT</h1>
            <p className="text-sm text-slate-500 mt-1">Personalisasi AI untuk profil keuangan Anda</p>
          </div>
        </motion.div>

        {/* Progress bar */}
        {!isFinished && (
          <div className="mb-8">
            <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
              <span>Profil Risiko & Finansial</span>
              <span>{Math.round((step / totalQuestions) * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <motion.div className="h-full bg-primary-600 rounded-full" animate={{ width: `${(step / totalQuestions) * 100}%` }} transition={{ duration: 0.3 }} />
            </div>
          </div>
        )}

        {/* Card */}
        <Card className="p-10 overflow-hidden relative shadow-xl shadow-slate-200/50">
          {questionContent}
          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">{navButtons}</div>
        </Card>
      </div>
    </div>
  );
};
