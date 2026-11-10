import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';

const DEFAULT_QR_URL = 'https://njcsb-ocha-party.netlify.app';

async function generateQRTest(text) {
  const cleanText = text.trim() || DEFAULT_QR_URL;
  const qr = QRCode.create(cleanText, { errorCorrectionLevel: 'M' });
  const dataURL = await QRCode.toDataURL(cleanText, {
    width: 1024,
    margin: 3,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#1D1217',
      light: '#FFFFFF',
    },
  });

  return {
    size: qr.modules.size,
    dataURL,
    text: cleanText,
  };
}

console.log('--- STARTING SAKURA QR VERIFICATION SUITE ---');

async function testDecodeDataUrl(urlToTest, testLabel) {
  console.log(`\n[${testLabel}] Generating QR for: "${urlToTest || '(default)'}"`);
  const qrData = await generateQRTest(urlToTest);

  // Extract base64 image data from dataURL
  const base64Data = qrData.dataURL.replace(/^data:image\/png;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');

  // Parse PNG image
  const png = PNG.sync.read(buffer);

  // Decode with jsQR
  const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);

  if (!decoded) {
    throw new Error(`Failed to decode QR code for test: ${testLabel}`);
  }

  const expectedUrl = urlToTest || DEFAULT_QR_URL;
  console.log(`  Decoded content: "${decoded.data}"`);

  if (decoded.data !== expectedUrl) {
    throw new Error(`Mismatch! Expected "${expectedUrl}", but got "${decoded.data}"`);
  }

  console.log(`  ✓ SUCCESS: Decoded URL exactly matches "${expectedUrl}"!`);
  console.log(`  QR Matrix size: ${qrData.size}x${qrData.size} modules (${qrData.size * qrData.size} total cells)`);
}

async function run() {
  try {
    // Test 1: Exact target URL
    await testDecodeDataUrl('https://njcsb-ocha-party.netlify.app', 'TEST 1: Exact Ocha Party Destination');

    // Test 2: Default fallback (empty string)
    await testDecodeDataUrl('', 'TEST 2: Default Fallback URL');

    // Test 3: Editable URL capability
    await testDecodeDataUrl('https://njcsb-ocha-party.netlify.app/event', 'TEST 3: Editable Custom URL');

    console.log('\n========================================');
    console.log('ALL QR CODE VERIFICATION TESTS PASSED!');
    console.log('========================================');
  } catch (err) {
    console.error('\nTEST FAILED:', err);
    process.exit(1);
  }
}

run();
