"use client";

import { useAuth } from "../../lib/useAuth";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Button } from "../../components/ui/button";
import { useToast } from "../../components/ToastProvider";
import { ShoppingBag, ShoppingCart, Plus, Minus, Activity } from "lucide-react";
import ApotekCheckoutModal from "./components/ApotekCheckoutModal";

export default function ApotekPage() {
  const { user, isLoading: authLoading } = useAuth(["PASIEN"]);
  const { addToast } = useToast();

  const [obatList, setObatList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{ [key: number]: { obat: any; jumlah: number } }>({});
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchObatPasien();
    }
  }, [user]);

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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-4">
          <Activity className="h-8 w-8 text-teal-600 animate-spin" />
          <p className="text-zinc-500 font-medium">Mempersiapkan Apotek Online...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-zinc-100 relative overflow-hidden pb-12">
      {/* Background Ornaments */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-teal-200/20 blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-blue-100/30 blur-3xl translate-x-1/3 translate-y-1/3"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-12 pb-8 sm:px-6 lg:px-8 relative z-10">
        {/* Banner Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-3">
              <ShoppingBag className="h-10 w-10 text-teal-600" />
              Apotek Online Mandiri
            </h1>
            <p className="mt-2 text-lg text-zinc-600">Beli obat bebas & vitamin langsung tanpa resep dokter.</p>
          </div>

          {/* Keranjang Belanja Ringkasan */}
          {getCartCount() > 0 && (
            <Button
              onClick={() => setShowCheckoutModal(true)}
              className="bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/20 flex items-center gap-2 rounded-xl h-12 px-6 text-base font-semibold transition-all animate-in fade-in zoom-in duration-300"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Keranjang ({getCartCount()})</span>
              <span className="font-bold border-l border-teal-500 pl-3 ml-2">
                Rp {getCartTotal().toLocaleString('id-ID')}
              </span>
            </Button>
          )}
        </div>

        {/* Katalog */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-teal-900/5 border border-white/60 p-8">
          {loading ? (
            <div className="text-center py-12 text-zinc-500">Memuat katalog apotek...</div>
          ) : obatList.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 italic">Katalog obat sedang tidak tersedia.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {obatList.map((obat) => {
                const qtyInCart = cart[obat.id]?.jumlah || 0;
                return (
                  <div
                    key={obat.id}
                    className="bg-white rounded-2xl border border-zinc-200/60 p-6 hover:shadow-xl hover:shadow-teal-900/5 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs bg-teal-50 text-teal-700 px-3 py-1 rounded-full font-semibold border border-teal-100">
                          {obat.kategori === "NON_RESEP" ? "Obat Bebas" : obat.kategori}
                        </span>
                        <span className="text-xs text-zinc-400 font-medium">Stok: {obat.stok}</span>
                      </div>
                      <h4 className="font-bold text-zinc-900 text-lg mb-1">{obat.nama}</h4>
                      <p className="text-teal-700 font-extrabold text-xl mb-6">
                        Rp {obat.harga.toLocaleString('id-ID')}
                      </p>
                    </div>

                    <div className="mt-2">
                      {qtyInCart > 0 ? (
                        <div className="flex items-center justify-between border border-teal-200 bg-teal-50/20 rounded-xl p-2 animate-in slide-in-from-bottom-2 duration-250">
                          <button
                            onClick={() => removeFromCart(obat.id)}
                            className="h-9 w-9 rounded-lg bg-white shadow-sm border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 active:scale-95 transition-all"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-extrabold text-teal-800 text-base">{qtyInCart}</span>
                          <button
                            onClick={() => addToCart(obat)}
                            className="h-9 w-9 rounded-lg bg-white shadow-sm border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 active:scale-95 transition-all"
                            disabled={qtyInCart >= obat.stok}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => addToCart(obat)}
                          className="w-full bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl h-11 transition-all font-semibold active:scale-98"
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
      </div>

      {/* Checkout Modal */}
      <ApotekCheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        cart={cart}
        onSuccess={handleCheckoutSuccess}
      />
    </div>
  );
}
