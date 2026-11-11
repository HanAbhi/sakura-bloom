# 🌸 SAKURA — A little surprise for Ocha Party guests

A small, immersive 3D Japanese garden. Tap the sleeping seed and watch it grow into a Yoshino cherry tree (*Prunus × yedoensis*) in full bloom — then read the message waiting for you. A different message appears on each visit and each replay.

---

## 🍵 The experience

1. **The Sleeping Seed**: A glowing sakura seed rests on an ivory garden plinth.
2. **Awakening**: Sakura energy swirls in from across the plinth and gathers into the seed.
3. **Germination**: The seed opens, roots break ground and a sapling shoot rises.
4. **Tree Growth**: A gnarled trunk with bark grooves twists upward and spreads its boughs.
5. **Blossoming**: Thousands of delicate 5-petal blossoms unfold along the branches.
6. **Full Bloom**: The tree sways in the breeze, petals drift down, and a short quirky or heartwarming message appears.

Messages live in [`src/lib/guest.ts`](src/lib/guest.ts). The last one shown is remembered (in `localStorage`) so the next visit gets a different one.

### Comfort & performance
- **Reduced motion**: if the device asks for reduced motion, the tree appears in full bloom straight away, the breeze is gentler, the camera doesn't orbit and the seed doesn't pulse.
- **Mobile**: capped pixel ratio, a 1024px shadow map, and the tree no longer re-renders React or rebuilds its geometry every frame.

### Controls
- **Tap to see the tree** (or tap the seed): starts the growth.
- **Spring / Bloom / Breeze**: blossom density and wind strength.
- **Sound**: traditional Koto, Shō drone and wind chimes (off by default).
- **Replay**: grows the tree again from the seed, with a new message.

---

## 🚀 Getting Started

Requires Node.js 18+.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```
