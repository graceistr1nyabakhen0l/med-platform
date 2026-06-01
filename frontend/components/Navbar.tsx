"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getUser, logout } from "../lib/api";
import { Activity, LogOut, User } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUserData] = useState<any>(null);

  useEffect(() => {
    setUserData(getUser());
  }, [pathname]);

  if (pathname.startsWith("/auth")) return null; // Sembunyikan navbar di halaman auth

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-zinc-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-teal-600 font-bold text-xl">
            <Activity className="h-6 w-6" />
            <span>MedPlatform</span>
          </Link>

          {/* Nav Links & Auth */}
          <div className="flex items-center gap-6">
            <Link href="/" className="text-zinc-600 hover:text-teal-600 font-medium text-sm transition-colors">
              Cari Dokter
            </Link>
            
            {user ? (
              <>
                {user.role === "PASIEN" && (
                  <Link href="/dashboard/pasien" className="text-zinc-600 hover:text-teal-600 font-medium text-sm transition-colors">
                    Dashboard Saya
                  </Link>
                )}
                {user.role === "DOKTER" && (
                  <Link href="/dashboard/dokter" className="text-zinc-600 hover:text-teal-600 font-medium text-sm transition-colors">
                    Panel Dokter
                  </Link>
                )}
                <div className="flex items-center gap-4 pl-4 border-l border-zinc-200">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-900">
                    <User className="h-4 w-4" />
                    {user.nama} ({user.role})
                  </span>
                  <button
                    onClick={logout}
                    className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Keluar
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3 pl-4 border-l border-zinc-200">
                <Link
                  href="/auth/login"
                  className="text-teal-600 hover:text-teal-700 font-medium text-sm px-3 py-2 transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm px-4 py-2 rounded-md shadow-sm transition-colors"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
