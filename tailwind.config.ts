import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: '#FCF8F5',
          100: '#F8F0EA',
          200: '#EFE2D6',
          300: '#E5D3C1',
          400: '#D5BDA6',
          900: '#3D332A'
        },
        sakura: {
          light: '#FDF2F4',
          blush: '#F7D7DE',
          DEFAULT: '#EBA9B8',
          vibrant: '#F28DA4',
          deep: '#D9778F',
          rose: '#BC687E',
          plum: '#542D3D',
        },
        zen: {
          bark: '#49352C',
          barkDark: '#2E1F1A',
          moss: '#66745B',
          mossLight: '#859876',
          stone: '#8E8883',
          stoneLight: '#C4BFBA',
          sand: '#EAE3D9'
        }
      },
      fontFamily: {
        serif: ['"Noto Serif JP"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        'zen': '0 20px 40px -15px rgba(84, 45, 61, 0.08), 0 0 1px 1px rgba(235, 169, 184, 0.15)',
        'zen-lg': '0 25px 60px -15px rgba(84, 45, 61, 0.14), 0 0 1px 1px rgba(235, 169, 184, 0.25)',
        'zen-glow': '0 0 35px rgba(235, 169, 184, 0.35)',
      }
    },
  },
  plugins: [],
};
export default config;

