"use client";

import { useState } from "react";
import { useAuth } from "../../../lib/useAuth";
import { Pill, MessageSquare, Activity, ShieldCheck, Users } from "lucide-react";
import KonsultasiTab from "./components/KonsultasiTab";
import ObatTab from "./components/ObatTab";

export default function DokterDashboard() {
  const { user, isLoading: authLoading } = useAuth(["DOKTER", "ADMIN"]);
  const [activeTab, setActiveTab] = useState<"konsultasi" | "obat">("konsultasi");

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-4">
          <Activity className="h-8 w-8 text-teal-600 animate-spin" />
          <p className="text-zinc-500 font-medium">Menyiapkan ruang kerja Anda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-teal-50 relative overflow-hidden pb-12">
      {/* Dekorasi Latar Belakang */}
      <div className="absolute top-0 left-0 w-full h-96 bg-teal-600/5 blur-3xl rounded-b-[100%] pointer-events-none -z-10"></div>
      <div className="absolute top-20 right-10 w-64 h-64 bg-indigo-600/5 blur-3xl rounded-full pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        
        {/* Header Premium */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100/50 text-teal-700 text-xs font-semibold mb-3 border border-teal-200/50">
              <ShieldCheck className="w-4 h-4" />
              Akses Dokter Terverifikasi
            </div>
            <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight">Dashboard Praktik</h1>
            <p className="mt-2 text-lg text-zinc-600 font-medium">Selamat bertugas kembali, <span className="text-teal-700 font-bold">dr. {user?.nama}</span></p>
          </div>
          
          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-zinc-200/60 w-fit">
            <button
              onClick={() => setActiveTab("konsultasi")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === "konsultasi"
                  ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                  : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100/50"
              }`}
            >
              <Users className="w-4 h-4" /> Daftar Pasien
            </button>
            <button
              onClick={() => setActiveTab("obat")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === "obat"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100/50"
              }`}
            >
              <Pill className="w-4 h-4" /> Apotek & Obat
            </button>
          </div>
        </div>

        {/* Area Konten Dinamis */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
          {activeTab === "konsultasi" && <KonsultasiTab user={user} />}
          {activeTab === "obat" && <ObatTab />}
        </div>
      </div>
    </div>
  );
}
