/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          green: '#00ff41',
          darkgreen: '#00c832',
          dim: '#00ff4180',
          bg: '#0a0a0a',
          bglight: '#1a1a1a',
        },
        phosphor: {
          glow: '#00ff41',
          text: '#33ff5c',
          dim: '#00aa2e',
        }
      },
      fontFamily: {
        mono: ['IBM Plex Mono', 'Fira Code', 'Consolas', 'monospace'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      animation: {
        'blink': 'blink 1s step-end infinite',
        'scanline': 'scanline 8s linear infinite',
        'flicker': 'flicker 0.15s infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'typing': 'typing 3.5s steps(40, end)',
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
          '0%, 100%': { textShadow: '0 0 5px #00ff41, 0 0 10px #00ff41' },
          '50%': { textShadow: '0 0 15px #00ff41, 0 0 25px #00ff41, 0 0 35px #00ff41' },
        },
        typing: {
          'from': { width: '0' },
          'to': { width: '100%' },
        },
      },
      boxShadow: {
        'terminal': '0 0 20px rgba(0, 255, 65, 0.3), inset 0 0 60px rgba(0, 255, 65, 0.05)',
        'crt': '0 0 100px rgba(0, 255, 65, 0.15), 0 0 60px rgba(0, 255, 65, 0.1)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backdropBlur: {
        'glass': '8px',
      }
    },
  },
  plugins: [],
}
