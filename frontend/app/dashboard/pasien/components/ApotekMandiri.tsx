"use client";

import { useEffect, useState } from "react";
import { api } from "../../../../lib/api";
import { Button } from "../../../../components/ui/button";
import { useToast } from "../../../../components/ToastProvider";
import { ShoppingBag, ShoppingCart, Plus, Minus } from "lucide-react";
import ApotekCheckoutModal from "./ApotekCheckoutModal";

export default function ApotekMandiri() {
  const { addToast } = useToast();
  const [obatList, setObatList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{ [key: number]: { obat: any; jumlah: number } }>({});
  
  // Checkout modal trigger state
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  useEffect(() => {
    fetchObatPasien();
  }, []);

  const fetchObatPasien = async () => {
    try {
      const res = await api.get("/master/obat/pasien");
      setObatList(res.data);
    } catch (error) {
      addToast("Gagal memuat katalog obat apotek", "error");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (obat: any) => {
    if (obat.stok <= 0) {
      addToast("Stok obat ini sedang kosong!", "error");
      return;
    }
    const currentQty = cart[obat.id]?.jumlah || 0;
    if (currentQty >= obat.stok) {
      addToast(`Stok terbatas! Maksimal pembelian ${obat.stok} unit`, "error");
      return;
    }
    setCart({
      ...cart,
      [obat.id]: { obat, jumlah: currentQty + 1 }
    });
  };

  const removeFromCart = (obatId: number) => {
    const currentQty = cart[obatId]?.jumlah || 0;
    if (currentQty <= 1) {
      const newCart = { ...cart };
      delete newCart[obatId];
      setCart(newCart);
    } else {
      setCart({
        ...cart,
        [obatId]: { ...cart[obatId], jumlah: currentQty - 1 }
      });
    }
  };

  const getCartTotal = () => {
    return Object.values(cart).reduce((total, item) => total + (item.obat.harga * item.jumlah), 0);
  };

  const getCartCount = () => {
    return Object.values(cart).reduce((count, item) => count + item.jumlah, 0);
  };

  const handleCheckoutSuccess = () => {
    setCart({});
    fetchObatPasien(); // Refresh stok di layar katalog
  };

  return (
    <div className="mt-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-teal-900/5 border border-white/60 overflow-hidden relative">
      {/* Header */}
      <div className="px-8 py-6 border-b border-zinc-200/50 bg-white/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-3">
            <ShoppingBag className="h-7 w-7 text-teal-600" />
            Apotek Online Mandiri
          </h3>
          <p className="mt-1 text-sm text-zinc-500 ml-10">Beli obat bebas & vitamin langsung tanpa resep dokter.</p>
        </div>

        {/* Keranjang Belanja Ringkasan */}
        {getCartCount() > 0 && (
          <Button 
            onClick={() => setShowCheckoutModal(true)}
            className="bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20 flex items-center gap-2 rounded-xl h-11 px-5 animate-in fade-in zoom-in duration-300"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Keranjang ({getCartCount()})</span>
            <span className="font-bold border-l border-teal-500 pl-2 ml-1">Rp {getCartTotal()}</span>
          </Button>
        )}
      </div>

      {/* Katalog */}
      <div className="p-8">
        {loading ? (
          <div className="text-center py-8 text-zinc-500">Memuat katalog apotek...</div>
        ) : obatList.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 italic">Katalog obat sedang tidak tersedia.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {obatList.map((obat) => {
              const qtyInCart = cart[obat.id]?.jumlah || 0;
              return (
                <div 
                  key={obat.id} 
                  className="bg-white rounded-2xl border border-zinc-200/60 p-5 hover:shadow-lg hover:shadow-teal-900/5 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full font-semibold border border-teal-100">
                        {obat.kategori === "NON_RESEP" ? "Obat Bebas" : obat.kategori}
                      </span>
                      <span className="text-xs text-zinc-400 font-medium">Stok: {obat.stok}</span>
                    </div>
                    <h4 className="font-bold text-zinc-900 text-base mb-1">{obat.nama}</h4>
                    <p className="text-teal-700 font-extrabold text-lg mb-4">Rp {obat.harga}</p>
                  </div>

                  <div className="mt-2">
                    {qtyInCart > 0 ? (
                      <div className="flex items-center justify-between border border-teal-200 bg-teal-50/20 rounded-xl p-1.5 animate-in slide-in-from-bottom-2 duration-255">
                        <button 
                          onClick={() => removeFromCart(obat.id)}
                          className="h-8 w-8 rounded-lg bg-white shadow-sm border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 active:scale-95 transition-all"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-bold text-teal-800 text-sm">{qtyInCart}</span>
                        <button 
                          onClick={() => addToCart(obat)}
                          className="h-8 w-8 rounded-lg bg-white shadow-sm border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 active:scale-95 transition-all"
                          disabled={qtyInCart >= obat.stok}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => addToCart(obat)}
                        className="w-full bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl h-10 transition-all font-semibold active:scale-98"
                        disabled={obat.stok <= 0}
                      >
                        {obat.stok <= 0 ? "Stok Habis" : "Tambah ke Keranjang"}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Checkout Pecahan */}
      <ApotekCheckoutModal 
        isOpen={showCheckoutModal} 
        onClose={() => setShowCheckoutModal(false)} 
        cart={cart} 
        onSuccess={handleCheckoutSuccess}
      />
    </div>
  );
}
