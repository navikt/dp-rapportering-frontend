import { reactRouter } from "@react-router/dev/vite";
import path from "path";
import { defineConfig } from "vite";

const __dirname = import.meta.dirname;

export default defineConfig({
  base:
    process.env.NODE_ENV === "production"
      ? "https://cdn.nav.no/teamdagpenger/dp-rapportering-frontend/client/"
      : "/arbeid/dagpenger/meldekort",
  plugins: [reactRouter()],
  server: {
    port: 3000,
  },
  build: {
    sourcemap: true,
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./app"),
    },
    tsconfigPaths: true,
  },
});
