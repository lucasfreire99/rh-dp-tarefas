import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        fundo: "#0D1117",
        cartao: "#161B22",
        borda: "#30363D",
        texto: "#E6EDF3",
        suave: "#8B949E",
        azul: "#58A6FF",
        verde: "#3FB950",
        ambar: "#D29922",
        vermelho: "#F85149",
        roxo: "#BC8CFF",
        cinza: "#6E7681",
      },
      fontFamily: { sans: ["Inter Variable", "Inter", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
