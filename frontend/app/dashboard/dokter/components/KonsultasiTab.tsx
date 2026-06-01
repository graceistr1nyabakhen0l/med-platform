"use client";

import { useEffect, useState } from "react";
import { api } from "../../../../lib/api";
import { useToast } from "../../../../components/ToastProvider";
import { Clock, UserRound, MessageSquare, ChevronRight } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { useRouter } from "next/navigation";
import LatestChatPreview from "../../components/LatestChatPreview";

export default function KonsultasiTab({ user }: { user?: any }) {
  const { addToast } = useToast();
  const [bookings, setBookings] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get("/transaction/bookings");
      setBookings(res.data);
    } catch (error) {
      addToast("Gagal mengambil data konsultasi", "error");
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-teal-900/5 border border-white/60 overflow-hidden mb-8">
      <div className="px-8 py-6 border-b border-zinc-200/50 bg-white/50">
        <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-3">
          <Clock className="h-7 w-7 text-teal-600" />
          Antrean Konsultasi
        </h3>
        <p className="mt-1 text-sm text-zinc-500 ml-10">Daftar pasien yang menunggu layanan Anda.</p>
      </div>
      
      <div className="divide-y divide-zinc-200/50">
        {bookings.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-zinc-500 bg-white/30">
            <UserRound className="w-12 h-12 text-zinc-300 mb-4" />
            <p className="text-lg font-medium text-zinc-600">Belum ada pasien</p>
            <p className="text-sm">Saat ini tidak ada pasien yang mendaftar konsultasi.</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <div key={booking.id} className="p-8 hover:bg-zinc-50/80 transition-all duration-300 flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center group">
              <div className="flex items-start gap-5 w-full sm:w-auto flex-1">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center text-teal-700 shrink-0 shadow-inner">
                  <UserRound className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-zinc-900 group-hover:text-teal-700 transition-colors">{booking.pasien?.nama}</h4>
                  <p className="text-sm text-zinc-500 mb-2">{booking.pasien?.email}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="text-xs bg-white text-zinc-600 px-2.5 py-1 rounded-md border border-zinc-200 shadow-sm font-medium">
                      ID: #{booking.id}
                    </span>
                    <span className="text-xs bg-teal-50 text-teal-700 px-2.5 py-1 rounded-md border border-teal-100 font-medium">
                      {new Date(booking.createdAt).toLocaleDateString('id-ID', {day: 'numeric', month:'long', year:'numeric'})}
                    </span>
                  </div>

                  {/* Integrasi LatestChatPreview */}
                  <LatestChatPreview bookingId={booking.id} currentUserId={user?.id} />
                </div>
              </div>
              
              <Button 
                onClick={() => router.push(`/konsultasi/chat/${booking.id}`)} 
                className="bg-zinc-900 hover:bg-teal-700 text-white w-full sm:w-auto rounded-xl px-6 py-5 shadow-lg shadow-zinc-900/10 group-hover:shadow-teal-700/20 transition-all duration-300 shrink-0 mt-4 sm:mt-0"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Buka Obrolan
                <ChevronRight className="w-4 h-4 ml-1 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
