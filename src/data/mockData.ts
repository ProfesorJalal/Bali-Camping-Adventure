import { InventoryItem, RentalTransaction, ReturnVerificationState, AdminUser } from '../types';

/**
 * INITIAL_INVENTORY is initialized as empty so that the admin
 * can input items manually from the "Inventaris" menu.
 */
export const INITIAL_INVENTORY: InventoryItem[] = [];

/**
 * INITIAL_TRANSACTIONS is initialized as empty so that the admin
 * can create rental transactions from "Sewa Baru".
 */
export const INITIAL_TRANSACTIONS: RentalTransaction[] = [];

/**
 * Empty inspection state.
 */
export const INITIAL_INSPECTION_STATE: ReturnVerificationState | null = null;

/**
 * Authorized single Administrator profile for depot system access.
 * Only one admin account is maintained, without any dummy staff accounts.
 */
export const DEFAULT_ADMIN_USERS: AdminUser[] = [
  {
    id: 'adm-admin',
    name: 'Administrator',
    email: 'admin@balicamping.id',
    role: 'Super Admin',
    gate: 'Bali Camping Adventure',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
    phone: '0812-3456-7890',
  },
];
