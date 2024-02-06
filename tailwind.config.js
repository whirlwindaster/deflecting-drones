/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {
      colors: {
        background: "#003566",
        background_dark: "#001D3D",
        primary: "#ffd60a",
        accent: "#ffc300",
        grey: "#9ca3af",
        dark_grey: "#313438",
      },
    },
  },
  plugins: [],
};
