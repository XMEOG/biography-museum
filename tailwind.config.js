/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        museum: {
          bg: "#0A0A0B",
          panel: "#121214",
          panel2: "#17171A",
          line: "#2A2A2E",
          text: "#EDEBE6",
          muted: "#9B968C",
          accent: "#B8935A",
          accentSoft: "rgba(184, 147, 90, 0.35)",
        },
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", "Georgia", "serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(184,147,90,0.55), 0 0 28px 6px rgba(184,147,90,0.35)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        fadeOut: {
          "0%": { opacity: 1 },
          "100%": { opacity: 0 },
        },
        panelIn: {
          "0%": { opacity: 0, transform: "translateY(12px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.4s ease-out forwards",
        fadeOut: "fadeOut 0.3s ease-in forwards",
        panelIn: "panelIn 0.45s cubic-bezier(0.22,1,0.36,1) forwards",
      },
    },
  },
  plugins: [],
};
