export enum SakuraStage {
  QR_IDLE = 0,         // Stage 0: Initial scene with functional QR code
  ACTIVATION = 1,      // Stage 1: QR emits pink glow, dissolves into particles converging
  GERMINATION = 2,     // Stage 2: Central glowing seed, roots emerging, tiny stem shooting up
  TREE_GROWTH = 3,     // Stage 3: Trunk growing, twisting, bark forming, branches spreading
  BLOSSOMING = 4,      // Stage 4: Flower buds popping, 5-petal blossoms unfolding
  FULL_BLOOM = 5       // Stage 5: Majestic mature tree, spring breeze, falling petal blizzard
}

export interface TimelineState {
  stage: SakuraStage;
  globalProgress: number; // 0.0 to 1.0 overall continuous timeline
  activationProgress: number; // 0 to 1
  germinationProgress: number; // 0 to 1
  growthProgress: number; // 0 to 1 (trunk + branch expansion)
  blossomProgress: number; // 0 to 1 (flower unfolding)
  bloomDrift: number; // time/frame accumulator for breeze
}

export const STAGE_DESCRIPTIONS: Record<SakuraStage, { title: string; subtitle: string }> = {
  [SakuraStage.QR_IDLE]: {
    title: 'The Digital Seed',
    subtitle: 'Scan with your camera or tap to awaken the tree',
  },
  [SakuraStage.ACTIVATION]: {
    title: 'Digital Dissolution',
    subtitle: 'QR modules dissolve into glowing sakura energy',
  },
  [SakuraStage.GERMINATION]: {
    title: 'The Sprouting Seed',
    subtitle: 'Ancient roots break ground as the seedling awakens',
  },
  [SakuraStage.TREE_GROWTH]: {
    title: 'Trunk & Branching',
    subtitle: 'Botanical Yoshino trunk twists upwards towards the sky',
  },
  [SakuraStage.BLOSSOMING]: {
    title: 'Cascading Bloom',
    subtitle: 'Thousands of five-petal blossoms unfold along branches',
  },
  [SakuraStage.FULL_BLOOM]: {
    title: 'Spring Symphony',
    subtitle: 'The living Sakura tree dances in the gentle spring breeze',
  },
};

