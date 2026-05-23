import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { RiskQuestionCard } from './RiskQuestionCard';
import { ShieldCheck, Target, TrendingUp, CheckCircle2 } from 'lucide-react';

const riskQuestions = [
  {
    question: "Seberapa sering kamu mencatat pengeluaranmu sehari-hari?",
    options: [
      { text: "Tidak pernah — aku jarang tahu uangku habis ke mana", score: 1 },
      { text: "Kadang-kadang — kalau ingat saja", score: 2 },
      { text: "Selalu — aku punya catatan atau budget harian", score: 3 }
    ]
  },
  {
    question: "Bagaimana kamu biasanya bereaksi ketika pengeluaranmu melebihi budget bulan ini?",
    options: [
      { text: "Tenang saja, nanti gajian lagi toh", score: 1 },
      { text: "Agak khawatir, tapi sulit mengubah kebiasaan", score: 2 },
      { text: "Langsung evaluasi dan kurangi pengeluaran non-esensial", score: 3 }
    ]
  },
  {
    question: "Berapa persen dari penghasilanmu yang biasanya kamu sisihkan untuk tabungan setiap bulan?",
    options: [
      { text: "0% — sisa uang habis atau tidak ada sisa", score: 1 },
      { text: "1–10% — sedikit-sedikit kalau bisa", score: 2 },
      { text: "Lebih dari 10% — sudah rutinitas", score: 3 }
    ]
  },
  {
    question: "Apakah kamu pernah berinvestasi sebelumnya?",
    options: [
      { text: "Belum pernah sama sekali", score: 1 },
      { text: "Pernah mencoba (reksadana, saham, atau kripto) tapi belum rutin", score: 2 },
      { text: "Ya, sudah rutin dan paham risikonya", score: 3 }
    ]
  },
  {
    question: "Jika nilai investasimu turun 20% dalam sebulan, apa yang akan kamu lakukan?",
    options: [
      { text: "Langsung jual semua — tidak tahan melihat rugi", score: 1 },
      { text: "Khawatir, tapi tunggu dulu dan pantau perkembangannya", score: 2 },
      { text: "Tenang, bahkan mungkin tambah investasi (buy the dip)", score: 3 }
    ]
  },
  {
    question: "Berapa lama kamu bersedia menahan dana yang diinvestasikan tanpa menyentuhnya?",
    options: [
      { text: "Kurang dari 6 bulan — mungkin butuh sewaktu-waktu", score: 1 },
      { text: "6 bulan hingga 2 tahun", score: 2 },
      { text: "Lebih dari 2 tahun — ini uang jangka panjang", score: 3 }
    ]
  },
  {
    question: "Apa tujuan keuangan utamamu saat ini?",
    options: [
      { text: "Punya dana darurat dulu (3–6 bulan pengeluaran)", score: 1 },
      { text: "Menabung untuk tujuan spesifik (liburan, gadget, kendaraan)", score: 2 },
      { text: "Menumbuhkan aset jangka panjang (investasi, properti)", score: 3 }
    ]
  },
  {
    question: "Bagaimana kamu menggambarkan kondisi keuanganmu sekarang?",
    options: [
      { text: "Masih banyak pengeluaran tidak terduga dan sering boncos", score: 1 },
      { text: "Cukup stabil, sudah ada tabungan kecil tapi belum terstruktur", score: 2 },
      { text: "Terstruktur — punya budget, tabungan rutin, dan sudah mulai investasi", score: 3 }
    ]
  }
];

export const OnboardingSurveyModal = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({});

  const totalQuestions = riskQuestions.length;
  const isFinished = step > totalQuestions;

  const handleNext = () => {
    if (!isFinished && !answers[step]) {
      return; 
    }
    setStep(step + 1);
  };

  // Calculate Result
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

  const handleFinish = () => {
    // Save survey results to localStorage for Dashboard Page display
    localStorage.setItem('onboarding_score', totalScore);
    localStorage.setItem('onboarding_profile', riskProfile);
    localStorage.setItem('onboarding_desc', riskDesc);
    localStorage.setItem('show_onboarding_popup', 'true');
    localStorage.removeItem('needs_onboarding_survey');
    
    if (onComplete) {
      onComplete();
    }
  };

  const handleSelectOption = (score) => {
    setAnswers(prev => ({
      ...prev,
      [step]: score
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // Do nothing on close, mandatory
      title={isFinished ? "Analisis Profil Finansial" : "Personalisasi AI Finsight"}
      maxWidth="max-w-2xl"
      hideCloseButton={true}
    >
      <div className="space-y-6">
        {/* Progress Bar (Only show during questions) */}
        {!isFinished && (
          <div className="px-1">
            <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
              <span>Profil Risiko & Finansial</span>
              <span>{Math.round((step / totalQuestions) * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(step / totalQuestions) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        <div className="overflow-hidden min-h-[300px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {!isFinished ? (
              <RiskQuestionCard 
                key={`question-${step}`}
                question={riskQuestions[step - 1].question}
                options={riskQuestions[step - 1].options}
                currentStep={step}
                totalSteps={totalQuestions}
                selectedScore={answers[step]}
                onSelectOption={handleSelectOption}
              />
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 py-4"
              >
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${iconColor}`}>
                  <ProfileIcon className="w-10 h-10" />
                </div>
                
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Profil Anda: {riskProfile}</h2>
                  <p className="text-slate-600 leading-relaxed max-w-md mx-auto text-sm">
                    {riskDesc}
                  </p>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl text-left space-y-4 border border-slate-100 max-w-md mx-auto">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    Personalisasi AI Selesai
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-600 ml-7 list-disc">
                    <li>Rekomendasi anggaran bulanan disesuaikan</li>
                    <li>Saran instrumen investasi dicocokkan dengan profil Anda</li>
                    <li>Deteksi anomali & notifikasi otomatis aktif</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
            {!isFinished && step > 1 ? (
              <Button variant="ghost" onClick={() => setStep(step - 1)}>
                Kembali
              </Button>
            ) : (
              <div></div> // Empty div for spacing
            )}
            
            {!isFinished ? (
              <Button 
                onClick={handleNext} 
                disabled={!answers[step]}
                className="px-8"
              >
                {step === totalQuestions ? 'Lihat Hasil' : 'Selanjutnya'}
              </Button>
            ) : (
              <Button onClick={handleFinish} fullWidth size="lg">
                Selesai & Mulai Eksplorasi
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
