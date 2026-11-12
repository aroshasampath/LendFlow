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
          primary: '#3157D5',
          primaryHover: '#2342A8',
          primaryLight: '#EBF0FF',
          dark: '#17233C',
          bg: '#F5F7FB',
          white: '#FFFFFF',
          success: '#16A36A',
          warning: '#E6A23C',
          danger: '#DC4C4C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      screens: {
        'xs': '375px',
        // sm: 640px
        // md: 768px
        // lg: 1024px
        // xl: 1280px
        // 2xl: 1440px
      },
    },
  },
  plugins: [],
}
