import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, KeyRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { apiRequest } from "../utils/apiClient";

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email || !email.includes("@")) {
      setStatusMessage("Masukkan email yang valid.");
      return;
    }

    if (password.length < 8) {
      setStatusMessage("Password baru minimal 8 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setStatusMessage("Password baru dan konfirmasi password harus sama.");
      return;
    }

    try {
      setIsSubmitting(true);
      await apiRequest("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      setStatusMessage("Password berhasil diubah. Silakan login kembali.");
      navigate("/login", { replace: true });
    } catch (error) {
      setStatusMessage(error.message || "Gagal mengganti password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-ai flex items-center justify-center shadow-lg">
            <KeyRound className="w-6 h-6 text-white" />
          </div>
        </motion.div>
        <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Reset Password
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-2 text-center text-sm text-slate-600">
          Buat password baru dengan memasukkan email akun Anda.
        </motion.p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Card>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Alamat email
              </label>
              <div className="mt-1">
                <input id="email" name="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password baru
              </label>
              <div className="mt-1">
                <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                Konfirmasi password
              </label>
              <div className="mt-1">
                <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
              </div>
            </div>

            <div>
              <Button type="submit" fullWidth className="group" disabled={isSubmitting || !email || !password || !confirmPassword || password.length < 8 || confirmPassword.length < 8}>
                {isSubmitting ? "Menyimpan..." : "Simpan Password Baru"}
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {statusMessage ? <p className="text-sm text-slate-600 text-center">{statusMessage}</p> : null}

            <div className="text-center pt-2 border-t border-slate-100">
              <Link to="/login" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                Kembali ke login
              </Link>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};
