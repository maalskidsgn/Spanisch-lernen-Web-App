/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF7A00',
        'primary-dark': '#E66E00',
        'primary-light': '#FFB84D',
        secondary: '#003366',
        accent: '#00A8E8',
        success: '#4CAF50',
        warning: '#FFC107',
        error: '#F44336',
        background: '#F5F7FA',
        'text-primary': '#1A2B3D',
        'text-secondary': '#666666',
      },
      fontFamily: {
        sans: ['Proxima Nova', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'xs': ['12px', '16px'],
        'sm': ['14px', '20px'],
        'base': ['16px', '24px'],
        'lg': ['18px', '28px'],
        'xl': ['20px', '28px'],
        '2xl': ['24px', '32px'],
        '3xl': ['30px', '36px'],
        '4xl': ['36px', '44px'],
      },
      borderRadius: {
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
      },
    },
  },
  plugins: [],
}
