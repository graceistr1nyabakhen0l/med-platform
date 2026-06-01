"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Search, Calendar, Clock, UserRound } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export default function Home() {
  const [dokters, setDokters] = useState<any[]>([]);
  const [spesialisasi, setSpesialisasi] = useState("");
  const [hari, setHari] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchDokters = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (spesialisasi) params.append("spesialisasi", spesialisasi);
      if (hari) params.append("hari", hari);
      
      let url = '/master/dokters';
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
      
      const res = await api.get(url);
      setDokters(res.data);
    } catch (error) {
      console.error("Gagal mengambil data dokter:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDokters();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDokters();
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-12">
      {/* Hero Section */}
      <div className="bg-teal-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Cari Dokter & Jadwalkan Konsultasi
            </h1>
            <p className="mt-4 text-xl text-teal-100">
              Temukan dokter spesialis terbaik untuk kebutuhan kesehatan Anda dengan mudah dan cepat.
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-4xl mx-auto -mt-8 px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-md p-4 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-zinc-700 mb-1">Spesialisasi</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <Input
                className="pl-9"
                placeholder="Contoh: Jantung, Umum, Gigi..."
                value={spesialisasi}
                onChange={(e) => setSpesialisasi(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-zinc-700 mb-1">Hari Praktik</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <Input
                className="pl-9"
                placeholder="Contoh: Senin, Selasa..."
                value={hari}
                onChange={(e) => setHari(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" className="w-full md:w-auto px-8" disabled={loading}>
            {loading ? "Mencari..." : "Cari Dokter"}
          </Button>
        </form>
      </div>

      {/* Doctor List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <h2 className="text-2xl font-bold text-zinc-900 mb-6">Hasil Pencarian Dokter</h2>
        
        {loading ? (
          <div className="text-center py-12 text-zinc-500">Memuat data dokter...</div>
        ) : dokters.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 bg-white rounded-lg border border-dashed border-zinc-300">
            Tidak ada dokter yang ditemukan dengan kriteria tersebut.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dokters.map((dokter) => (
              <div key={dokter.id} className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-14 w-14 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                      <UserRound className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-zinc-900">{dokter.nama}</h3>
                      <p className="text-teal-600 font-medium text-sm">{dokter.profilDokter?.spesialisasi}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-4 pt-4 border-t border-zinc-100">
                    <div className="flex items-center gap-2 text-sm text-zinc-600">
                      <Calendar className="h-4 w-4 shrink-0 text-zinc-400" />
                      <span>{dokter.profilDokter?.jadwalHari}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-600">
                      <Clock className="h-4 w-4 shrink-0 text-zinc-400" />
                      <span>{dokter.profilDokter?.jadwalJam}</span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button variant="outline" className="w-full text-teal-600 border-teal-200 hover:bg-teal-50" onClick={() => window.location.href = `/konsultasi/booking/${dokter.id}`}>
                      Buat Janji Konsultasi
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
