/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0B1D51',
          dark: '#0B1D51',
          medium: '#1a365d',
          light: '#2d4a7c',
        },
        luxury: {
          DEFAULT: '#D4AF64',
          dark: '#C99846',
          light: '#E8D4A0',
        },
        accent: {
          DEFAULT: '#10B981',
          light: '#34D399',
        },
        neutral: {
          DEFAULT: '#F8FAFC',
          dark: '#1F2937',
          beige: '#F5F5DC',
        }
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}