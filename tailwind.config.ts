import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        /* Brand palette */
        "verde-500": "#00A859",
        "verde-600": "#009C3B",
        "verde-700": "#007A30",
        "verde-100": "#D7F0E2",
        "verde-50":  "#E9F7EF",
        "amarelo-500": "#FFCC00",
        "amarelo-600": "#CC9900",
        "amarelo-50":  "#FFFAE6",
        /* Esfera accents */
        "esfera-federal":   "#2255AA",
        "esfera-estadual":  "#007A30",
        "esfera-municipal": "#CC9900",
      },
    },
  },
  plugins: [],
};
export default config;
