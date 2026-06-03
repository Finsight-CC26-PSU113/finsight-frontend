import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useNavigate, Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAppContext();

  const handleLogin = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    try {
      await login({
        email: formData.get("email"),
        password: formData.get("password"),
      });

      navigate("/", { replace: true });
    } catch (error) {
      window.alert(error.message || "Gagal masuk");
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
          Masuk ke FINSIGHT
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-2 text-center text-sm text-slate-600">
          Asisten keuangan pribadi bertenaga AI Anda
        </motion.p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Card>
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Alamat email
              </label>
              <div className="mt-1">
                <input id="email" name="email" type="email" autoComplete="email" required placeholder="nama@email.com" className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Kata sandi
              </label>
              <div className="mt-1">
                <input id="password" name="password" type="password" autoComplete="current-password" required placeholder="Masukkan kata sandi" className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">
                  Ingat saya
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                  Lupa kata sandi?
                </Link>
              </div>
            </div>

            <div>
              <Button type="submit" fullWidth className="group">
                Masuk
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </form>


          <div className="mt-6 text-center pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-600">
              Belum punya akun?{" "}
              <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                Daftar
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
