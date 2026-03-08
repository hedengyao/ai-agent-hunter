/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'agent-green': '#00FF88',
        'agent-blue': '#00D4FF',
        'agent-pink': '#FF00FF',
      },
      animation: {
        'pulse-fast': 'pulse 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
