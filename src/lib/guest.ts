'use client';

import { useEffect, useState } from 'react';

/** Where the "Back to the Ocha Party" link goes in guest mode. */
export const OCHA_PARTY_URL = 'https://njcsb-ocha-party.netlify.app';

export interface ClosingMessage {
  jp: string;
  romaji: string;
  text: string;
}

/**
 * Shown when the tree reaches full bloom in guest mode (one picked at random).
 * Written so they read well both before and after the event.
 */
export const CLOSING_MESSAGES: ClosingMessage[] = [
  { jp: '一期一会', romaji: 'Ichi-go ichi-e', text: 'Every meeting happens only once. Let’s make ours a lovely one.' },
  { jp: '縁', romaji: 'En', text: 'Some connections are meant to bloom. One might be waiting for you.' },
  { jp: 'お茶でも', romaji: 'Ocha demo', text: 'Tea always tastes better with someone new beside you.' },
  { jp: '笑う門には福来る', romaji: 'Warau kado ni wa fuku kitaru', text: 'Good fortune visits the laughing door. Bring your laugh along.' },
  { jp: '和', romaji: 'Wa', text: 'Harmony is only a few good conversations away.' },
  { jp: '一服', romaji: 'Ippuku', text: 'Pause, sip, breathe. The best mornings begin slowly.' },
  { jp: '桜', romaji: 'Sakura', text: 'Like sakura, the best moments are brief, bright and shared.' },
  { jp: 'ようこそ', romaji: 'Yōkoso', text: 'You came as a guest. We hope you leave as a friend.' },
  { jp: '春', romaji: 'Haru', text: 'It isn’t spring yet, but something here is about to bloom.' },
  { jp: 'ご縁に感謝', romaji: 'Go-en ni kansha', text: 'Thank you for letting our paths cross over a cup of tea.' },
];

const LAST_KEY = 'ocha-sakura-last-message';

/** Picks a random message, avoiding the one this visitor saw last time. */
export function pickClosingMessage(): ClosingMessage {
  let last = -1;
  try {
    last = Number(window.localStorage.getItem(LAST_KEY) ?? -1);
  } catch {
    /* storage unavailable: fine */
  }
  let i = Math.floor(Math.random() * CLOSING_MESSAGES.length);
  if (CLOSING_MESSAGES.length > 1 && i === last) {
    i = (i + 1 + Math.floor(Math.random() * (CLOSING_MESSAGES.length - 1))) % CLOSING_MESSAGES.length;
  }
  try {
    window.localStorage.setItem(LAST_KEY, String(i));
  } catch {
    /* ignore */
  }
  return CLOSING_MESSAGES[i];
}

/**
 * Guest mode is switched on by adding ?guest to the URL.
 * `ready` stays false until the browser has been checked, so the
 * normal editing tools never flash on screen for guests.
 */
export function useGuestMode() {
  const [state, setState] = useState({ isGuest: false, reducedMotion: false, ready: false });

  useEffect(() => {
    const isGuest = new URLSearchParams(window.location.search).has('guest');
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setState({ isGuest, reducedMotion: mq.matches, ready: true });

    const onChange = () => setState((s) => ({ ...s, reducedMotion: mq.matches }));
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  return state;
}
