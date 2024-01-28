// tailwind.config.js
module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        commercial: '#E1DA83',
        school: '#CF7856',
        residental:'#B4D8C7'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}