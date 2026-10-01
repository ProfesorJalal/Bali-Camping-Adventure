import React, { useState } from 'react';
import { 
  Search, 
  Clock, 
  Bell, 
  Plus, 
  ChevronDown, 
  AlertTriangle, 
  CheckCircle, 
  User, 
  LogOut, 
  ShieldCheck, 
  Calendar 
} from 'lucide-react';
import { AdminUser } from '../types';
import { useLiveWITAClock } from '../utils/timeZone';

interface HeaderProps {
  onQuickRentClick: () => void;
  onSearchQuery?: (q: string) => void;
  currentAdmin?: AdminUser | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onQuickRentClick, 
  onSearchQuery,
  currentAdmin,
  onLogout,
}) => {
  const liveWITA = useLiveWITAClock();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const [notifications, setNotifications] = useState<
    Array<{ id: string; title: string; desc: string; time: string; type: string }>
  >([]);

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    if (onSearchQuery) {
      onSearchQuery(e.target.value);
    }
  };

  return (
    <header 
      id="top-application-header" 
      className="h-16 bg-white border-b border-[#E5E7EB] px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs"
    >
      {/* Left: Quick Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="global-search-input"
            type="text"
            value={searchVal}
            onChange={handleSearchChange}
            placeholder="Cari kode barang, SKU, transaksi..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3.5">
        {/* Real-time Live WITA Clock Badge */}
        <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#F8FAF9] border border-[#E5E7EB] text-xs text-[#374151] font-medium shadow-2xs">
          <div className="flex items-center gap-1.5 text-[#059669]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Live WITA (GMT+8)</span>
          </div>
          <span className="w-px h-3.5 bg-[#D1D5DB]"></span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#1B4332]" />
            <span className="text-[#111827] font-semibold">{liveWITA.dayDate}</span>
            <span className="w-1 h-1 rounded-full bg-[#9CA3AF]"></span>
            <span className="font-mono font-bold text-[#1B4332] tnum">{liveWITA.timeWithSec}</span>
          </div>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            id="btn-notifications-toggle"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-[#4B5563] hover:bg-[#F3F4F6] transition-colors focus:outline-none cursor-pointer"
            aria-label="Notifikasi Operasional"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#EF4444] text-[9.5px] font-bold text-white flex items-center justify-center border-2 border-white">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div 
              id="notifications-popover" 
              className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-[#E5E7EB] py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
            >
              <div className="px-4 py-2 border-b border-[#F3F4F6] flex items-center justify-between">
                <span className="text-xs font-bold text-[#111827]">Pemberitahuan Lapangan</span>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    notifications.length > 0
                      ? 'text-[#EF4444] bg-[#FEE2E2]'
                      : 'text-[#059669] bg-[#ECFDF5]'
                  }`}>
                    {notifications.length > 0 ? `${notifications.length} Baru` : '0 Baru'}
                  </span>
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearNotifications}
                      className="text-[10px] text-[#6B7280] hover:text-[#111827] underline cursor-pointer"
                    >
                      Kosongkan
                    </button>
                  )}
                </div>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-[#F3F4F6]">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-3 hover:bg-[#F9FAFB] transition-colors">
                        <div className="flex items-start gap-2.5">
                          {n.type === 'alert' && <AlertTriangle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />}
                          {n.type === 'warning' && <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />}
                          {n.type === 'success' && <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-[#111827]">{n.title}</p>
                            <p className="text-[11px] text-[#6B7280] leading-snug">{n.desc}</p>
                            <span className="text-[10px] text-[#9CA3AF] mt-1 block">{n.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 px-4 text-center">
                    <div className="w-9 h-9 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center mx-auto mb-2 border border-[#A7F3D0]">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-bold text-[#111827]">Tidak Ada Pemberitahuan</p>
                    <p className="text-[11px] text-[#6B7280] mt-0.5 max-w-xs mx-auto leading-relaxed">
                      Kotak masuk bersih. Belum ada peringatan mendesak atau keterlambatan pengembalian alat baru.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* CTA: + + Sewa Cepat */}
        <button
          id="btn-quick-rental-trigger"
          onClick={onQuickRentClick}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Sewa Cepat</span>
        </button>

        {/* Staff Profile Badge */}
        <div className="relative">
          <button
            id="btn-user-profile-menu"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 pl-2 pr-1.5 py-1 rounded-lg hover:bg-[#F3F4F6] transition-colors text-left cursor-pointer"
          >
            <img
              src={currentAdmin?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"}
              alt={currentAdmin?.name || "Administrator"}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover border border-[#D1D5DB]"
            />
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-[#111827] leading-none">
                {currentAdmin?.name || "Administrator"}
              </p>
              <p className="text-[10.5px] text-[#6B7280] leading-tight mt-0.5">
                {currentAdmin?.role || "Super Admin & Logistik"}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF]" />
          </button>

          {showProfileMenu && (
            <div 
              id="profile-dropdown-menu"
              className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-lg border border-[#E5E7EB] py-1 z-50 animate-in fade-in zoom-in-95"
            >
              <div className="px-4 py-2.5 border-b border-[#F3F4F6]">
                <p className="text-xs font-bold text-[#111827]">{currentAdmin?.name || "Administrator"}</p>
                <p className="text-[11px] text-[#6B7280]">{currentAdmin?.email || "admin@balicamping.id"}</p>
                <div className="mt-1.5 flex items-center gap-1.5 text-[10.5px] text-[#059669] font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Bali Camping Adventure</span>
                </div>
              </div>
              <div className="px-4 py-2 text-[10.5px] text-[#6B7280] bg-[#F8FAF9] border-b border-[#F3F4F6]">
                <span className="font-semibold text-[#111827]">Zona Waktu: </span>
                <span>WITA (GMT+8) • Real-time 24 Jam</span>
              </div>
              <button 
                onClick={() => {
                  setShowProfileMenu(false);
                  alert(`Info Akun Staf:\nNama: ${currentAdmin?.name}\nEmail: ${currentAdmin?.email}\nRole: ${currentAdmin?.role}\nGate: ${currentAdmin?.gate}`);
                }}
                className="w-full px-4 py-2 text-left text-xs text-[#374151] hover:bg-[#F3F4F6] flex items-center gap-2 cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-[#6B7280]" /> Profil Pengguna
              </button>
              <div className="border-t border-[#F3F4F6] my-1"></div>
              <button 
                id="btn-admin-logout"
                onClick={() => {
                  setShowProfileMenu(false);
                  if (onLogout) onLogout();
                }}
                className="w-full px-4 py-2 text-left text-xs text-[#DC2626] hover:bg-[#FEF2F2] flex items-center gap-2 font-semibold cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-[#DC2626]" /> Keluar Sesi Admin
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
