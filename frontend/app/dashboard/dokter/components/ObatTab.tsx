"use client";

import { useEffect, useState } from "react";
import { api } from "../../../../lib/api";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { useToast } from "../../../../components/ToastProvider";
import { Pill, Plus, Edit2, Trash2, X, Search } from "lucide-react";

export default function ObatTab() {
  const { addToast } = useToast();
  
  const [obat, setObat] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"tambah" | "edit">("tambah");
  const [currentObatId, setCurrentObatId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nama: "",
    kategori: "NON_RESEP",
    harga: "",
    stok: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchObat();
  }, []);

  const fetchObat = async () => {
    try {
      const res = await api.get("/master/obat/dokter");
      setObat(res.data);
    } catch (error) {
      addToast("Gagal mengambil data obat", "error");
    } finally {
      setLoading(false);
    }
  };

  const openTambahModal = () => {
    setModalMode("tambah");
    setFormData({ nama: "", kategori: "NON_RESEP", harga: "", stok: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setModalMode("edit");
    setCurrentObatId(item.id);
    setFormData({
      nama: item.nama,
      kategori: item.kategori,
      harga: item.harga.toString(),
      stok: item.stok.toString(),
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data obat ini?")) return;
    
    try {
      await api.delete(`/master/obat/${id}`);
      addToast("Data obat berhasil dihapus", "success");
      fetchObat();
    } catch (error) {
      addToast("Gagal menghapus data", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const payload = {
      nama: formData.nama,
      kategori: formData.kategori,
      harga: parseFloat(formData.harga),
      stok: parseInt(formData.stok),
    };

    try {
      if (modalMode === "tambah") {
        await api.post("/master/obat", payload);
        addToast("Obat baru berhasil ditambahkan", "success");
      } else {
        await api.put(`/master/obat/${currentObatId}`, payload);
        addToast("Data obat berhasil diperbarui", "success");
      }
      setIsModalOpen(false);
      fetchObat();
    } catch (error) {
      addToast("Gagal menyimpan data", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-zinc-500 animate-pulse">
        <Pill className="w-10 h-10 mb-4 text-zinc-300" />
        <p>Menyiapkan apotek digital Anda...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Table Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            Manajemen Data Obat
          </h3>
          <p className="text-sm text-zinc-500 mt-1">Kelola stok dan harga obat untuk peresepan pasien.</p>
        </div>
        
        <Button 
          onClick={openTambahModal} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 rounded-xl px-5 h-11"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Obat Baru
        </Button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-zinc-900/5 border border-white/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200/50">
            <thead className="bg-zinc-50/50">
              <tr>
                <th className="px-8 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Info Obat</th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Kategori</th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Harga Satuan</th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Stok Tersedia</th>
                <th className="px-8 py-4 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white/30 divide-y divide-zinc-200/50">
              {obat.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center">
                      <Pill className="w-10 h-10 text-zinc-300 mb-3" />
                      <p className="text-base font-medium text-zinc-600">Belum ada obat di apotek</p>
                      <p className="text-sm mt-1">Klik tombol "Tambah Obat Baru" untuk memulai.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                obat.map((item) => (
                  <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-zinc-900 group-hover:text-indigo-700 transition-colors">{item.nama}</span>
                        <span className="text-xs text-zinc-500">ID: #{item.id}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        item.kategori === 'RESEP' 
                        ? 'bg-amber-50 text-amber-700 border-amber-200' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${item.kategori === 'RESEP' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                        {item.kategori}
                      </span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <span className="text-sm font-medium text-zinc-700">Rp {item.harga.toLocaleString('id-ID')}</span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <span className={`text-sm font-medium ${item.stok < 10 ? 'text-red-600' : 'text-zinc-700'}`}>
                        {item.stok} unit
                      </span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEditModal(item)}
                          className="p-2 bg-white rounded-lg border border-zinc-200 text-zinc-600 hover:text-indigo-600 hover:border-indigo-200 shadow-sm transition-all"
                          title="Edit Obat"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 bg-white rounded-lg border border-zinc-200 text-zinc-600 hover:text-red-600 hover:border-red-200 shadow-sm transition-all"
                          title="Hapus Obat"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal CRUD Premium */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop Blur */}
            <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white/90 backdrop-blur-xl border border-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full animate-in zoom-in-95 duration-200">
              <form onSubmit={handleSubmit}>
                <div className="px-8 pt-8 pb-6">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-2xl font-bold text-zinc-900" id="modal-title">
                        {modalMode === "tambah" ? "Tambah Obat Baru" : "Perbarui Obat"}
                      </h3>
                      <p className="text-sm text-zinc-500 mt-1">Lengkapi detail obat di bawah ini.</p>
                    </div>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="bg-zinc-100 hover:bg-zinc-200 p-2 rounded-full text-zinc-500 transition-colors">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Nama Obat</label>
                      <Input
                        required
                        placeholder="Contoh: Paracetamol 500mg"
                        value={formData.nama}
                        onChange={(e) => setFormData({...formData, nama: e.target.value})}
                        className="bg-white/80 border-zinc-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Kategori Peresepan</label>
                      <select
                        className="block w-full pl-3 pr-10 py-2.5 text-sm border-zinc-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-xl border bg-white/80"
                        value={formData.kategori}
                        onChange={(e) => setFormData({...formData, kategori: e.target.value})}
                      >
                        <option value="NON_RESEP">Non-Resep (Bebas)</option>
                        <option value="RESEP">Resep Dokter (Butuh Nota)</option>
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Harga Satuan (Rp)</label>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          required
                          value={formData.harga}
                          onChange={(e) => setFormData({...formData, harga: e.target.value})}
                          className="bg-white/80 border-zinc-200 rounded-xl"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Stok Awal</label>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          required
                          value={formData.stok}
                          onChange={(e) => setFormData({...formData, stok: e.target.value})}
                          className="bg-white/80 border-zinc-200 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-zinc-50/80 px-8 py-5 border-t border-zinc-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl border-zinc-200 text-zinc-600 w-full sm:w-auto">
                    Batalkan
                  </Button>
                  <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/20 w-full sm:w-auto">
                    {saving ? "Memproses..." : "Simpan Perubahan"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
