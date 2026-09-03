import path from "path";
import { configDefaults, defineConfig } from "vitest/config";

const __dirname = import.meta.dirname;

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude],
    setupFiles: ["tests/helpers/setup.ts"],
    environment: "jsdom",
    watch: false,
    coverage: {
      provider: "istanbul",
      include: ["app/*"],
    },
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./app"),
    },
  },
});
