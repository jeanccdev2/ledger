import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
  },
  plugins: [
    // unplugin-swc replaces the esbuild transform so that TypeScript
    // `emitDecoratorMetadata` (needed by tsyringe) is honoured in tests.
    swc.vite({
      jsc: {
        parser: {
          syntax: "typescript",
          decorators: true,
        },
        transform: {
          decoratorMetadata: true,
          legacyDecorator: true,
        },
        target: "es2022",
        keepClassNames: true,
      },
    }),
  ],
});
