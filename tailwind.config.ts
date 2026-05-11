import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./data/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        muted: "#667085",
        line: "#E4E7EC",
        navy: "#163B63",
        danger: "#B42318",
        warning: "#B54708",
        softRed: "#FEF3F2",
        softBlue: "#EFF6FF"
      },
      boxShadow: {
        panel: "0 10px 28px rgba(16, 24, 40, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
