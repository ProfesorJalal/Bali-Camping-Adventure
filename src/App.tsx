import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/views/DashboardView';
import { InventarisView } from './components/views/InventarisView';
import { SewaBaruView } from './components/views/SewaBaruView';
import { PengembalianView } from './components/views/PengembalianView';
import { LaporanView } from './components/views/LaporanView';
import { RentalAgreementModal } from './components/modals/RentalAgreementModal';
import { ReturnReceiptModal } from './components/modals/ReturnReceiptModal';
import { BarcodeModal } from './components/modals/BarcodeModal';
import { ItemFormModal } from './components/modals/ItemFormModal';
import { INITIAL_INVENTORY, INITIAL_TRANSACTIONS } from './data/mockData';
import { InventoryItem, RentalTransaction, ViewTab, AdminUser } from './types';
import { Menu, X, Lock } from 'lucide-react';
import { supabase } from './supabaseClient';

export default function App() {
  // State Autentikasi Supabase
  const [session, setSession] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // 1. Cek Sesi Login Supabase saat Pertama Kali App Dimuat
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoadingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handler Login Supabase
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoginError('Akses Ditolak: Email atau password salah!');
    } else {
      setSession(data.session);
    }
  };

  // Handler Logout Supabase
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  // State Aplikasi Utama
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('bali_camping_inventory_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((item: InventoryItem) => ({
            ...item,
            dailyRate: Math.max(1000, Math.round((Number(item.dailyRate) || 1000) / 1000) * 1000),
            deposit: Math.max(0, Math.round((Number(item.deposit) || 0) / 1000) * 1000),
          }));
        }
      }
    } catch (e) {
      console.error('Failed to parse inventory', e);
    }
    return INITIAL_INVENTORY;
  });

  const [transactions, setTransactions] = useState<RentalTransaction[]>(() => {
    try {
      localStorage.removeItem('bali_camping_transactions_v2');
      localStorage.removeItem('bali_camping_transactions');
      const saved = localStorage.getItem('bali_camping_transactions_v3');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse transactions', e);
    }
    return INITIAL_TRANSACTIONS;
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bali_camping_inventory_v2', JSON.stringify(inventory));
    } catch (e) {
      console.error(e);
    }
  }, [inventory]);

  useEffect(() => {
    try {
      localStorage.setItem('bali_camping_transactions_v3', JSON.stringify(transactions));
    } catch (e) {
      console.error(e);
    }
  }, [transactions]);

  // Modal States
  const [rentalContractData, setRentalContractData] = useState<any>(null);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [returnReceiptData, setReturnReceiptData] = useState<any>(null);
  const [isReturnReceiptOpen, setIsReturnReceiptOpen] = useState(false);
  const [barcodeModalItem, setBarcodeModalItem] = useState<InventoryItem | null>(null);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isItemFormModalOpen, setIsItemFormModalOpen] = useState(false);

  // Handlers
  const handlePrintRentalContract = (data: any) => {
    setRentalContractData(data);
    setIsContractModalOpen(true);
  };

  const handleCompleteRentalTransaction = (data: any) => {
    if (data && data.bookingId) {
      const newTrx: RentalTransaction = {
        id: data.bookingId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerKtp: data.customerKtp,
        idTypeHeld: data.guaranteeType,
        destination: data.destination,
        pickupDate: data.pickupDate,
        pickupTime: data.pickupTime || '09:00 WITA',
        returnDate: data.returnDate,
        returnTime: data.returnTime || '18:00 WITA',
        durationDays: data.durationDays,
        items: data.items.map((i: any) => ({
          itemSku: i.item.sku,
          itemName: i.item.name,
          category: i.item.category,
          quantity: i.quantity,
          unitPrice: i.pricePerDay,
          unitDeposit: i.item.deposit || 0,
          imageUrl: i.item.imageUrl,
        })),
        subtotal: data.subtotalSewa,
        discount: data.discountAmount,
        depositPaid: data.refundableDeposit,
        totalPaid: data.totalPayment,
        paymentMethod: data.paymentMethod,
        status: 'Aktif',
        dispatchOfficer: session?.user?.email || 'Administrator',
        createdAt: data.createdAt || new Date().toISOString(),
      };

      setTransactions(prev => {
        const exists = prev.some(t => t.id === newTrx.id);
        if (exists) return prev;
        return [newTrx, ...prev];
      });

      setInventory(prev => prev.map(item => {
        const matched = data.items.find((i: any) => i.item.id === item.id);
        if (matched) {
          const rentedCount = matched.quantity;
          return {
            ...item,
            availableUnits: Math.max(0, item.availableUnits - rentedCount),
            rentedUnits: (item.rentedUnits || 0) + rentedCount,
          };
        }
        return item;
      }));

      setIsContractModalOpen(false);
      setCurrentTab('laporan');
    }
  };

  const handleCompleteReturn = (summary: any) => {
    setReturnReceiptData(summary);
    setIsReturnReceiptOpen(true);

    if (summary && summary.trxId) {
      const trx = transactions.find(t => t.id === summary.trxId);
      if (trx) {
        setInventory(prev => prev.map(item => {
          const matched = trx.items.find(i => i.itemSku === item.sku);
          if (matched) {
            return {
              ...item,
              availableUnits: item.availableUnits + matched.quantity,
              rentedUnits: Math.max(0, item.rentedUnits - matched.quantity),
            };
          }
          return item;
        }));
      }

      setTransactions(prev =>
        prev.map(t => (t.id === summary.trxId ? { ...t, status: 'Selesai' } : t))
      );
    }
  };

  const handleOpenBarcodeModal = (item?: InventoryItem) => {
    setBarcodeModalItem(item || null);
    setIsBarcodeModalOpen(true);
  };

  const handleOpenAddItem = () => {
    setEditingItem(null);
    setIsItemFormModalOpen(true);
  };

  const handleOpenEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setIsItemFormModalOpen(true);
  };

  const handleDeleteInventoryItem = (id: string) => {
    setInventory(prev => prev.filter(item => item.id !== id));
  };

  const handleSaveInventoryItem = (savedItem: Partial<InventoryItem>) => {
    const cleanDailyRate = Math.max(1000, Math.round((Number(savedItem.dailyRate) || 25000) / 1000) * 1000);
    const cleanDeposit = Math.max(0, Math.round((Number(savedItem.deposit) || 0) / 1000) * 1000);

    if (editingItem) {
      setInventory(prev =>
        prev.map(i => (i.id === editingItem.id ? ({ 
          ...i, 
          ...savedItem,
          dailyRate: cleanDailyRate,
          deposit: cleanDeposit,
        } as InventoryItem) : i))
      );
    } else {
      const newItem: InventoryItem = {
        id: `inv-${Date.now()}`,
        sku: savedItem.sku || `SKU-${Date.now().toString().slice(-4)}`,
        barcode: savedItem.barcode || `BAR-${Math.floor(100000 + Math.random() * 900000)}`,
        name: savedItem.name || 'Barang Baru',
        category: savedItem.category || 'Tenda & Shelter',
        tags: savedItem.tags || [],
        imageUrl: savedItem.imageUrl || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=300&q=80',
        totalUnits: Number(savedItem.totalUnits) || 1,
        availableUnits: Number(savedItem.totalUnits) || 1,
        rentedUnits: 0,
        maintenanceUnits: 0,
        condition: savedItem.condition || 'Bagus (Siap Pakai)',
        dailyRate: cleanDailyRate,
        deposit: cleanDeposit,
        locationRack: savedItem.locationRack || 'Rak A1',
      };
      setInventory(prev => [newItem, ...prev]);
    }
  };

  const handleProcessReturnDirectly = (trxId: string) => {
    setCurrentTab('pengembalian');
  };

  // Tampilan Loading Memeriksa Sesi Login
  if (loadingAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F4F5F7]">
        <p className="text-gray-600 font-medium">Memuat sistem autentikasi...</p>
      </div>
    );
  }

  // Tampilan Form Login (Jika User Belum Login di Supabase)
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1B4332] px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <div className="inline-flex p-3 bg-[#1B4332]/10 rounded-full mb-3">
              <Lock className="w-8 h-8 text-[#1B4332]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Portal Operasional</h2>
            <p className="text-sm text-gray-500 mt-1">Bali Camping Adventure</p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center font-medium">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B4332] focus:outline-none"
                placeholder="nama@balicamping.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B4332] focus:outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-semibold rounded-lg shadow transition duration-200"
            >
              Masuk ke Sistem
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Tampilan Utama Dashboard Operasional (Hanya Muncul Jika Sudah Login)
  const currentAdminObj: AdminUser = {
    id: session.user.id,
    name: session.user.email?.split('@')[0] || 'Admin',
    email: session.user.email || '',
    role: 'Super Admin',
  };

  const totalPhysicalUnits = inventory.reduce((sum, item) => sum + (item.totalUnits || 0), 0);
  const availablePhysicalUnits = inventory.reduce((sum, item) => sum + (item.availableUnits || 0), 0);
  const maintenancePhysicalUnits = inventory.reduce((sum, item) => sum + (item.maintenanceUnits || 0), 0);
  const overdueCount = transactions.filter(t => t.status === 'Overdue' || t.status === 'Terlambat').length;

  return (
    <div className="flex h-screen bg-[#F4F5F7] text-[#1F2937] font-sans antialiased overflow-hidden selection:bg-[#1B4332] selection:text-white">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <div className={`fixed inset-y-0 left-0 z-50 transform md:relative md:translate-x-0 transition-transform duration-200 ease-in-out ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar
          currentTab={currentTab}
          onTabChange={(tab) => {
            setCurrentTab(tab);
            setMobileMenuOpen(false);
          }}
          overdueCount={overdueCount}
          totalItemsCount={totalPhysicalUnits}
          availableItemsCount={availablePhysicalUnits}
          maintenanceItemsCount={maintenancePhysicalUnits}
          currentAdmin={currentAdminObj}
          onLogout={handleLogout}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-3 text-[#4B5563] hover:text-[#111827] bg-white border-b border-[#E5E7EB]"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex-1 min-w-0">
            <Header
              onQuickRentClick={() => setCurrentTab('sewa-baru')}
              onSearchQuery={(q) => {
                if (q && currentTab !== 'inventaris') {
                  setCurrentTab('inventaris');
                }
              }}
              currentAdmin={currentAdminObj}
              onLogout={handleLogout}
            />
          </div>
        </div>

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'dashboard' && (
              <DashboardView
                inventory={inventory}
                transactions={transactions}
                onNavigate={(tab) => setCurrentTab(tab)}
                onOpenQuickRent={() => setCurrentTab('sewa-baru')}
                onProcessReturn={handleProcessReturnDirectly}
              />
            )}

            {currentTab === 'inventaris' && (
              <InventarisView
                inventory={inventory}
                onOpenAddItem={handleOpenAddItem}
                onOpenBarcodeModal={handleOpenBarcodeModal}
                onOpenEditItem={handleOpenEditItem}
                onDeleteItem={handleDeleteInventoryItem}
              />
            )}

            {currentTab === 'sewa-baru' && (
              <SewaBaruView
                inventory={inventory}
                onPrintRentalContract={handlePrintRentalContract}
                onCompleteTransaction={handleCompleteRentalTransaction}
              />
            )}

            {currentTab === 'pengembalian' && (
              <PengembalianView
                transactions={transactions}
                onCompleteReturn={handleCompleteReturn}
                onOpenBarcodeScanner={() => alert("Mengaktifkan modul Barcode Scanner kamera depot...")}
                onNavigateToSewa={() => setCurrentTab('sewa-baru')}
              />
            )}

            {currentTab === 'laporan' && (
              <LaporanView 
                inventory={inventory}
                transactions={transactions}
              />
            )}
          </div>
        </main>
      </div>

      {/* Modals Container */}
      <RentalAgreementModal
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        data={rentalContractData}
        onCompleteTransaction={handleCompleteRentalTransaction}
      />

      <ReturnReceiptModal
        isOpen={isReturnReceiptOpen}
        onClose={() => setIsReturnReceiptOpen(false)}
        summary={returnReceiptData}
      />

      <BarcodeModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        item={barcodeModalItem}
        allItems={inventory}
      />

      <ItemFormModal
        isOpen={isItemFormModalOpen}
        onClose={() => setIsItemFormModalOpen(false)}
        onSave={handleSaveInventoryItem}
        initialItem={editingItem}
      />
    </div>
  );
}