"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../lib/useAuth";
import { api } from "../../../lib/api";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { useToast } from "../../../components/ToastProvider";
import { Pill, Plus, Edit2, Trash2, X, MessageSquare, Clock, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DokterDashboard() {
  const { user, isLoading: authLoading } = useAuth(["DOKTER", "ADMIN"]);
  const { addToast } = useToast();
  
  const [obat, setObat] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<"konsultasi" | "obat">("konsultasi");
  const [bookings, setBookings] = useState<any[]>([]);
  const router = useRouter();
  
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
    if (user) {
      fetchObat();
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const res = await api.get("/transaction/bookings");
      setBookings(res.data);
    } catch (error) {
      addToast("Gagal mengambil data konsultasi", "error");
    }
  };

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

  if (authLoading || loading) {
    return <div className="min-h-screen p-8 text-center text-zinc-500">Memuat dashboard...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Dashboard Dokter</h1>
          <p className="mt-2 text-zinc-600">Selamat datang, dr. {user?.nama}!</p>
        </div>
        {activeTab === "obat" && (
          <Button onClick={openTambahModal} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Tambah Obat
          </Button>
        )}
      </div>

      <div className="flex border-b border-zinc-200 mb-6 gap-6">
        <button
          onClick={() => setActiveTab("konsultasi")}
          className={`pb-3 font-medium text-sm transition-colors border-b-2 ${activeTab === "konsultasi" ? "border-teal-600 text-teal-600" : "border-transparent text-zinc-500 hover:text-zinc-700"}`}
        >
          <div className="flex items-center gap-2"><MessageSquare className="w-4 h-4"/> Daftar Konsultasi</div>
        </button>
        <button
          onClick={() => setActiveTab("obat")}
          className={`pb-3 font-medium text-sm transition-colors border-b-2 ${activeTab === "obat" ? "border-teal-600 text-teal-600" : "border-transparent text-zinc-500 hover:text-zinc-700"}`}
        >
          <div className="flex items-center gap-2"><Pill className="w-4 h-4"/> Manajemen Obat</div>
        </button>
      </div>

      {activeTab === "konsultasi" && (
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden mb-8">
          <div className="px-6 py-5 border-b border-zinc-200 bg-zinc-50">
            <h3 className="text-lg font-medium leading-6 text-zinc-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-teal-600" />
              Konsultasi Masuk
            </h3>
          </div>
          
          <div className="divide-y divide-zinc-200">
            {bookings.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">Belum ada pasien yang mendaftar konsultasi.</div>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="p-6 hover:bg-zinc-50 transition-colors flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                      <UserRound className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-zinc-900">{booking.pasien?.nama}</h4>
                      <p className="text-sm text-zinc-500">{booking.pasien?.email}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-1 rounded-md border border-zinc-200">
                          Booking ID: #{booking.id}
                        </span>
                        <span className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded-md border border-teal-100">
                          {new Date(booking.createdAt).toLocaleDateString('id-ID', {day: 'numeric', month:'long', year:'numeric'})}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button onClick={() => router.push(`/konsultasi/chat/${booking.id}`)} className="bg-teal-600 hover:bg-teal-700">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Buka Ruang Obrolan
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === "obat" && (
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-200 bg-zinc-50">
          <h3 className="text-lg font-medium leading-6 text-zinc-900 flex items-center gap-2">
            <Pill className="h-5 w-5 text-teal-600" />
            Manajemen Data Obat
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Nama Obat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Harga</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Stok</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-zinc-200">
              {obat.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                    Belum ada data obat
                  </td>
                </tr>
              ) : (
                obat.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">#{item.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">{item.nama}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.kategori === 'RESEP' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {item.kategori}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                      Rp {item.harga.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                      {item.stok} unit
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => openEditModal(item)}
                        className="text-teal-600 hover:text-teal-900 mr-4"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-zinc-500 bg-opacity-75 transition-opacity" onClick={() => setIsModalOpen(false)}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-lg leading-6 font-medium text-zinc-900" id="modal-title">
                      {modalMode === "tambah" ? "Tambah Data Obat" : "Ubah Data Obat"}
                    </h3>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-500">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700">Nama Obat</label>
                      <Input
                        required
                        value={formData.nama}
                        onChange={(e) => setFormData({...formData, nama: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-zinc-700">Kategori</label>
                      <select
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-zinc-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md h-10 border bg-white"
                        value={formData.kategori}
                        onChange={(e) => setFormData({...formData, kategori: e.target.value})}
                      >
                        <option value="NON_RESEP">Non-Resep (Bebas)</option>
                        <option value="RESEP">Resep Dokter</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-zinc-700">Harga (Rp)</label>
                      <Input
                        type="number"
                        min="0"
                        required
                        value={formData.harga}
                        onChange={(e) => setFormData({...formData, harga: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-zinc-700">Stok Awal</label>
                      <Input
                        type="number"
                        min="0"
                        required
                        value={formData.stok}
                        onChange={(e) => setFormData({...formData, stok: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-zinc-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <Button type="submit" disabled={saving} className="w-full sm:ml-3 sm:w-auto">
                    {saving ? "Menyimpan..." : "Simpan Data"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="mt-3 w-full sm:mt-0 sm:w-auto">
                    Batal
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
