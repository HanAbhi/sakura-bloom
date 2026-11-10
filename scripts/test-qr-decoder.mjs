import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';

const targetUrl = 'https://njcsb-ocha-party.netlify.app';

console.log('Testing QR Code generation and decoding for:', targetUrl);

// 1. Generate QR Code as PNG buffer using qrcode npm package
const pngBuffer = await QRCode.toBuffer(targetUrl, {
  errorCorrectionLevel: 'M',
  width: 512,
  margin: 4,
  color: {
    dark: '#000000',
    light: '#FFFFFF',
  },
});

console.log('Generated PNG buffer size:', pngBuffer.length, 'bytes');

// 2. Parse PNG buffer to get raw RGBA pixel data
const png = PNG.sync.read(pngBuffer);
console.log(`Parsed image: ${png.width}x${png.height} pixels`);

// 3. Decode QR code with jsQR
const code = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);

if (!code) {
  console.error('FAIL: jsQR could not decode the generated QR code!');
  process.exit(1);
}

console.log('Decoded text from QR code:', code.data);

if (code.data === targetUrl) {
  console.log('SUCCESS: Decoded URL exactly matches the target URL!');
  process.exit(0);
} else {
  console.error(`FAIL: Decoded URL "${code.data}" does not match "${targetUrl}"`);
  process.exit(1);
}

