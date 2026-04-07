/** @type {import('tailwindcss').Config} */
module.exports = {
  // Asegúrate de incluir App.js y cualquier carpeta donde pongas tus pantallas (ej. src)
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
}