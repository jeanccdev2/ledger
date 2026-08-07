import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
  },
  esbuild: {
    // Required for tsyringe: emit TypeScript decorator metadata so tsyringe
    // can read constructor parameter types at runtime.
    target: "es2023",
    keepNames: true,
  },
});
