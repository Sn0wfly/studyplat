/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#040405',
        surface: 'rgba(20, 20, 22, 0.4)',
        border: 'rgba(255, 255, 255, 0.08)',
        primary: {
          light: '#a1a1aa',
          DEFAULT: '#e4e4e7',
          bold: '#ffffff'
        },
        accent: {
          green: '#10b981',
          red: '#f43f5e',
          glow: 'rgba(255, 255, 255, 0.05)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'mesh': 'radial-gradient(at 40% 20%, rgba(255,255,255,0.06) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(255,255,255,0.03) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(255,255,255,0.04) 0px, transparent 50%)',
      }
    },
  },
  plugins: [],
}
