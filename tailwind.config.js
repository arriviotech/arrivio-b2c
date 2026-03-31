/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Arrivio Brand Palette
        arrivio: {
          green: '#0f4c3a',
          beige: '#f2f2f2',
          accent: '#186b53',
          dark: '#0a3a2b', 
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        heading: ['IBM Plex Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
