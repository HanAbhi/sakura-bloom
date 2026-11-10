# 🌸 SAKURA — An Interactive QR-to-Life 3D Web Experience

An immersive 3D Japanese garden web application where a functional, scannable QR code serves as a digital seed that blossoms into a living Yoshino cherry tree (*Prunus × yedoensis*).

---

## 🍵 Features & Architecture

- **Real-Time Functional QR Code**:
  - Encoded with destination URL: `https://njcsb-ocha-party.netlify.app`
  - Fully scannable by mobile cameras in 3D and 2D modal views.
  - Clicking the QR code opens the destination website.
  - URL is editable in real-time with instant 3D regeneration.
- **Continuous 5-Stage Growth Timeline**:
  1. **Stage 0 (The Digital Seed)**: Scannable 3D QR on an ivory garden plinth with a dormant glowing seed at the center.
  2. **Stage 1 (Activation)**: Modules elevate, glow sakura pink, and dissolve into nearly 2,000 swirling particles.
  3. **Stage 2 (Germination)**: Central seed opens, buttress roots break ground, and an emerald sapling shoot ascends.
  4. **Stage 3 (Tree Growth)**: Thick gnarled trunk with longitudinal bark grooves, natural tapers, and horizontal sweeping boughs.
  5. **Stage 4 (Blossoming)**: Staggered unfolding of thousands of delicate 5-petal Yoshino blossoms with apical cleft notches.
  6. **Stage 5 (Full Bloom)**: Dual-frequency harmonic wind sway, aerodynamic falling petal blizzard, and subtle cinematic orbit.
- **Traditional Japanese Zen Audio Synthesizer**:
  - Physically modeled Japanese Koto (箏) playing the traditional **Hirajōshi scale** (平調子).
  - Shō (笙) temple atmospheric drone with 10-second meditative breathing cycles.
  - Crystal Japanese wind chimes (風鈴 Fūrin) and temple bells (*Rin* 鈴).
- **Botanical Realism & Materials**:
  - High-res procedural *Prunus* bark texture with horizontal lenticels and bump relief.
  - Translucent 5-petal flower geometry with crimson hypanthium and golden anthers.
  - 3-layer spatial petal physics (foreground soft-focus, midground canopy swirl, background distant drift, settled ground petals).

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Development Server
```bash
npm run dev
```

### Production Build & Serve
```bash
npm run build
npm start
```
The application will be available at: **http://localhost:3000**

---

## 🧪 QR Verification Test Suite

Verify that the QR code encodes and decodes accurately:

```bash
node scripts/verify-qr-suite.mjs
```

---

## 🎛️ Interactive Controls

- **URL Bar**: Enter any web address to generate a new custom 3D QR code.
- **Tap to see the tree**: Awakens the living Sakura tree from the digital seed.
- **Spring / Bloom / Breeze**: Toggles seasonal blossom density and wind velocity.
- **Sound**: Toggles traditional Japanese Koto and ambient soundscape.
- **Replay**: Restarts the transformation from seed to bloom.
- **QR Code / Tap to see QR code**: Returns smoothly to the scannable digital seed state.
- **Download**: Opens modal to download a 1024×1024 high-resolution PNG.
- **Share**: Copies the link or triggers the native Web Share API.

