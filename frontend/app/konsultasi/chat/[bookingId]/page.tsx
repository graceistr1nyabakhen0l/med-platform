"use client";

import { useEffect, useState, use, useRef } from "react";
import { useAuth } from "../../../../lib/useAuth";
import { api } from "../../../../lib/api";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { useToast } from "../../../../components/ToastProvider";
import { useRouter } from "next/navigation";
import { Send, FileText, Plus, Minus, CreditCard, CheckCircle2 } from "lucide-react";

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

  // States for Resep Digital (Dokter)
  const [showResepModal, setShowResepModal] = useState(false);
  const [obatList, setObatList] = useState<any[]>([]);
  const [selectedObat, setSelectedObat] = useState<{ obatId: number; jumlah: number; nama: string; harga: number }[]>([]);
  const [resepLoading, setResepLoading] = useState(false);

  // States for Checkout (Pasien)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [metodeBayar, setMetodeBayar] = useState("Transfer Bank");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Polling for chats
  useEffect(() => {
    if (!user) return;
    
    fetchChats();
    const interval = setInterval(() => {
      fetchChats(false); // background fetch
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

  // --- Resep Digital Functions ---
  const openResepModal = async () => {
    setShowResepModal(true);
    try {
      const res = await api.get("/master/obat/dokter");
      setObatList(res.data);
    } catch (error) {
      addToast("Gagal memuat daftar obat", "error");
    }
  };

  const addObatToResep = (obat: any) => {
    const exists = selectedObat.find(o => o.obatId === obat.id);
    if (exists) {
      setSelectedObat(selectedObat.map(o => o.obatId === obat.id ? { ...o, jumlah: o.jumlah + 1 } : o));
    } else {
      setSelectedObat([...selectedObat, { obatId: obat.id, jumlah: 1, nama: obat.nama, harga: obat.harga }]);
    }
  };

  const removeObatFromResep = (obatId: number) => {
    const exists = selectedObat.find(o => o.obatId === obatId);
    if (exists && exists.jumlah > 1) {
      setSelectedObat(selectedObat.map(o => o.obatId === obatId ? { ...o, jumlah: o.jumlah - 1 } : o));
    } else {
      setSelectedObat(selectedObat.filter(o => o.obatId !== obatId));
    }
  };

  const submitResep = async () => {
    if (selectedObat.length === 0) return addToast("Pilih minimal 1 obat", "error");
    
    setResepLoading(true);
    try {
      const payload = {
        bookingId: Number(bookingId),
        items: selectedObat.map(o => ({ obatId: o.obatId, jumlah: o.jumlah }))
      };
      const res = await api.post("/transaction/resep", payload);
      
      // Kirim pesan sistem (tersembunyi dalam format JSON) ke chat
      const resepMessage = `[RESEP]: ${JSON.stringify({ resepId: res.data.id, items: selectedObat })}`;
      await api.post("/transaction/chat", { bookingId: Number(bookingId), pesan: resepMessage });
      
      setShowResepModal(false);
      setSelectedObat([]);
      addToast("Resep berhasil dibuat", "success");
      fetchChats(false);
    } catch (error) {
      addToast("Gagal membuat resep", "error");
    } finally {
      setResepLoading(false);
    }
  };

  // --- Checkout Functions ---
  const handleOpenCheckout = (resepData: any) => {
    setCheckoutData(resepData);
    setShowCheckoutModal(true);
  };

  const submitCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const payload = {
        metodeBayar,
        obatItems: checkoutData.items.map((i: any) => ({ obatId: i.obatId, jumlah: i.jumlah })),
        resepDigitalId: checkoutData.resepId
      };
      
      await api.post("/transaction/checkout", payload);
      
      // Kirim pesan sukses bayar
      await api.post("/transaction/chat", { 
        bookingId: Number(bookingId), 
        pesan: `[SISTEM]: Pasien telah berhasil menebus resep (ID: ${checkoutData.resepId}) dengan metode ${metodeBayar}.` 
      });

      setShowCheckoutModal(false);
      addToast("Pembayaran berhasil! Resep sudah ditebus.", "success");
      fetchChats(false);
    } catch (error: any) {
      addToast(error.response?.data?.message || "Pembayaran gagal", "error");
    } finally {
      setCheckoutLoading(false);
    }
  };

  // --- Render Helpers ---
  const renderMessage = (chat: any) => {
    const isMe = chat.senderId === user?.id;
    
    // Check if message is a System Resep
    if (chat.pesan.startsWith("[RESEP]: ")) {
      try {
        const resepData = JSON.parse(chat.pesan.replace("[RESEP]: ", ""));
        const totalHarga = resepData.items.reduce((sum: number, item: any) => sum + (item.harga * item.jumlah), 0);
        
        return (
          <div className="w-full flex justify-center my-4">
            <div className="bg-white border border-teal-200 rounded-xl p-4 shadow-sm w-[90%] max-w-sm">
              <div className="flex items-center gap-2 text-teal-700 font-bold mb-3 pb-2 border-b border-teal-100">
                <FileText className="w-5 h-5" /> Resep Digital Dokter
              </div>
              <ul className="space-y-2 mb-4 text-sm text-zinc-600">
                {resepData.items.map((item: any, idx: number) => (
                  <li key={idx} className="flex justify-between">
                    <span>{item.jumlah}x {item.nama}</span>
                    <span>Rp {item.harga * item.jumlah}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between font-bold text-zinc-800 border-t pt-2 border-zinc-100 mb-4">
                <span>Total:</span>
                <span>Rp {totalHarga}</span>
              </div>
              
              {user?.role === 'PASIEN' ? (
                <Button onClick={() => handleOpenCheckout(resepData)} className="w-full bg-teal-600 hover:bg-teal-700">
                  Tebus Resep & Bayar
                </Button>
              ) : (
                <p className="text-xs text-center text-zinc-400">Menunggu pasien menebus resep...</p>
              )}
            </div>
          </div>
        );
      } catch (e) {
        // Fallback if parsing fails
      }
    }

    if (chat.pesan.startsWith("[SISTEM]: ")) {
      return (
        <div className="w-full flex justify-center my-3">
          <span className="bg-teal-50 text-teal-700 text-xs py-1 px-3 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> {chat.pesan.replace("[SISTEM]: ", "")}
          </span>
        </div>
      );
    }

    return (
      <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-4`}>
        <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMe ? "bg-teal-600 text-white rounded-br-none" : "bg-white border border-zinc-200 text-zinc-800 rounded-bl-none"}`}>
          <p className="text-sm">{chat.pesan}</p>
          <p className={`text-[10px] mt-1 text-right ${isMe ? "text-teal-100" : "text-zinc-400"}`}>
            {new Date(chat.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </p>
        </div>
      </div>
    );
  };

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center text-zinc-500">Memuat ruang chat...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-zinc-50 rounded-xl border border-zinc-200 h-[75vh] flex flex-col shadow-sm overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-white p-4 border-b border-zinc-200 flex items-center justify-between shrink-0 z-10 shadow-sm">
          <div>
            <h2 className="font-bold text-zinc-800">Ruang Konsultasi</h2>
            <p className="text-xs text-zinc-500">Booking ID: #{bookingId}</p>
          </div>
          <div className="flex gap-2">
            {user?.role === 'DOKTER' && (
              <Button onClick={openResepModal} size="sm" variant="outline" className="text-teal-600 border-teal-200 hover:bg-teal-50">
                <FileText className="w-4 h-4 mr-2" /> Buat Resep Digital
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => router.push(user?.role === 'DOKTER' ? "/dashboard/dokter" : "/dashboard/pasien")}>
              Keluar
            </Button>
          </div>
        </div>
        
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
          {chats.length === 0 ? (
            <div className="h-full flex items-center justify-center text-zinc-400 text-sm">
              Belum ada pesan. Mulai obrolan Anda sekarang!
            </div>
          ) : (
            chats.map(chat => <div key={chat.id}>{renderMessage(chat)}</div>)
          )}
          <div ref={chatEndRef} />
        </div>
        
        {/* Input Area */}
        <div className="bg-white p-4 border-t border-zinc-200 shrink-0">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input 
              value={pesan} 
              onChange={e => setPesan(e.target.value)} 
              placeholder="Ketik pesan Anda..." 
              className="flex-1 bg-zinc-50 border-zinc-300 focus-visible:ring-teal-500"
              disabled={sending}
            />
            <Button type="submit" disabled={sending || !pesan.trim()} className="bg-teal-600 hover:bg-teal-700">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>

        {/* Modal Buat Resep (Dokter) */}
        {showResepModal && (
          <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-full">
              <div className="p-4 border-b font-bold flex justify-between items-center">
                <span>Buat Resep Digital</span>
                <button onClick={() => setShowResepModal(false)} className="text-zinc-400 hover:text-zinc-700">✕</button>
              </div>
              <div className="p-4 overflow-y-auto flex-1">
                <p className="text-sm text-zinc-500 mb-2">Pilih Obat dari Apotek:</p>
                <div className="space-y-2 border border-zinc-200 p-2 rounded-lg h-48 overflow-y-auto bg-zinc-50 mb-4">
                  {obatList.map(obat => (
                    <div key={obat.id} className="flex justify-between items-center bg-white p-2 rounded border border-zinc-100 text-sm">
                      <div>
                        <p className="font-medium">{obat.nama}</p>
                        <p className="text-xs text-zinc-400">Rp {obat.harga} • Stok: {obat.stok}</p>
                      </div>
                      <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => addObatToResep(obat)}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <p className="text-sm font-bold text-zinc-700 mb-2">Resep yang akan diberikan:</p>
                {selectedObat.length === 0 ? (
                  <p className="text-sm text-zinc-400 italic">Belum ada obat terpilih.</p>
                ) : (
                  <ul className="space-y-2 mb-4">
                    {selectedObat.map(item => (
                      <li key={item.obatId} className="flex justify-between items-center text-sm border-b pb-2">
                        <span>{item.nama}</span>
                        <div className="flex items-center gap-3">
                          <button onClick={() => removeObatFromResep(item.obatId)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Minus className="w-3 h-3"/></button>
                          <span className="font-bold w-4 text-center">{item.jumlah}</span>
                          <button onClick={() => addObatToResep({id: item.obatId})} className="p-1 text-teal-600 hover:bg-teal-50 rounded"><Plus className="w-3 h-3"/></button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="p-4 border-t bg-zinc-50 flex justify-end gap-2 shrink-0">
                <Button variant="ghost" onClick={() => setShowResepModal(false)}>Batal</Button>
                <Button onClick={submitResep} disabled={selectedObat.length === 0 || resepLoading}>
                  {resepLoading ? "Mengirim..." : "Kirim Resep"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Checkout (Pasien) */}
        {showCheckoutModal && checkoutData && (
          <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
              <div className="p-4 border-b font-bold flex justify-between items-center">
                <span>Checkout Pembayaran</span>
                <button onClick={() => setShowCheckoutModal(false)} className="text-zinc-400 hover:text-zinc-700">✕</button>
              </div>
              <div className="p-4">
                <div className="bg-teal-50 text-teal-800 p-3 rounded-lg mb-4 text-sm">
                  Total Tagihan Anda: <strong className="text-lg block mt-1">Rp {checkoutData.items.reduce((sum: number, i: any) => sum + (i.harga * i.jumlah), 0)}</strong>
                </div>
                
                <p className="text-sm font-medium mb-2">Pilih Metode Pembayaran:</p>
                <div className="space-y-2 mb-6">
                  {["Transfer Bank", "E-Wallet (GoPay/OVO)", "Kartu Kredit"].map(metode => (
                    <label key={metode} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${metodeBayar === metode ? "border-teal-500 bg-teal-50/50" : "hover:bg-zinc-50"}`}>
                      <input 
                        type="radio" 
                        name="metode" 
                        value={metode} 
                        checked={metodeBayar === metode}
                        onChange={(e) => setMetodeBayar(e.target.value)}
                        className="mr-3 text-teal-600 focus:ring-teal-500"
                      />
                      <CreditCard className="w-4 h-4 mr-2 text-zinc-400" />
                      <span className="text-sm font-medium">{metode}</span>
                    </label>
                  ))}
                </div>
                
                <Button className="w-full bg-teal-600 hover:bg-teal-700" onClick={submitCheckout} disabled={checkoutLoading}>
                  {checkoutLoading ? "Memproses Pembayaran..." : "Konfirmasi Pembayaran"}
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
