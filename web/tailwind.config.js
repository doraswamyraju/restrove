/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#FF7A00',
          orangeDark: '#E65100',
          navy: '#0B2D5B',
          navyDark: '#071E3D',
          blue: '#3B82F6',
          purple: '#6C47FF'
        }
      }
    },
  },
  plugins: [],
}
