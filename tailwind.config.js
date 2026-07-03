/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0B0817',
          card: '#14102A',
          surface: '#1C1740',
          border: '#2A2350',
        },
        accent: {
          gold: '#F5A623',
          green: '#4ADE80',
          purple: '#A78BFA',
          pink: '#F472B6',
        },
        text: {
          primary: '#F0EDF8',
          secondary: '#B8B0D0',
          muted: '#7A729A',
        },
      },
      fontFamily: {
        arabic: ['Tajawal', 'Cairo', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
