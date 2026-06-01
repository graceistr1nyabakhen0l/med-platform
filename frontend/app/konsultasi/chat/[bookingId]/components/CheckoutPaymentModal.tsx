"use client";

import { useState } from "react";
import { api } from "../../../../../lib/api";
import { Button } from "../../../../../components/ui/button";
import { useToast } from "../../../../../components/ToastProvider";
import { CreditCard, X } from "lucide-react";

interface CheckoutPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string | number;
  checkoutData: any;
  onSuccess: () => void;
}

export default function CheckoutPaymentModal({ isOpen, onClose, bookingId, checkoutData, onSuccess }: CheckoutPaymentModalProps) {
  const { addToast } = useToast();
  const [metodeBayar, setMetodeBayar] = useState("Transfer Bank");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  if (!isOpen || !checkoutData) return null;

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

      addToast("Pembayaran berhasil! Resep sudah ditebus.", "success");
      onSuccess();
      onClose();
    } catch (error: any) {
      addToast(error.response?.data?.message || "Pembayaran gagal", "error");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-4 border-b font-bold flex justify-between items-center bg-white">
          <span>Checkout Pembayaran</span>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 bg-white">
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
  );
}
