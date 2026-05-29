import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useNavigate, Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAppContext();
  const formRef = useRef(null);

  useEffect(() => {
    formRef.current?.reset();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    try {
      localStorage.setItem("needs_onboarding_survey", "true");
      await register({
        name: formData.get("registerName"),
        email: formData.get("registerEmail"),
        password: formData.get("registerPassword"),
      });
      formRef.current?.reset();
      navigate("/login", { replace: true });
    } catch (error) {
      window.alert(error.message || "Gagal mendaftar");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-ai flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
        </motion.div>
        <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Buat akun
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-2 text-center text-sm text-slate-600">
          Mulai perjalanan finansial cerdas Anda hari ini
        </motion.p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Card>
          <form ref={formRef} className="space-y-6" onSubmit={handleRegister} autoComplete="off">
            <div>
              <label htmlFor="registerName" className="block text-sm font-medium text-slate-700">
                Nama Lengkap
              </label>
              <div className="mt-1">
                <input id="registerName" name="registerName" type="text" autoComplete="off" required placeholder="contoh: Alex Johnson" className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
              </div>
            </div>

            <div>
              <label htmlFor="registerEmail" className="block text-sm font-medium text-slate-700">
                Alamat email
              </label>
              <div className="mt-1">
                <input id="registerEmail" name="registerEmail" type="email" autoComplete="off" required placeholder="alex@example.com" className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
              </div>
            </div>

            <div>
              <label htmlFor="registerPassword" className="block text-sm font-medium text-slate-700">
                Kata sandi
              </label>
              <div className="mt-1">
                <input id="registerPassword" name="registerPassword" type="password" autoComplete="new-password" required placeholder="Buat kata sandi yang kuat" className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
              </div>
            </div>

            <div>
              <Button type="submit" fullWidth className="group">
                Lanjutkan
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Sudah punya akun?{" "}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Masuk
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
