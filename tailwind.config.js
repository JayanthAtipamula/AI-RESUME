/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'neon-blue': '#00ffff',
        'neon-pink': '#ff00ff',
        glass: {
          100: 'rgba(255, 255, 255, 0.1)',
          200: 'rgba(255, 255, 255, 0.2)',
          300: 'rgba(255, 255, 255, 0.3)',
        },
        primary: '#00ffff',
        'primary-foreground': '#000000',
        input: 'rgba(255, 255, 255, 0.1)',
        ring: '#00ffff',
        border: 'rgba(255, 255, 255, 0.1)',
        background: '#000000',
        foreground: '#ffffff',
        accent: 'rgba(0, 255, 255, 0.1)',
        'accent-foreground': '#ffffff',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        neon: '0 0 15px rgba(0, 255, 255, 0.3)',
      },
      ringColor: {
        'neon-blue': '#00ffff',
      },
      maxWidth: {
        container: "1280px",
      },
      animation: {
        marquee: 'marquee var(--duration) linear infinite',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(calc(-100% - var(--gap)))' }
        }
      }
    },
  },
  plugins: [],
};