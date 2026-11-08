/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        luker: {
          red: '#D32F2F',
          'red-dark': '#B71C1C',
          'red-light': '#FDECEC',
          brown: '#8B3B07',
          coral: '#F58285',
          'coral-light': '#FEEBED',
          bg: '#F7F8FA',
          surface: '#FFFFFF',
          text: '#202124',
          muted: '#6B7280',
          border: '#E5E7EB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
