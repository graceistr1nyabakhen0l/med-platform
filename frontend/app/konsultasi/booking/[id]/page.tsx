"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../lib/useAuth";
import { api } from "../../../../lib/api";
import { Button } from "../../../../components/ui/button";
import { useToast } from "../../../../components/ToastProvider";
import { Calendar, Clock, UserRound } from "lucide-react";

export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, isLoading: authLoading } = useAuth(["PASIEN"]);
  const router = useRouter();
  const { addToast } = useToast();
  
  const { id } = use(params);
  const [dokter, setDokter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (user && id) {
      fetchDokter();
    }
  }, [user, id]);

  const fetchDokter = async () => {
    try {
      const res = await api.get("/master/dokters");
      const found = res.data.find((d: any) => d.id === Number(id));
      if (found) {
        setDokter(found);
      } else {
        addToast("Dokter tidak ditemukan", "error");
        router.push("/");
      }
    } catch (error) {
      addToast("Gagal mengambil data dokter", "error");
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    setBookingLoading(true);
    try {
      const res = await api.post("/transaction/booking", { dokterId: Number(id) });
      addToast("Berhasil membuat janji konsultasi!", "success");
      router.push(`/konsultasi/chat/${res.data.id}`);
    } catch (error: any) {
      addToast(error.response?.data?.message || "Gagal membuat janji konsultasi", "error");
      setBookingLoading(false);
    }
  };

  if (authLoading || loading) {
    return <div className="min-h-screen p-8 flex items-center justify-center text-zinc-500">Memuat data dokter...</div>;
  }
  
  if (!dokter) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-zinc-900 mb-8 text-center">Konfirmasi Jadwal Konsultasi</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex flex-col items-center text-center gap-4 mb-6">
            <div className="h-20 w-20 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
              <UserRound className="h-10 w-10" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-zinc-900">{dokter.nama}</h3>
              <p className="text-teal-600 font-medium">{dokter.profilDokter?.spesialisasi}</p>
            </div>
          </div>
          
          <div className="bg-zinc-50 p-4 rounded-lg space-y-3 mb-6">
            <div className="flex items-center gap-3 text-zinc-700">
              <Calendar className="h-5 w-5 text-teal-600" />
              <div>
                <p className="text-sm text-zinc-500">Hari Praktik</p>
                <p className="font-medium">{dokter.profilDokter?.jadwalHari}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-zinc-700">
              <Clock className="h-5 w-5 text-teal-600" />
              <div>
                <p className="text-sm text-zinc-500">Jam Praktik</p>
                <p className="font-medium">{dokter.profilDokter?.jadwalJam}</p>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-zinc-500 text-center mb-6">
            Pastikan jadwal praktik dokter sesuai dengan waktu yang Anda inginkan. Anda dapat berkonsultasi mengenai keluhan Anda melalui chat setelah booking dikonfirmasi.
          </div>
          
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1" onClick={() => router.push("/")} disabled={bookingLoading}>
              Batal
            </Button>
            <Button className="flex-1" onClick={handleBooking} disabled={bookingLoading}>
              {bookingLoading ? "Memproses..." : "Konfirmasi Booking"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
