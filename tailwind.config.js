/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          50: '#eefcfb',
          100: '#d5f5f2',
          500: '#37b8af',
          700: '#1d7f79',
        },
      },
    },
  },
  plugins: [],
};
