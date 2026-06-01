"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../lib/useAuth";
import { api } from "../../../lib/api";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { useToast } from "../../../components/ToastProvider";
import { UserCircle, Phone, MapPin, Eye, EyeOff, ShieldCheck, Clock, MessageSquare, Stethoscope } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PasienDashboard() {
  const { user, isLoading: authLoading } = useAuth(["PASIEN"]);
  const { addToast } = useToast();
  
  const [profil, setProfil] = useState({
    nomorTelepon: "",
    alamat: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchProfil();
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const res = await api.get("/transaction/bookings");
      setBookings(res.data);
    } catch (error) {
      console.error(error);
    }
  };

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
    } finally {
      setLoading(false);
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

  if (authLoading || loading) {
    return <div className="min-h-screen p-8 text-center text-zinc-500">Memuat dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-zinc-100 relative overflow-hidden pb-12">
      {/* Background Ornaments */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-teal-200/20 blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-blue-100/30 blur-3xl translate-x-1/3 translate-y-1/3"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-12 pb-8 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight">Dashboard Pasien</h1>
          <p className="mt-3 text-lg text-zinc-600">Selamat datang kembali, <span className="font-semibold text-teal-700">{user?.nama}</span>!</p>
        </div>

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

        {/* RIWAYAT KONSULTASI CARD */}
        <div className="mt-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-teal-900/5 border border-white/60 overflow-hidden">
          <div className="px-8 py-6 border-b border-zinc-200/50 bg-white/50">
            <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-3">
              <Clock className="h-7 w-7 text-teal-600" />
              Riwayat Konsultasi
            </h3>
            <p className="mt-1 text-sm text-zinc-500 ml-10">Daftar dokter yang pernah Anda hubungi.</p>
          </div>
          
          <div className="divide-y divide-zinc-200/50">
            {bookings.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">Anda belum pernah melakukan konsultasi.</div>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="p-8 hover:bg-zinc-50/50 transition-colors flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                      <Stethoscope className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-zinc-900">{booking.dokter?.nama}</h4>
                      <p className="text-sm text-zinc-500 font-medium text-teal-600">{booking.dokter?.profilDokter?.spesialisasi || "Dokter Umum"}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs bg-white text-zinc-600 px-2 py-1 rounded-md border border-zinc-200 shadow-sm">
                          Booking ID: #{booking.id}
                        </span>
                        <span className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded-md border border-teal-100">
                          {new Date(booking.createdAt).toLocaleDateString('id-ID', {day: 'numeric', month:'long', year:'numeric'})}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button onClick={() => router.push(`/konsultasi/chat/${booking.id}`)} className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto shadow-md shadow-teal-600/20">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Masuk ke Ruang Obrolan
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
