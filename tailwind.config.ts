import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette
        navy: '#07080F',
        surface: '#0F1629',
        purple: {
          DEFAULT: '#7C3AED',
          dark: '#6D28D9',
          light: '#8B5CF6',
        },
        blue: {
          brand: '#1D4ED8',
        },
        grey: {
          muted: '#6B7280',
          text: '#F9FAFB',
        },
        // Product color swatches
        'swatch-black': '#0F0F0F',
        'swatch-blue': '#1D4ED8',
        'swatch-purple': '#7C3AED',
      },
      fontFamily: {
        syne: ['Syne', 'system-ui', 'sans-serif'],
        outfit: ['Outfit', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'purple-gradient':
          'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
        'purple-gradient-hover':
          'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
        'marquee-pause': 'marquee 30s linear infinite paused',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
