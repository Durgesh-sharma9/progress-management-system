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
          50: '#f0f4ff',
          100: '#dbe4fe',
          200: '#bfd0fe',
          300: '#93b1fd',
          400: '#608cf9',
          500: '#3b66f5',
          600: '#2547eb',
          700: '#1d35d8',
          800: '#1e2cb0',
          900: '#1e298a',
          950: '#171c54',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 25px -5px rgba(59, 102, 245, 0.3)',
      },
    },
  },
  plugins: [],
}
