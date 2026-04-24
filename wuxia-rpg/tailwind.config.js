/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          black: '#1a1a1a',
          gray: '#4a4a4a',
          light: '#7a7a7a',
        },
        rice: '#f5f0e6',
        parchment: '#e8e0d0',
        gold: '#c9a227',
        jade: '#4a7c59',
      },
      fontFamily: {
        serif: ['SimSun', '宋体', 'serif'],
        sans: ['Microsoft YaHei', '微软雅黑', 'sans-serif'],
      },
      backgroundImage: {
        'ink-wash': 'linear-gradient(135deg, rgba(26, 26, 26, 0.03) 0%, rgba(74, 74, 74, 0.08) 50%, rgba(26, 26, 26, 0.03) 100%)',
      },
    },
  },
  plugins: [],
}