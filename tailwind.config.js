/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          green: '#4ade80',
          darkgreen: '#22c55e',
          dim: '#4ade8080',
          bg: '#0c0c0c',
          bglight: '#181818',
        },
        phosphor: {
          glow: '#4ade80',
          text: '#86efac',
          dim: '#22c55e',
        }
      },
      fontFamily: {
        mono: ['IBM Plex Mono', 'Fira Code', 'Consolas', 'monospace'],
        display: ['Syne', 'Space Grotesk', 'sans-serif'],
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      animation: {
        'blink': 'blink 1s step-end infinite',
        'scanline': 'scanline 8s linear infinite',
        'flicker': 'flicker 0.15s infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'typing': 'typing 3.5s steps(40, end)',
        'marquee': 'marquee 22s linear infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.97' },
        },
        'glow-pulse': {
          '0%, 100%': { textShadow: '0 0 4px rgba(74,222,128,0.4), 0 0 8px rgba(74,222,128,0.2)' },
          '50%': { textShadow: '0 0 8px rgba(74,222,128,0.5), 0 0 16px rgba(74,222,128,0.25)' },
        },
        typing: {
          'from': { width: '0' },
          'to': { width: '100%' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      boxShadow: {
        'terminal': '0 0 15px rgba(74, 222, 128, 0.15), inset 0 0 40px rgba(74, 222, 128, 0.03)',
        'crt': '0 0 60px rgba(74, 222, 128, 0.08), 0 0 30px rgba(74, 222, 128, 0.05)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backdropBlur: {
        'glass': '8px',
      }
    },
  },
  plugins: [],
}
