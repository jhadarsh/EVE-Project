/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#fff1f7",
          100: "#ffe4ef",
          500: "#d81b60",
          600: "#c2185b",
          700: "#ad1457",
          900: "#4a0b28",
        },
      },
      boxShadow: {
        soft: "0 18px 60px rgba(42, 22, 34, 0.08)",
        card: "0 8px 30px rgba(42, 22, 34, 0.07)",
      },
    },
  },
  plugins: [],
};