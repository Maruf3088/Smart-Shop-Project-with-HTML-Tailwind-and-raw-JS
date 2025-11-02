/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],

  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        raleway: ['Raleway', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
        sora: ['Sora', 'sans-serif'],
        rancho: ['Rancho', 'cursive'],
        playwrite: ['"Playwrite IT Moderna"', 'serif'],
      },
    },
  },

  daisyui: {
    themes: ["light", "dark", "cupcake", "synthwave", "corporate", "dracula"],
    darkTheme: "dark", // default dark theme
  },

  plugins: [require("daisyui")],
};
