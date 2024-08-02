/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-bg': '#0A141D',
        'card-bg': '#1F2A38',
        'primary-pink': '#FD4EF5',
        'primary-blue': '#10CAFF',
      },
      fontFamily: {
        'font-primary': ['Montserrat Alt 1', 'sans-serif'],
      },
    },
  },
  plugins: [],
};