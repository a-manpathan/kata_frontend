/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sweet: {
          rose: '#f8d7da',
          pink: '#f5c2c7', 
          cream: '#fefefe',
          cocoa: '#8b4513',
          mint: '#d1e7dd',
          yellow: '#fff3cd',
          red: '#f8d7da'
        }
      },
      fontFamily: {
        'heading': ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'Roboto', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}