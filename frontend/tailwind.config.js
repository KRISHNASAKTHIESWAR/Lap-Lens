/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'toyota-red': '#E4002B',
        'toyota-white': '#FFFFFF',
        'toyota-black': '#000000',
        'racing-gray': '#1a1a1a',
      },
      animation: {
        'pulse-slow': 'pulse 3s linear infinite',
        'slide-in': 'slideIn 0.5s ease-out',
      }
    },
  },
  plugins: [],
}