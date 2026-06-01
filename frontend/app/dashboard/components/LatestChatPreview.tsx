"use client";

import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { MessageCircle } from "lucide-react";

export default function LatestChatPreview({ bookingId, currentUserId }: { bookingId: number, currentUserId?: number }) {
  const [latestChat, setLatestChat] = useState<any>(null);

  useEffect(() => {
    fetchLatestChat();
    // Polling setiap 5 detik
    const interval = setInterval(() => {
      fetchLatestChat();
    }, 5000);

    return () => clearInterval(interval);
  }, [bookingId]);

  const fetchLatestChat = async () => {
    try {
      const res = await api.get(`/transaction/chats/${bookingId}`);
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setLatestChat(res.data[res.data.length - 1]);
      }
    } catch (error) {
      // Silently ignore polling errors
    }
  };

  if (!latestChat) {
    return (
      <div className="mt-3 p-3 bg-zinc-50/80 rounded-xl border border-zinc-100 flex items-center gap-2">
        <MessageCircle className="w-4 h-4 text-zinc-400" />
        <p className="text-sm text-zinc-500 italic">Belum ada obrolan.</p>
      </div>
    );
  }

  const isMe = Number(latestChat.senderId) === Number(currentUserId);
  let previewText = latestChat.pesan;
  
  if (previewText.startsWith("[RESEP]: ")) {
    previewText = "Menerima resep digital.";
  } else if (previewText.startsWith("[SISTEM]: ")) {
    previewText = previewText.replace("[SISTEM]: ", "Sistem: ");
  }

  return (
    <div className="mt-3 p-3.5 bg-gradient-to-r from-teal-50/50 to-emerald-50/30 rounded-xl border border-teal-100/50 relative overflow-hidden group">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-400 rounded-l-xl"></div>
      <div className="flex justify-between items-center text-xs mb-1">
        <span className="flex items-center gap-1.5 font-semibold">
          <MessageCircle className="w-3.5 h-3.5 text-teal-600" />
          <span className={isMe ? 'text-zinc-600' : 'text-teal-700'}>
            {isMe ? "Anda" : "Dokter"}
          </span>
        </span>
        <span className="text-[10px] text-zinc-400 bg-white px-2 py-0.5 rounded-full border border-zinc-100 shadow-sm">
          {new Date(latestChat.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <p className="text-sm text-zinc-700 pl-5 line-clamp-1">
        {previewText}
      </p>
    </div>
  );
}
