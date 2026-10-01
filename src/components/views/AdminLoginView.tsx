import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Building2, 
  MapPin, 
  KeyRound,
  UserCheck
} from 'lucide-react';
import { BaliCampingBadge } from '../AppLogo';
import { AdminUser } from '../../types';
import { DEFAULT_ADMIN_USERS } from '../../data/mockData';
  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col justify-between selection:bg-[#1B4332] selection:text-white relative overflow-x-hidden font-sans">
      {/* Decorative Background Accents */}
      <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-b from-[#1B4332] via-[#245842] to-[#F4F5F7] -z-10" />
      <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-teal-400/10 blur-2xl pointer-events-none -z-10" />

      {/* Top Banner Navigation */}
      <header className="pt-6 px-6 max-w-6xl mx-auto w-full flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <BaliCampingBadge className="w-10 h-10 shadow-md" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight bg-[#517053] px-1.5 py-0.5 rounded">
                BALI CAMPING ADVENTURE
              </span>
              <span className="bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-flex">
                Portal Admin v2.4
              </span>
            </div>
            <p className="text-[11px] text-emerald-100/80 font-medium bg-[#37773c] px-1.5 py-0.5 rounded mt-1 inline-block">
              Sistem Operasional Bali Camping Adventure
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 backdrop-blur-xs border border-white/10 text-[11px] text-emerald-100 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Bali Camping Adventure : Online</span>
          </div>
        </div>
      </header>

      {/* Main Form Centerpiece */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Column: Login Card Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl shadow-xl border border-[#E5E7EB] p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Header inside Card */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="p-1.5 rounded-lg bg-[#ECFDF5] text-[#059669]">
                    <KeyRound className="w-4 h-4" />
                  </span>
                  <span className="text-[11px] font-bold text-[#059669] uppercase tracking-wider">
                    Autentikasi Staf Bertugas
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#111827] tracking-tight">
                  Masuk Sesi Operasional
                </h1>
                <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
                  Masukkan identitas staf untuk mengakses POS Sewa, verifikasi QC pengembalian, dan katalog inventaris.
                </p>
              </div>

              {/* Error Alert if any */}
              {errorMessage && (
                <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                  <div>
                    <strong className="block font-semibold">Gagal Autentikasi</strong>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleManualLogin} className="space-y-4 text-xs">
                {/* Email Field */}
                <div>
                  <label 
                    htmlFor="admin-email" 
                    className="block text-[11px] font-bold text-[#374151] mb-1.5"
                  >
                    Email / ID Petugas Depot
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="admin-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama.staf@balicamping.id"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F9FAFB] border border-[#D1D5DB] rounded-xl text-[#111827] font-semibold text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label 
                      htmlFor="admin-password" 
                      className="block text-[11px] font-bold text-[#374151]"
                    >
                      PIN / Kata Sandi
                    </label>
                    <button
                      type="button"
                      onClick={() => setInfoModalOpen(true)}
                      className="text-[11px] text-[#2D6A4F] hover:text-[#1B4332] font-semibold hover:underline cursor-pointer"
                    >
                      Lupa Akses?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="admin-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-[#F9FAFB] border border-[#D1D5DB] rounded-xl text-[#111827] font-semibold text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4B5563] cursor-pointer"
                      title={showPassword ? 'Sembunyikan' : 'Lihat'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Real-time WITA Operational System Notice */}
                <div className="p-3 bg-[#F8FAF9] rounded-xl border border-[#E5E7EB] flex items-start gap-2.5">
                  <div className="p-1.5 bg-[#ECFDF5] text-[#059669] rounded-lg border border-[#A7F3D0] shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#111827]">Sistem Real-Time WITA (GMT+8)</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                    </div>
                    <p className="text-[11px] text-[#6B7280] leading-snug mt-0.5">
                      Pusat Bali Camping Adventure, Bali. Jadwal sewa, durasi, dan serah terima terintegrasi secara langsung 24 jam.
                    </p>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-[#4B5563]">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-[#1B4332] accent-[#1B4332] border-[#D1D5DB]"
                    />
                    <span className="text-[11.5px] font-medium">Ingat sesi di perangkat terminal ini</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  id="btn-submit-admin-login"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-[#1B4332] hover:bg-[#245842] active:bg-[#143326] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed mt-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Memverifikasi Sesi Login...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke Sistem Bali Camping Adventure </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Bottom Security Info */}
            <div className="pt-5 mt-5 border-t border-[#F3F4F6] flex items-center justify-between text-[10.5px] text-[#6B7280]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
                Enkripsi Bali Camping Adventure Terproteksi 256-bit
              </span>
              <span>SOP Bali Camping v2.4</span>
            </div>
          </div>

          {/* Right Column: Single Administrator Profile & Admin Info */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            {/* Single Admin Profile Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-[#E5E7EB] p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#059669]" />
                  <h2 className="text-xs font-bold text-[#111827] uppercase tracking-wide">
                    Akun Administrator Bali Camping Adventure
                  </h2>
                </div>
                <span className="text-[10px] font-semibold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-full">
                  Akun Resmi
                </span>
              </div>
              <p className="text-[11px] text-[#6B7280] mb-3.5 leading-snug">
                Satu-satunya akun administrator yang berwenang mengelola seluruh operasional depot rental, kasir, dan gudang:
              </p>

              {/* Single Admin Card */}
              {DEFAULT_ADMIN_USERS.map((user) => (
                <div
                  key={user.id}
                  className="p-3.5 rounded-xl border border-[#D1D5DB] bg-[#F9FAFB] flex flex-col gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-full object-cover border-2 border-[#1B4332] shrink-0 shadow-xs"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-[#111827] truncate">
                          {user.name}
                        </p>
                        <span className="text-[9.5px] font-semibold text-[#1B4332] bg-[#E8F5E9] px-2 py-0.5 rounded-full shrink-0">
                          {user.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#2D6A4F] font-semibold truncate mt-0.5">
                        {user.email}
                      </p>
                      <p className="text-[10px] text-[#6B7280] mt-0.5">
                        Akses Sentral: <span className="font-medium text-[#374151]">{user.gate}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleQuickLogin(user)}
                    className="w-full py-2 px-3 rounded-lg bg-[#1B4332] hover:bg-[#245842] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                  >
                    <span>Masuk Otomatis sebagai Admin</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Depot Status Overview Card */}
            <div className="bg-[#1B4332] text-white rounded-2xl p-5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">
                    SISTEM SENTRAL Bali Camping Adventure
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-200">
                    <Building2 className="w-3.5 h-3.5" />
                    Bali Camping Adventure
                  </span>
                </div>
                
                <h3 className="text-sm font-bold leading-snug text-white mb-2">
                  Bali Camping Adventure — Portal Operasional
                </h3>
                
                <p className="text-xs text-emerald-100/80 leading-relaxed mb-4">
                  Sistem siap melayani penerbitan kontrak sewa baru, pencetakan struk QRIS & nota perjanjian, inspeksi pengembalian alat, serta inventarisasi peralatan outdoor secara real-time.
                </p>

                <div className="p-2.5 rounded-lg bg-black/20 border border-white/10 text-xs">
                  <span className="text-[10px] text-emerald-200 block">Hak Akses Sistem</span>
                  <strong className="text-xs font-bold text-white block mt-0.5">Semua Fitur Terbuka Penuh</strong>
                  <span className="text-[10.5px] text-emerald-200/80">Inventaris, Sewa Baru, Pengembalian, & Laporan</span>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-emerald-200/80">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Jl. Astasura, gg. Lestari No.2, Denpasar Utara, Peguyangan Kangin
                </span>
                <span>Hotline: 0812-6669-7203</span>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 text-center text-xs text-[#6B7280] border-t border-[#E5E7EB] bg-white">
        <p className="text-[11px]">
          © 2024 Bali Camping Adventure Depot System. Hak Cipta Dilindungi. Dibuat untuk Efisiensi Rental Outdoor & Logistik Alam Bebas.
        </p>
      </footer>

      {/* Forgot Password / Info Modal */}
      {infoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E5E7EB] animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2.5 mb-3 text-[#1B4332]">
              <KeyRound className="w-5 h-5" />
              <h3 className="text-sm font-bold text-[#111827]">Informasi Akun Administrator</h3>
            </div>
            <p className="text-xs text-[#4B5563] leading-relaxed mb-4">
              Akses sistem operasional depot menggunakan satu akun Administrator resmi.
            </p>
            <div className="p-3 bg-[#F8FAF9] rounded-xl border border-[#E5E7EB] text-xs space-y-1.5 mb-4">
              <p className="font-semibold text-[#111827]">Kredensial Administrator:</p>
              <div className="font-mono text-[11px] text-[#2D6A4F] space-y-0.5">
                <p>• Email: <strong className="text-[#111827]">admin@balicamping.id</strong></p>
                <p>• Password: <strong className="text-[#111827]">admin123</strong></p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setInfoModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#1B4332] text-white text-xs font-bold hover:bg-[#245842] cursor-pointer"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
