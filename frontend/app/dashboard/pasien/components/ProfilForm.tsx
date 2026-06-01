"use client";

import { useEffect, useState } from "react";
import { api } from "../../../../lib/api";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { useToast } from "../../../../components/ToastProvider";
import { UserCircle, Phone, MapPin, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function ProfilForm({ user }: { user: any }) {
  const { addToast } = useToast();
  const [profil, setProfil] = useState({
    nomorTelepon: "",
    alamat: "",
  });
  const [saving, setSaving] = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  useEffect(() => {
    fetchProfil();
  }, []);

  const fetchProfil = async () => {
    try {
      const res = await api.get("/master/profil/pasien");
      if (res.data) {
        setProfil({
          nomorTelepon: res.data.nomorTelepon || "",
          alamat: res.data.alamat || "",
        });
      }
    } catch (error) {
      addToast("Gagal mengambil data profil", "error");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/master/profil/pasien", profil);
      addToast("Profil berhasil diperbarui", "success");
    } catch (error) {
      addToast("Gagal memperbarui profil", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-teal-900/5 border border-white/60 overflow-hidden">
      <div className="px-8 py-6 border-b border-zinc-200/50 bg-white/50">
        <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-3">
          <UserCircle className="h-7 w-7 text-teal-600" />
          Informasi Profil
        </h3>
        <p className="mt-1 text-sm text-zinc-500 ml-10">Kelola data diri dan informasi kontak Anda.</p>
      </div>
      <div className="p-8">
        <form onSubmit={handleUpdate} className="space-y-8 max-w-3xl mx-auto sm:mx-0">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                 Nama Lengkap
              </label>
              <Input
                value={user?.nama || ""}
                disabled
                className="bg-zinc-50/50 font-medium text-zinc-700"
              />
              <p className="mt-2 text-xs text-zinc-500 flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> Nama resmi terverifikasi</p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                 Privasi Email
              </label>
              <div className="relative">
                <Input
                  value={showEmail ? (user?.email || "") : "••••••••••••••••••••"}
                  disabled
                  className="bg-zinc-50/50 pr-12 font-medium text-zinc-700"
                />
                <button
                  type="button"
                  onClick={() => setShowEmail(!showEmail)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-teal-600 transition-colors focus:outline-none p-1 rounded-md hover:bg-zinc-100"
                >
                  {showEmail ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="mt-2 text-xs text-zinc-500">Klik ikon mata untuk melihat email</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5 flex items-center gap-2">
              <Phone className="h-4 w-4 text-teal-600" /> Nomor Telepon
            </label>
            <Input
              type="tel"
              value={profil.nomorTelepon}
              onChange={(e) => setProfil({ ...profil, nomorTelepon: e.target.value })}
              placeholder="Contoh: 08123456789"
              className="bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-teal-600" /> Alamat Lengkap
            </label>
            <Input
              type="text"
              value={profil.alamat}
              onChange={(e) => setProfil({ ...profil, alamat: e.target.value })}
              placeholder="Contoh: Jl. Sehat Selalu No. 123, Jakarta"
              className="bg-white"
            />
          </div>

          <div className="pt-6 mt-8 border-t border-zinc-100">
            <Button type="submit" disabled={saving} className="w-full sm:w-auto px-10 h-12 text-base rounded-xl bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/20 transition-all">
              {saving ? "Menyimpan Perubahan..." : "Simpan Perubahan Profil"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
