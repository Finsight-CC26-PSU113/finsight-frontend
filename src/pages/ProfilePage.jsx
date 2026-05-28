import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useAppContext } from "../context/AppContext";
import { User, Settings, Target, Bell, Shield, LogOut, Upload } from "lucide-react";
import { getAvatarFallbackStyle, getAvatarInitials } from "../utils/profileAvatar";
import { getApiBaseUrl, getStoredAuthSession } from "../utils/apiClient";

const resolveMediaUrl = (value) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value) || value.startsWith("data:") || value.startsWith("blob:")) {
    return value;
  }
  return `${getApiBaseUrl()}/${String(value).replace(/^\/+/, "")}`;
};

export const ProfilePage = () => {
  const { user, logout, updateProfile } = useAppContext();
  const [avatarPreview, setAvatarPreview] = useState(resolveMediaUrl(user.avatar));
  const [pendingAvatarFile, setPendingAvatarFile] = useState(null);
  const avatarInputRef = useRef(null);

  const handleProfileSave = async (event) => {
    event.preventDefault();

    try {
      const formData = new FormData(event.currentTarget);
      const name = String(formData.get("name") || "").trim() || user.name;

      let uploadedAvatarPath = null;
      if (pendingAvatarFile) {
        const uploadPayload = new FormData();
        uploadPayload.append("avatar", pendingAvatarFile);

        const { token } = getStoredAuthSession();
        const uploadResponse = await fetch(`${getApiBaseUrl()}/api/auth/profile/avatar`, {
          method: "POST",
          credentials: "include",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: uploadPayload,
        });

        const uploadJson = await uploadResponse.json().catch(() => null);
        if (!uploadResponse.ok) {
          throw new Error(uploadJson?.message || "Gagal upload foto profil");
        }

        uploadedAvatarPath = uploadJson?.data?.avatar || uploadJson?.data?.user?.avatar || null;
      }

      const updatedUser = await updateProfile({
        name,
      });

      if (updatedUser?.avatar) {
        setAvatarPreview(resolveMediaUrl(updatedUser.avatar));
      } else if (uploadedAvatarPath) {
        setAvatarPreview(resolveMediaUrl(uploadedAvatarPath));
      }
      setPendingAvatarFile(null);

      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
    } catch (error) {
      window.alert(error.message || "Gagal menyimpan profil");
    }
  };

  const handleAvatarPick = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      window.alert("Pilih file gambar.");
      return;
    }

    setAvatarPreview(URL.createObjectURL(file));
    setPendingAvatarFile(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profil & Pengaturan</h1>
        <p className="text-slate-500">Kelola informasi pribadi dan preferensi Anda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="text-center">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden mx-auto flex items-center justify-center" style={avatarPreview || user.avatar ? undefined : getAvatarFallbackStyle(user)}>
                  {avatarPreview || user.avatar ? <img src={avatarPreview || resolveMediaUrl(user.avatar)} alt={user.name} className="w-full h-full object-cover" /> : <span className="text-xl font-bold tracking-wide">{getAvatarInitials(user.name)}</span>}
                </div>
                <button type="button" onClick={() => avatarInputRef.current?.click()} className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full border-2 border-white flex items-center justify-center text-white hover:bg-primary-700 transition-colors" title="Ubah Profile">
                  <User className="w-4 h-4" />
                </button>
              </div>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarPick} />
              <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
              <p className="text-slate-500 text-sm mb-4">Profil pengguna</p>

              <div className="mt-4 flex items-center justify-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => avatarInputRef.current?.click()} className="inline-flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Ubah Profile
                </Button>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500">Anggota Sejak</span>
                  <span className="font-semibold text-slate-900">Jan 2026</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Langganan</span>
                  <span className="font-semibold text-slate-900">Akun aktif</span>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary-500" />
                Tujuan Keuangan
              </h3>
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-medium text-slate-700">Dana Darurat</span>
                  <span className="text-sm font-bold text-slate-900">Rp 10.000.000</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                  <div className="bg-primary-500 h-2 rounded-full" style={{ width: "45%" }}></div>
                </div>
                <p className="text-xs text-slate-500 text-right">Tercapai 45%</p>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Right Column: Settings */}
        <div className="md:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <h3 className="font-bold text-slate-900 mb-4 border-b border-slate-100 pb-4">Informasi Pribadi</h3>
              <form className="space-y-4" onSubmit={handleProfileSave}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                    <input name="name" type="text" defaultValue={user.name} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Alamat Email</label>
                    <input type="email" value={user.email || `${user.name.toLowerCase()}@example.com`} readOnly className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg outline-none cursor-not-allowed" />
                  </div>
                </div>
                <div>
                  <Button type="submit">Simpan Perubahan</Button>
                </div>
              </form>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card>
              <h3 className="font-bold text-slate-900 mb-4 border-b border-slate-100 pb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-slate-400" />
                Preferensi
              </h3>

              <div className="space-y-4">
                {/* Notifications */}
                <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Notifikasi</p>
                      <p className="text-xs text-slate-500">Peringatan, wawasan, dan pengingat</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                {/* Security */}
                <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Autentikasi Dua Faktor</p>
                      <p className="text-xs text-slate-500">Amankan akun Anda</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Aktifkan
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Button variant="danger" fullWidth className="py-3" onClick={logout}>
              <LogOut className="w-5 h-5 mr-2" />
              Keluar dari FINSIGHT
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
