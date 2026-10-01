import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  CalendarPlus, 
  RefreshCw, 
  BarChart2, 
  Warehouse, 
  Wrench,
  ChevronRight,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { ViewTab, AdminUser } from '../types';
import { BaliCampingBadge, AppLogoIcon } from './AppLogo';

interface SidebarProps {
  currentTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  overdueCount?: number;
  totalItemsCount?: number;
  availableItemsCount?: number;
  maintenanceItemsCount?: number;
  currentAdmin?: AdminUser | null;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  overdueCount = 0,
  totalItemsCount = 0,
  availableItemsCount = 0,
  maintenanceItemsCount = 0,
  currentAdmin,
  onLogout,
}) => {
  const menuItems: {
    id: ViewTab;
    label: string;
    icon: React.ElementType;
    badge?: string;
    badgeColor?: 'neutral' | 'red';
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard Progress',
      icon: LayoutDashboard,
    },
    {
      id: 'inventaris',
      label: 'Inventaris & Katalog',
      icon: Package,
      badge: totalItemsCount > 0 ? `${totalItemsCount} Item` : undefined,
      badgeColor: 'neutral',
    },
    {
      id: 'sewa-baru',
      label: 'Sewa Baru (Input)',
      icon: CalendarPlus,
    },
    {
      id: 'pengembalian',
      label: 'Log & Pengembalian',
      icon: RefreshCw,
    },
    {
      id: 'laporan',
      label: 'Laporan & Finansial',
      icon: BarChart2,
    },
  ];

  const rentedCount = Math.max(0, totalItemsCount - availableItemsCount - maintenanceItemsCount);
  const rentedPercentage = totalItemsCount > 0 
    ? Math.round((rentedCount / totalItemsCount) * 100)
    : 0;
  const availablePercentage = totalItemsCount > 0
    ? Math.round((availableItemsCount / totalItemsCount) * 100)
    : 0;
  const maintenancePercentage = totalItemsCount > 0
    ? Math.round((maintenanceItemsCount / totalItemsCount) * 100)
    : 0;

  return (
    <aside 
      id="sidebar-navigation" 
      className="w-64 bg-white border-r border-[#E5E7EB] flex flex-col justify-between shrink-0 min-h-screen select-none"
    >
      <div>
        {/* Brand Header */}
        <div className="p-4 border-b border-[#F3F4F6] flex items-center gap-3">
          <BaliCampingBadge className="w-10 h-10 ring-2 ring-[#1B4332]/10" />
          <div className="min-w-0">
            <h1 className="text-[13px] font-bold text-[#111827] leading-tight truncate tracking-tight">
              Bali Camping Adventure
            </h1>
            <p className="text-[10px] font-semibold text-[#6B7280] tracking-wider uppercase">
              Outdoor Gear & Rental Ops
            </p>
          </div>
        </div>

        {/* Section Title */}
        <div className="px-5 pt-5 pb-2">
          <p className="text-[10.5px] font-bold tracking-wider text-[#9CA3AF] uppercase">
            OPERASIONAL BALI CAMPING ADVENTURE
          </p>
        </div>

        {/* Navigation List */}
        <nav className="px-3 space-y-1" aria-label="Operasional Navigation">
          {menuItems.map((item) => {
            const isActive = currentTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group ${
                  isActive
                    ? 'bg-[#1B4332] text-white shadow-xs font-semibold'
                    : 'text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon 
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-[#6B7280] group-hover:text-[#1B4332]'
                    }`} 
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      item.badgeColor === 'red'
                        ? isActive 
                          ? 'bg-rose-500/30 text-rose-100 border border-rose-400/40' 
                          : 'bg-[#FEF2F2] text-[#DC2626] border border-[#FEE2E2]'
                        : isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-[#F3F4F6] text-[#6B7280]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status Card */}
      <div className="p-3.5 m-3 rounded-xl bg-[#F8FAF9] border border-[#E5E7EB]">
        <div className="flex items-center justify-between text-[11px] font-bold text-[#6B7280] tracking-wider uppercase mb-2">
          <span>Status Gudang Hari Ini</span>
          <Warehouse className="w-3.5 h-3.5 text-[#6B7280]" />
        </div>

        <div className="flex items-baseline justify-between mb-2">
          <span className="text-lg font-bold text-[#111827] tnum">
            {availableItemsCount}/{totalItemsCount}
          </span>
          <span className="text-[11px] font-semibold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-md">
            Tersedia
          </span>
        </div>

        {/* Two-tone Progress Bar */}
        <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full overflow-hidden flex mb-2.5">
          {totalItemsCount > 0 ? (
            <>
              <div 
                className="bg-[#10B981] h-full transition-all duration-500" 
                style={{ width: `${availablePercentage}%` }} 
                title="Tersedia"
              />
              <div 
                className="bg-[#F59E0B] h-full transition-all duration-500" 
                style={{ width: `${rentedPercentage}%` }} 
                title="Disewa"
              />
              <div 
                className="bg-[#EF4444] h-full transition-all duration-500" 
                style={{ width: `${maintenancePercentage}%` }} 
                title="Perlu Servis"
              />
            </>
          ) : (
            <div className="bg-[#E5E7EB] h-full w-full" />
          )}
        </div>

        <div className="flex items-center justify-between text-[11.5px] text-[#4B5563]">
          <span className="flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span>
            {rentedPercentage}% disewa
          </span>
          <span className="flex items-center gap-1 text-[#DC2626] font-medium">
            <Wrench className="w-3 h-3" />
            {maintenanceItemsCount} Perlu Servis
          </span>
        </div>
      </div>

      {/* Admin User Card in Sidebar */}
      {currentAdmin && (
        <div className="px-3 pb-3">
          <div className="p-2.5 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={currentAdmin.avatar}
                alt={currentAdmin.name}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover border border-[#D1D5DB] shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#111827] truncate">
                  {currentAdmin.name}
                </p>
                <p className="text-[10px] text-[#6B7280] truncate">
                  {currentAdmin.role.split(' ')[0]} • {currentAdmin.gate}
                </p>
              </div>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                title="Keluar Sesi Admin"
                className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};
