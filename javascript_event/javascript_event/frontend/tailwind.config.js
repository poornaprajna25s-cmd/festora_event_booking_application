/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B00', /* Changed from #5D3C64 to match the orange theme */
        secondary: '#FF8C42', /* Changed from #9F6496 to match the orange theme */
        accent: '#FF8C42', /* Added accent color */
        background: '#2B2B2B' /* Changed from #9F6496 to match the dark theme */
      },
    },
  },
  plugins: [],
}