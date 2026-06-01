"use client";

import { useEffect, useState, use, useRef } from "react";
import { useAuth } from "../../../../lib/useAuth";
import { api } from "../../../../lib/api";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { useToast } from "../../../../components/ToastProvider";
import { useRouter } from "next/navigation";
import { Send, FileText, ArrowLeft, Stethoscope, Wifi } from "lucide-react";

import ChatMessageBubble from "./components/ChatMessageBubble";
import ResepDigitalModal from "./components/ResepDigitalModal";
import CheckoutPaymentModal from "./components/CheckoutPaymentModal";

export default function ChatPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { user, isLoading: authLoading } = useAuth(["PASIEN", "DOKTER"]);
  const router = useRouter();
  const { addToast } = useToast();
  const { bookingId } = use(params);

  const [chats, setChats] = useState<any[]>([]);
  const [pesan, setPesan] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Modal triggers
  const [showResepModal, setShowResepModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutData, setCheckoutData] = useState<any>(null);

  // Polling for chats
  useEffect(() => {
    if (!user) return;
    
    fetchChats();
    const interval = setInterval(() => {
      fetchChats(false);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [user, bookingId]);

  // Scroll to bottom when chats change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  const fetchChats = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const res = await api.get(`/transaction/chats/${bookingId}`);
      setChats(res.data);
    } catch (error) {
      if (showLoader) addToast("Gagal memuat pesan", "error");
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pesan.trim()) return;

    setSending(true);
    try {
      await api.post("/transaction/chat", { bookingId: Number(bookingId), pesan });
      setPesan("");
      fetchChats(false);
    } catch (error) {
      addToast("Gagal mengirim pesan", "error");
    } finally {
      setSending(false);
    }
  };

  const handleOpenCheckout = (resepData: any) => {
    setCheckoutData(resepData);
    setShowCheckoutModal(true);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-xl shadow-teal-500/30 animate-pulse">
          <Stethoscope className="w-8 h-8 text-white" />
        </div>
        <p className="text-zinc-500 font-medium">Memuat ruang konsultasi...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50/50 flex flex-col">
      {/* Decorative blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-teal-200/20 blur-3xl translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-emerald-100/30 blur-3xl -translate-x-1/4 translate-y-1/4"></div>
      </div>

      {/* Main chat container — fills viewport height */}
      <div className="relative z-10 flex flex-col flex-1 max-w-3xl w-full mx-auto px-4 py-6 h-screen">
        <div className="flex flex-col flex-1 bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-teal-900/10 border border-white/60 overflow-hidden">

          {/* ===== HEADER ===== */}
          <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(user?.role === 'DOKTER' ? "/dashboard/dokter" : "/dashboard/pasien")}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-white text-base leading-tight">Ruang Konsultasi</h2>
                  <p className="text-teal-100 text-xs flex items-center gap-1">
                    <Wifi className="w-3 h-3" /> Online · Sesi #{bookingId}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user?.role === 'DOKTER' && (
                <button
                  onClick={() => setShowResepModal(true)}
                  className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-3 py-2 rounded-xl transition-all border border-white/20"
                >
                  <FileText className="w-4 h-4" />
                  Resep Digital
                </button>
              )}
            </div>
          </div>

          {/* ===== CHAT AREA ===== */}
          <div className="flex-1 overflow-y-auto p-5 space-y-1"
            style={{ background: "linear-gradient(160deg, #f0fdf4 0%, #f8fafc 50%, #f0fdfa 100%)" }}>
            {chats.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-zinc-400 gap-3">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 border-2 border-teal-100 flex items-center justify-center">
                  <Stethoscope className="w-7 h-7 text-teal-400" />
                </div>
                <p className="font-medium text-zinc-500">Belum ada pesan</p>
                <p className="text-sm text-zinc-400">Mulai obrolan konsultasi Anda sekarang!</p>
              </div>
            ) : (
              chats.map(chat => (
                <div key={chat.id}>
                  <ChatMessageBubble
                    chat={chat}
                    currentUserId={user?.id}
                    userRole={user?.role}
                    onOpenCheckout={handleOpenCheckout}
                  />
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          {/* ===== INPUT AREA ===== */}
          <div className="bg-white/90 backdrop-blur-xl px-5 py-4 border-t border-zinc-100 shrink-0">
            <form onSubmit={handleSend} className="flex gap-3 items-center">
              <Input
                value={pesan}
                onChange={e => setPesan(e.target.value)}
                placeholder="Ketik pesan konsultasi Anda..."
                className="flex-1 bg-zinc-50/80 border-zinc-200 focus-visible:ring-teal-500 rounded-2xl h-12 px-5 text-sm shadow-inner"
                disabled={sending}
              />
              <Button
                type="submit"
                disabled={sending || !pesan.trim()}
                className="bg-gradient-to-br from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white rounded-2xl h-12 w-12 p-0 flex items-center justify-center shadow-lg shadow-teal-500/30 transition-all disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </Button>
            </form>
            <p className="text-center text-[11px] text-zinc-400 mt-2">Percakapan ini bersifat rahasia dan aman 🔒</p>
          </div>

        </div>
      </div>

      {/* Modal Buat Resep (Dokter) */}
      <ResepDigitalModal
        isOpen={showResepModal}
        onClose={() => setShowResepModal(false)}
        bookingId={bookingId}
        onSuccess={() => fetchChats(false)}
      />

      {/* Modal Checkout (Pasien) */}
      <CheckoutPaymentModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        bookingId={bookingId}
        checkoutData={checkoutData}
        onSuccess={() => fetchChats(false)}
      />
    </div>
  );
}
