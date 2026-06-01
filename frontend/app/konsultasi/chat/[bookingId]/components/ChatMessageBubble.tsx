"use client";

import { Button } from "../../../../../components/ui/button";
import { FileText, CheckCircle2, Stethoscope, User } from "lucide-react";

interface ChatMessageBubbleProps {
  chat: any;
  currentUserId: number | undefined;
  userRole: string | undefined;
  onOpenCheckout: (resepData: any) => void;
}

export default function ChatMessageBubble({ chat, currentUserId, userRole, onOpenCheckout }: ChatMessageBubbleProps) {
  const isMe = Number(chat.senderId) === Number(currentUserId);

  // ===== Render: Resep Digital =====
  if (chat.pesan.startsWith("[RESEP]: ")) {
    try {
      const resepData = JSON.parse(chat.pesan.replace("[RESEP]: ", ""));
      const totalHarga = resepData.items.reduce((sum: number, item: any) => sum + (item.harga * item.jumlah), 0);
      
      return (
        <div className="w-full flex justify-center my-5">
          <div className="bg-white/90 backdrop-blur-xl border border-teal-200 rounded-3xl p-5 shadow-lg shadow-teal-900/5 w-[92%] max-w-sm">
            <div className="flex items-center gap-2 text-teal-700 font-bold mb-4 pb-3 border-b border-teal-100">
              <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center">
                <FileText className="w-4 h-4 text-teal-600" />
              </div>
              Resep Digital Dokter
            </div>
            <ul className="space-y-2.5 mb-4 text-sm text-zinc-600">
              {resepData.items.map((item: any, idx: number) => (
                <li key={idx} className="flex justify-between items-center bg-zinc-50 rounded-xl px-3 py-2">
                  <span className="font-medium">{item.jumlah}x {item.nama}</span>
                  <span className="text-teal-700 font-semibold">Rp {(item.harga * item.jumlah).toLocaleString('id-ID')}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between font-bold text-zinc-800 border-t pt-3 border-zinc-100 mb-4">
              <span>Total Tagihan</span>
              <span className="text-teal-700 text-lg">Rp {totalHarga.toLocaleString('id-ID')}</span>
            </div>
            
            {userRole === 'PASIEN' ? (
              <Button 
                onClick={() => onOpenCheckout(resepData)} 
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 rounded-xl shadow-md shadow-teal-600/20"
              >
                Tebus Resep & Bayar Sekarang
              </Button>
            ) : (
              <p className="text-xs text-center text-zinc-400 bg-zinc-50 py-2.5 rounded-xl">Menunggu pasien menebus resep...</p>
            )}
          </div>
        </div>
      );
    } catch (e) {
      // Fallback if parse fails
    }
  }

  // ===== Render: Notifikasi Sistem =====
  if (chat.pesan.startsWith("[SISTEM]: ")) {
    return (
      <div className="w-full flex justify-center my-4">
        <span className="bg-teal-50 text-teal-700 text-xs py-1.5 px-4 rounded-full border border-teal-100 flex items-center gap-1.5 shadow-sm">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {chat.pesan.replace("[SISTEM]: ", "")}
        </span>
      </div>
    );
  }

  // ===== Render: Chat Normal =====
  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-3 gap-2 items-end`}>
      {/* Avatar dokter / lawan bicara (ditampilkan di kiri) */}
      {!isMe && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shrink-0 shadow-md shadow-teal-500/30">
          <Stethoscope className="w-4 h-4 text-white" />
        </div>
      )}

      <div className={`max-w-[72%] rounded-2xl px-4 py-3 shadow-sm ${
        isMe
          ? "bg-white border border-zinc-200 text-zinc-800 rounded-br-md"
          : "bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-bl-md shadow-md shadow-teal-500/20"
      }`}>
        {!isMe && (
          <p className="text-[10px] font-semibold text-teal-100 mb-1 tracking-wide uppercase">Dokter</p>
        )}
        <p className="text-sm leading-relaxed">{chat.pesan}</p>
        <p className={`text-[10px] mt-1.5 text-right ${isMe ? "text-zinc-400" : "text-teal-100"}`}>
          {new Date(chat.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {/* Avatar pasien / pengirim (ditampilkan di kanan) */}
      {isMe && (
        <div className="w-8 h-8 rounded-xl bg-zinc-200 flex items-center justify-center shrink-0">
          <User className="w-4 h-4 text-zinc-500" />
        </div>
      )}
    </div>
  );
}

