import QRCode from 'qrcode';

export interface QRData {
  size: number;
  matrix: boolean[][];
  dataURL: string;
}

export const DEFAULT_QR_URL = 'https://njcsb-ocha-party.netlify.app';

/**
 * Checks if a given row/col coordinate belongs to one of the 3 finder patterns (corners)
 */
export function isFinderPattern(r: number, c: number, size: number): boolean {
  // Top-left
  if (r < 8 && c < 8) return true;
  // Top-right
  if (r < 8 && c >= size - 8) return true;
  // Bottom-left
  if (r >= size - 8 && c < 8) return true;
  return false;
}

/**
 * Checks if a given row/col is in the central region where the seed/stem sprouts
 */
export function isCenterSeedZone(r: number, c: number, size: number): boolean {
  const mid = Math.floor(size / 2);
  const radius = 1; // 3x3 small central seed zone
  return Math.abs(r - mid) <= radius && Math.abs(c - mid) <= radius;
}

/**
 * Generates a full QR matrix representation from a URL or text
 */
export async function generateQR(text: string): Promise<QRData> {
  const cleanText = text.trim() || DEFAULT_QR_URL;
  
  // Use QRCode.create with error correction 'M' (15%) or 'Q' (25%) for optimal scanning
  const qr = QRCode.create(cleanText, {
    errorCorrectionLevel: 'M',
  });

  const size = qr.modules.size;
  const rawData = qr.modules.data;
  const matrix: boolean[][] = [];

  for (let r = 0; r < size; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < size; c++) {
      const bit = rawData[r * size + c];
      row.push(bit === 1);
    }
    matrix.push(row);
  }

  // Generate a crisp, high-contrast, phone-scannable QR data URL
  const dataURL = await QRCode.toDataURL(cleanText, {
    width: 1024,
    margin: 3,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#1D1217', // High-contrast deep Japanese charcoal plum
      light: '#FFFFFF', // Crisp white background for phone cameras
    },
  });

  return {
    size,
    matrix,
    dataURL,
  };
}
