import { useState, useEffect } from 'react';

/**
 * Zona Waktu Acuan: Waktu Indonesia Tengah (WITA / GMT+8)
 * Sesuai lokasi operasional depot Bali Camping Adventure di Denpasar/Sanur, Bali.
 */
export const TIMEZONE_WITA = 'Asia/Makassar';

/**
 * Mendapatkan tanggal hari ini dalam format YYYY-MM-DD sesuai zona WITA
 */
export function getTodayWITAYMD(): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: TIMEZONE_WITA,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date());
  } catch (e) {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }
}

/**
 * Mendapatkan jam saat ini dalam format HH:mm sesuai zona WITA
 */
export function getCurrentWITATimeHM(): string {
  try {
    const formatter = new Intl.DateTimeFormat('id-ID', {
      timeZone: TIMEZONE_WITA,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return formatter.format(new Date()).replace('.', ':');
  } catch (e) {
    return '10:00';
  }
}

/**
 * Format live WITA string lengkap untuk header dan monitoring real-time
 */
export function formatWITALiveString(date: Date = new Date()) {
  try {
    const dayDate = new Intl.DateTimeFormat('id-ID', {
      timeZone: TIMEZONE_WITA,
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);

    const timeWithSec = new Intl.DateTimeFormat('id-ID', {
      timeZone: TIMEZONE_WITA,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date).replace(/\./g, ':');

    return {
      dayDate,
      timeWithSec: `${timeWithSec} WITA`,
      fullDisplay: `${dayDate} • ${timeWithSec} WITA (GMT+8)`,
    };
  } catch (e) {
    return {
      dayDate: 'Hari Ini',
      timeWithSec: '00:00:00 WITA',
      fullDisplay: 'Real-time WITA (GMT+8)',
    };
  }
}

/**
 * Format tanggal dan waktu untuk riwayat transaksi / bukti sewa dalam WITA
 */
export function formatWITADateTime(date: Date | string | number): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (!d || isNaN(d.getTime())) return '-';
  try {
    const formatted = new Intl.DateTimeFormat('id-ID', {
      timeZone: TIMEZONE_WITA,
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d).replace(/\./g, ':');
    return `${formatted} WITA`;
  } catch (e) {
    return `${d.toLocaleDateString('id-ID')} WITA`;
  }
}

/**
 * Format tanggal formal bahasa Indonesia dalam WITA (e.g. "16 September 2026")
 */
export function formatWITADate(date: Date | string | number): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (!d || isNaN(d.getTime())) return '-';
  try {
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: TIMEZONE_WITA,
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch (e) {
    return d.toLocaleDateString('id-ID');
  }
}

/**
 * Menambahkan sejumlah hari ke string tanggal 'YYYY-MM-DD'
 */
export function addDaysToYMD(ymdStr: string, days: number): string {
  if (!ymdStr) return getTodayWITAYMD();
  const parts = ymdStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return ymdStr;
  const [year, month, day] = parts;
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Menghitung selisih durasi hari antara Tanggal Ambil dan Tanggal Kembali
 * Contoh: 16 Sep s.d 18 Sep dihitung 3 hari (16, 17, 18)
 */
export function calculateDurationDays(startYMD: string, endYMD: string): number {
  if (!startYMD || !endYMD) return 1;
  const pStart = startYMD.split('-').map(Number);
  const pEnd = endYMD.split('-').map(Number);
  if (pStart.length !== 3 || pEnd.length !== 3) return 1;
  const d1 = Date.UTC(pStart[0], pStart[1] - 1, pStart[2]);
  const d2 = Date.UTC(pEnd[0], pEnd[1] - 1, pEnd[2]);
  const diffDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays + 1);
}

/**
 * Hook React untuk detak jam real-time WITA (GMT+8) setiap detik
 */
export function useLiveWITAClock() {
  const [liveTime, setLiveTime] = useState(() => formatWITALiveString(new Date()));

  useEffect(() => {
    // Update every second
    const timer = setInterval(() => {
      setLiveTime(formatWITALiveString(new Date()));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return liveTime;
}
