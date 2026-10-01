import QRCode from 'qrcode';

/**
 * CRC16-CCITT calculation for EMVCo / QRIS standard
 */
export function calculateCrc16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  let hex = crc.toString(16).toUpperCase();
  while (hex.length < 4) hex = '0' + hex;
  return hex;
}

function formatTLV(tag: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${tag}${len}${value}`;
}

/**
 * Generate standard QRIS string matching Bali Camping Adventure specification
 * NMID: ID1026527493195
 * Acquirer: 93600914
 * Terminal: A01
 */
export function generateQrisString(amount: number): string {
  const cleanAmount = Math.max(0, Math.round(amount));
  
  // Tag 26: Merchant Account Information (QRIS)
  const tag26Sub = 
    formatTLV('00', 'ID.CO.QRIS.WWW') +
    formatTLV('01', '936009140000000000') +
    formatTLV('02', 'ID1026527493195') +
    formatTLV('03', 'UMI');
  
  // Tag 51: Domestic Merchant Account
  const tag51Sub = 
    formatTLV('00', 'ID.CO.QRIS.WWW') +
    formatTLV('02', 'ID1026527493195') +
    formatTLV('03', 'UMI');

  // Tag 62: Additional Data Field (Terminal ID)
  const tag62Sub = formatTLV('07', 'A01');

  // Payload without CRC
  let rawPayload = 
    formatTLV('00', '01') + // Format Indicator
    formatTLV('01', cleanAmount > 0 ? '12' : '11') + // 12 = Dynamic (with preset amount), 11 = Static
    formatTLV('26', tag26Sub) +
    formatTLV('51', tag51Sub) +
    formatTLV('52', '5812') + // Merchant Category Code
    formatTLV('53', '360'); // IDR Currency

  if (cleanAmount > 0) {
    rawPayload += formatTLV('54', cleanAmount.toString());
  }

  rawPayload += 
    formatTLV('58', 'ID') + // Country Code
    formatTLV('59', 'BALI CAMPING ADVENTURE') + // Merchant Name
    formatTLV('60', 'DENPASAR') + // Merchant City
    formatTLV('61', '80237') + // Postal Code
    formatTLV('62', tag62Sub) +
    '6304'; // CRC Tag with 4 characters length

  const crc = calculateCrc16(rawPayload);
  return rawPayload + crc;
}

/**
 * Generate QR Code data URL asynchronously
 */
export async function generateQrisDataUrl(amount: number): Promise<string> {
  const qrisString = generateQrisString(amount);
  return await QRCode.toDataURL(qrisString, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 480,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  });
}
