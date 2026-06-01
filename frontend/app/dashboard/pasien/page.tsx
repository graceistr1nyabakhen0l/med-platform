"use client";
 
import { useAuth } from "../../../lib/useAuth";
import ProfilForm from "./components/ProfilForm";
import PasienBookingList from "./components/PasienBookingList";
import ApotekMandiri from "./components/ApotekMandiri";
 
export default function PasienDashboard() {
  const { user, isLoading: authLoading } = useAuth(["PASIEN"]);
 
  if (authLoading) {
    return <div className="min-h-screen p-8 text-center text-zinc-500">Memuat dashboard...</div>;
  }
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-zinc-100 relative overflow-hidden pb-12">
      {/* Background Ornaments */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-teal-200/20 blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-blue-100/30 blur-3xl translate-x-1/3 translate-y-1/3"></div>
      </div>
 
      <div className="max-w-4xl mx-auto px-4 pt-12 pb-8 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight">Dashboard Pasien</h1>
          <p className="mt-3 text-lg text-zinc-600">Selamat datang kembali, <span className="font-semibold text-teal-700">{user?.nama}</span>!</p>
        </div>
 
        <ProfilForm user={user} />
        <PasienBookingList user={user} />
        <ApotekMandiri />
 
      </div>
    </div>
  );
}
