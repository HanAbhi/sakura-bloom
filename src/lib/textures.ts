'use client';

import * as THREE from 'three';

/**
 * Procedural texture generator for botanical Yoshino cherry tree,
 * blossoms, petals, and Japanese garden materials.
 * Generates high-res textures entirely client-side without external asset dependencies.
 */

// 1. Realistic Cherry Bark Texture (Prunus yedoensis)
export function createBarkTextures(): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const width = 512;
  const height = 512;

  // Diffuse Canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Bump Canvas
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = width;
  bumpCanvas.height = height;
  const bCtx = bumpCanvas.getContext('2d')!;

  // Roughness Canvas
  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = width;
  roughCanvas.height = height;
  const rCtx = roughCanvas.getContext('2d')!;

  // Base dark umber bark color
  ctx.fillStyle = '#38251C';
  ctx.fillRect(0, 0, width, height);

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, width, height);

  rCtx.fillStyle = '#DCDCDC';
  rCtx.fillRect(0, 0, width, height);

  // Draw longitudinal vertical bark fissures and ridges
  for (let x = 0; x < width; x += 3) {
    const wave = Math.sin(x * 0.05) * 15;
    const depth = Math.random();

    // Dark grooves
    ctx.strokeStyle = depth > 0.6 ? '#22140E' : depth > 0.3 ? '#2D1B13' : '#463024';
    ctx.lineWidth = 1 + Math.random() * 2.5;
    ctx.beginPath();
    ctx.moveTo(x + wave, 0);
    ctx.bezierCurveTo(
      x + wave + (Math.random() - 0.5) * 20, height * 0.33,
      x + wave + (Math.random() - 0.5) * 20, height * 0.66,
      x + wave, height
    );
    ctx.stroke();

    // Bump ridge
    bCtx.strokeStyle = depth > 0.5 ? '#202020' : '#B0B0B0';
    bCtx.lineWidth = ctx.lineWidth;
    bCtx.beginPath();
    bCtx.moveTo(x + wave, 0);
    bCtx.bezierCurveTo(
      x + wave + (Math.random() - 0.5) * 20, height * 0.33,
      x + wave + (Math.random() - 0.5) * 20, height * 0.66,
      x + wave, height
    );
    bCtx.stroke();
  }

  // Draw horizontal lenticels (iconic botanical feature of Japanese cherry trees)
  for (let i = 0; i < 260; i++) {
    const lx = Math.random() * width;
    const ly = Math.random() * height;
    const lLen = 8 + Math.random() * 28;
    const lThick = 1.5 + Math.random() * 2;

    // Lenticel highlight (creamy grey-tan)
    ctx.fillStyle = 'rgba(145, 125, 110, 0.45)';
    ctx.fillRect(lx, ly, lLen, lThick);

    // Lenticel shadow
    ctx.fillStyle = 'rgba(25, 15, 10, 0.6)';
    ctx.fillRect(lx, ly + lThick, lLen, 1);

    // Bump lenticel
    bCtx.fillStyle = '#E0E0E0';
    bCtx.fillRect(lx, ly, lLen, lThick);
  }

  // Subtle moss & lichen dust (botanical patina)
  for (let i = 0; i < 350; i++) {
    const mx = Math.random() * width;
    const my = Math.random() * height;
    const mRad = 2 + Math.random() * 8;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(85, 98, 70, 0.28)' : 'rgba(115, 128, 95, 0.22)';
    ctx.beginPath();
    ctx.arc(mx, my, mRad, 0, Math.PI * 2);
    ctx.fill();
  }

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2, 6);

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(2, 6);

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(2, 6);

  return { map, bumpMap, roughnessMap };
}

// 2. Translucent Yoshino Blossom Petal Texture with Delicate Veins & Rose Claw
export function createBlossomPetalTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, size, size);

  // Heart-cleft petal path
  ctx.save();
  ctx.beginPath();
  const cx = size / 2;
  const baseY = size * 0.92;
  const tipY = size * 0.12;

  ctx.moveTo(cx, baseY);
  // Left side curve
  ctx.bezierCurveTo(size * 0.08, size * 0.75, size * 0.04, size * 0.35, size * 0.32, tipY);
  // Cleft notch at apex
  ctx.bezierCurveTo(size * 0.42, tipY + 12, size * 0.48, tipY + 18, cx, tipY + 22);
  ctx.bezierCurveTo(size * 0.52, tipY + 18, size * 0.58, tipY + 12, size * 0.68, tipY);
  // Right side curve
  ctx.bezierCurveTo(size * 0.96, size * 0.35, size * 0.92, size * 0.75, cx, baseY);
  ctx.closePath();
  ctx.clip();

  // Subtle radial gradient from rose claw to ivory white-pink tip
  const grad = ctx.createRadialGradient(cx, baseY, 8, cx, size * 0.4, size * 0.7);
  grad.addColorStop(0, '#B83252'); // Deep rose petal claw
  grad.addColorStop(0.2, '#E26D85'); // Warm blush
  grad.addColorStop(0.55, '#F9D8DF'); // Soft Yoshino pink
  grad.addColorStop(0.85, '#FFF2F5'); // Gossamer ivory pink
  grad.addColorStop(1.0, '#FFFFFF'); // Translucent edge

  ctx.fillStyle = grad;
  ctx.fill();

  // Delicate petal veining radiating from base
  ctx.strokeStyle = 'rgba(215, 110, 135, 0.16)';
  ctx.lineWidth = 1;

  for (let a = -0.55; a <= 0.55; a += 0.11) {
    ctx.beginPath();
    ctx.moveTo(cx, baseY);
    const endX = cx + Math.sin(a) * (size * 0.65);
    const endY = tipY + 25 + Math.abs(a) * 35;
    ctx.quadraticCurveTo(
      cx + Math.sin(a * 0.6) * (size * 0.35),
      size * 0.55,
      endX,
      endY
    );
    ctx.stroke();
  }

  // Soft rim luminescence
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return texture;
}

// 3. Flower Center Texture (Crimson Hypanthium & Golden Stamens)
export function createFlowerCenterTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const cx = size / 2;
  const cy = size / 2;

  // Deep wine-crimson central ring
  const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 55);
  grad.addColorStop(0, '#5C1426');
  grad.addColorStop(0.4, '#8E203B');
  grad.addColorStop(0.8, '#C44665');
  grad.addColorStop(1, 'rgba(235, 120, 145, 0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, 55, 0, Math.PI * 2);
  ctx.fill();

  // 20 delicate golden anther dots
  for (let i = 0; i < 22; i++) {
    const angle = (i * Math.PI * 2) / 22;
    const r = 24 + Math.random() * 18;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;

    // Filament line
    ctx.strokeStyle = 'rgba(245, 195, 175, 0.75)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.stroke();

    // Golden-yellow anther dot
    ctx.fillStyle = '#F5D061';
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  return new THREE.CanvasTexture(canvas);
}

// 4. Subtle Garden Stone & Raked Sand Texture
export function createStoneSandTextures(): {
  sandMap: THREE.CanvasTexture;
  stoneMap: THREE.CanvasTexture;
} {
  const size = 512;

  // Sand Canvas (Fine zen raked sand grain)
  const sandCanvas = document.createElement('canvas');
  sandCanvas.width = size;
  sandCanvas.height = size;
  const sCtx = sandCanvas.getContext('2d')!;

  sCtx.fillStyle = '#EFE9DF';
  sCtx.fillRect(0, 0, size, size);

  // Fine sand noise
  const imgData = sCtx.getImageData(0, 0, size, size);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 16;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  sCtx.putImageData(imgData, 0, 0);

  // Concentric raked ripples
  sCtx.strokeStyle = 'rgba(195, 185, 170, 0.4)';
  sCtx.lineWidth = 2.5;
  for (let r = 20; r < size; r += 16) {
    sCtx.beginPath();
    sCtx.arc(size / 2, size / 2, r, 0, Math.PI * 2);
    sCtx.stroke();
  }

  // Stone Canvas (Fine honed Japanese granite)
  const stoneCanvas = document.createElement('canvas');
  stoneCanvas.width = size;
  stoneCanvas.height = size;
  const stCtx = stoneCanvas.getContext('2d')!;

  stCtx.fillStyle = '#CFC8C0';
  stCtx.fillRect(0, 0, size, size);

  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const shade = Math.random();
    stCtx.fillStyle = shade > 0.6 ? 'rgba(80, 75, 70, 0.18)' : 'rgba(255, 255, 255, 0.22)';
    stCtx.fillRect(x, y, 1.5, 1.5);
  }

  const sandMap = new THREE.CanvasTexture(sandCanvas);
  sandMap.wrapS = THREE.RepeatWrapping;
  sandMap.wrapT = THREE.RepeatWrapping;
  sandMap.repeat.set(4, 4);

  const stoneMap = new THREE.CanvasTexture(stoneCanvas);
  stoneMap.wrapS = THREE.RepeatWrapping;
  stoneMap.wrapT = THREE.RepeatWrapping;
  stoneMap.repeat.set(2, 2);

  return { sandMap, stoneMap };
}

