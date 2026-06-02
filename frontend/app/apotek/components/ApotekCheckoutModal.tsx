"use client";

import { useState } from "react";
import { api } from "../../../lib/api";
import { Button } from "../../../components/ui/button";
import { useToast } from "../../../components/ToastProvider";
import { CreditCard, X } from "lucide-react";

interface ApotekCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: { [key: number]: { obat: any; jumlah: number } };
  onSuccess: () => void;
}

export default function ApotekCheckoutModal({ isOpen, onClose, cart, onSuccess }: ApotekCheckoutModalProps) {
  const { addToast } = useToast();
  const [metodeBayar, setMetodeBayar] = useState("Transfer Bank");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  if (!isOpen) return null;

  const getCartTotal = () => {
    return Object.values(cart).reduce((total, item) => total + (item.obat.harga * item.jumlah), 0);
  };

  const submitCheckout = async () => {
    setCheckoutLoading(true);
    try {
      // Mapping metode bayar ke format yang diharapkan backend
      let metodeBayarValue = "";
      switch (metodeBayar) {
        case "Transfer Bank":
          metodeBayarValue = "TRANSFER";
          break;
        case "E-Wallet (GoPay/OVO)":
          metodeBayarValue = "EWALLET";
          break;
        case "Kartu Kredit":
          metodeBayarValue = "KREDIT";
          break;
        default:
          metodeBayarValue = "TRANSFER";
      }

      const payload = {
        metodeBayar: metodeBayarValue,
        obatItems: Object.values(cart).map((item) => ({
          obatId: item.obat.id,
          jumlah: item.jumlah,
        })),
      };

      console.log("📦 Payload:", payload);

      const response = await api.post("/transaction/checkout", payload);
      console.log("✅ Response:", response.data);

      addToast("Pembelian obat berhasil diproses!", "success");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("❌ Error:", error);
      console.error("Response:", error?.response?.data);
      addToast(error.response?.data?.message || "Gagal melakukan pembelian", "error");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-zinc-100 font-bold text-lg flex justify-between items-center bg-white">
          <span>Checkout Keranjang Obat</span>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1.5 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-white space-y-4">
          <div className="bg-teal-50 text-teal-800 p-4 rounded-2xl">
            <span className="text-xs uppercase tracking-wider font-bold text-teal-600 block mb-1">Total Pembayaran</span>
            <strong className="text-2xl font-extrabold">Rp {getCartTotal().toLocaleString('id-ID')}</strong>
          </div>

          <div>
            <p className="text-sm font-semibold text-zinc-700 mb-2">Daftar Belanja:</p>
            <div className="border border-zinc-100 rounded-2xl divide-y divide-zinc-100 overflow-hidden bg-zinc-50/50">
              {Object.values(cart).map((item) => (
                <div key={item.obat.id} className="p-3.5 flex justify-between text-sm">
                  <div>
                    <p className="font-bold text-zinc-800">{item.obat.nama}</p>
                    <p className="text-xs text-zinc-400">{item.jumlah} unit x Rp {item.obat.harga.toLocaleString('id-ID')}</p>
                  </div>
                  <span className="font-bold text-zinc-950">Rp {(item.obat.harga * item.jumlah).toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-zinc-700 mb-2">Metode Pembayaran:</p>
            <div className="space-y-2">
              {["Transfer Bank", "E-Wallet (GoPay/OVO)", "Kartu Kredit"].map((metode) => (
                <label
                  key={metode}
                  className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all ${metodeBayar === metode ? "border-teal-500 bg-teal-50/40 shadow-sm" : "border-zinc-200 hover:bg-zinc-50"}`}
                >
                  <input
                    type="radio"
                    name="metode-apotek"
                    value={metode}
                    checked={metodeBayar === metode}
                    onChange={(e) => setMetodeBayar(e.target.value)}
                    className="mr-3 text-teal-600 focus:ring-teal-500 h-4 w-4"
                  />
                  <CreditCard className="w-4 h-4 mr-2 text-zinc-400" />
                  <span className="text-sm font-medium text-zinc-700">{metode}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex flex-col gap-2">
          <Button
            className="w-full bg-teal-600 hover:bg-teal-700 h-12 rounded-xl text-base font-bold shadow-lg shadow-teal-600/20"
            onClick={submitCheckout}
            disabled={checkoutLoading}
          >
            {checkoutLoading ? "Memproses..." : "Konfirmasi & Bayar"}
          </Button>
          <Button
            variant="ghost"
            className="w-full h-11 rounded-xl font-semibold text-zinc-500 hover:text-zinc-700"
            onClick={onClose}
            disabled={checkoutLoading}
          >
            Batal
          </Button>
        </div>
      </div>
    </div>
  );
}