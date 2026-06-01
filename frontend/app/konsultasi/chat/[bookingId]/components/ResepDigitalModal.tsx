"use client";

import { useEffect, useState } from "react";
import { api } from "../../../../../lib/api";
import { Button } from "../../../../../components/ui/button";
import { useToast } from "../../../../../components/ToastProvider";
import { Plus, Minus, X } from "lucide-react";

interface ResepDigitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string | number;
  onSuccess: () => void;
}

export default function ResepDigitalModal({ isOpen, onClose, bookingId, onSuccess }: ResepDigitalModalProps) {
  const { addToast } = useToast();
  const [obatList, setObatList] = useState<any[]>([]);
  const [selectedObat, setSelectedObat] = useState<{ obatId: number; jumlah: number; nama: string; harga: number }[]>([]);
  const [resepLoading, setResepLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchObatList();
      setSelectedObat([]); // reset on open
    }
  }, [isOpen]);

  const fetchObatList = async () => {
    try {
      const res = await api.get("/master/obat/dokter");
      setObatList(res.data);
    } catch (error) {
      addToast("Gagal memuat daftar obat", "error");
    }
  };

  const addObatToResep = (obat: any) => {
    const exists = selectedObat.find((o) => o.obatId === (obat.id || obat.obatId));
    if (exists) {
      setSelectedObat(selectedObat.map((o) => (o.obatId === (obat.id || obat.obatId) ? { ...o, jumlah: o.jumlah + 1 } : o)));
    } else {
      setSelectedObat([...selectedObat, { obatId: obat.id, jumlah: 1, nama: obat.nama, harga: obat.harga }]);
    }
  };

  const removeObatFromResep = (obatId: number) => {
    const exists = selectedObat.find((o) => o.obatId === obatId);
    if (exists && exists.jumlah > 1) {
      setSelectedObat(selectedObat.map((o) => (o.obatId === obatId ? { ...o, jumlah: o.jumlah - 1 } : o)));
    } else {
      setSelectedObat(selectedObat.filter((o) => o.obatId !== obatId));
    }
  };

  const submitResep = async () => {
    if (selectedObat.length === 0) return addToast("Pilih minimal 1 obat", "error");
    
    setResepLoading(true);
    try {
      const payload = {
        bookingId: Number(bookingId),
        items: selectedObat.map((o) => ({ obatId: o.obatId, jumlah: o.jumlah }))
      };
      const res = await api.post("/transaction/resep", payload);
      
      // Kirim pesan sistem (tersembunyi dalam format JSON) ke chat
      const resepMessage = `[RESEP]: ${JSON.stringify({ resepId: res.data.id, items: selectedObat })}`;
      await api.post("/transaction/chat", { bookingId: Number(bookingId), pesan: resepMessage });
      
      addToast("Resep berhasil dibuat", "success");
      onSuccess();
      onClose();
    } catch (error) {
      addToast("Gagal membuat resep", "error");
    } finally {
      setResepLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-full">
        <div className="p-4 border-b font-bold flex justify-between items-center bg-white">
          <span>Buat Resep Digital</span>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1 bg-white">
          <p className="text-sm text-zinc-500 mb-2">Pilih Obat dari Apotek:</p>
          <div className="space-y-2 border border-zinc-200 p-2 rounded-lg h-48 overflow-y-auto bg-zinc-50 mb-4">
            {obatList.map((obat) => (
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
              {selectedObat.map((item) => (
                <li key={item.obatId} className="flex justify-between items-center text-sm border-b pb-2">
                  <span>{item.nama}</span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => removeObatFromResep(item.obatId)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-bold w-4 text-center">{item.jumlah}</span>
                    <button onClick={() => addObatToResep(item)} className="p-1 text-teal-600 hover:bg-teal-50 rounded">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="p-4 border-t bg-zinc-50 flex justify-end gap-2 shrink-0">
          <Button variant="ghost" onClick={onClose}>Batal</Button>
          <Button onClick={submitResep} disabled={selectedObat.length === 0 || resepLoading} className="bg-teal-600 hover:bg-teal-700">
            {resepLoading ? "Mengirim..." : "Kirim Resep"}
          </Button>
        </div>
      </div>
    </div>
  );
}
