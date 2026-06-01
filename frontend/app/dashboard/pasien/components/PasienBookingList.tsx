"use client";

import { useEffect, useState } from "react";
import { api } from "../../../../lib/api";
import { Button } from "../../../../components/ui/button";
import { Clock, MessageSquare, Stethoscope, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import LatestChatPreview from "../../components/LatestChatPreview";

export default function PasienBookingList({ user }: { user?: any }) {
  const [bookings, setBookings] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchBookings();
    
    // Polling daftar booking agar realtime
    const interval = setInterval(() => {
      fetchBookings();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get("/transaction/bookings");
      setBookings(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="mt-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-teal-900/5 border border-white/60 overflow-hidden mb-8">
      <div className="px-8 py-6 border-b border-zinc-200/50 bg-white/50">
        <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-3">
          <Clock className="h-7 w-7 text-teal-600" />
          Riwayat Konsultasi
        </h3>
        <p className="mt-1 text-sm text-zinc-500 ml-10">Daftar dokter yang pernah Anda hubungi dan pantau riwayat obrolan secara langsung.</p>
      </div>
      
      <div className="divide-y divide-zinc-200/50">
        {bookings.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-zinc-500 bg-white/30">
            <Stethoscope className="w-12 h-12 text-zinc-300 mb-4" />
            <p className="text-lg font-medium text-zinc-600">Belum ada riwayat konsultasi</p>
            <p className="text-sm">Anda belum pernah melakukan booking atau obrolan dengan dokter.</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <div key={booking.id} className="p-8 hover:bg-zinc-50/80 transition-all duration-300 flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center group">
              <div className="flex items-start gap-5 w-full sm:w-auto flex-1">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center text-teal-700 shrink-0 shadow-inner">
                  <Stethoscope className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-zinc-900 group-hover:text-teal-700 transition-colors">{booking.dokter?.nama}</h4>
                  <p className="text-sm text-zinc-500 font-medium text-teal-600 mb-2">{booking.dokter?.profilDokter?.spesialisasi || "Dokter Umum"}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-1 mb-2">
                    <span className="text-xs bg-white text-zinc-600 px-2.5 py-1 rounded-md border border-zinc-200 shadow-sm font-medium">
                      Booking ID: #{booking.id}
                    </span>
                    <span className="text-xs bg-teal-50 text-teal-700 px-2.5 py-1 rounded-md border border-teal-100 font-medium">
                      {new Date(booking.createdAt).toLocaleDateString('id-ID', {day: 'numeric', month:'long', year:'numeric'})}
                    </span>
                  </div>
                  
                  {/* Label tambahan agar user mengerti ini adalah chat preview realtime */}
                  <div className="mt-4">
                    <p className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">Status Chat Terkini:</p>
                    <LatestChatPreview bookingId={booking.id} currentUserId={user?.id} />
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={() => router.push(`/konsultasi/chat/${booking.id}`)} 
                className="bg-zinc-900 hover:bg-teal-700 text-white w-full sm:w-auto rounded-xl px-6 py-5 shadow-lg shadow-zinc-900/10 group-hover:shadow-teal-700/20 transition-all duration-300 shrink-0 mt-4 sm:mt-0"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Masuk Ruang Chat
                <ChevronRight className="w-4 h-4 ml-1 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
