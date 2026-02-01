import { defineConfig } from "tsdown";

const config = defineConfig({
  clean: true,
  dts: {
    enabled: true,
    sourcemap: true,
  },
  entry: ["src/index.ts"],
  format: ["esm"],
  outDir: "dist",
  platform: "node",
  shims: true,
  sourcemap: true,
  target: ["es2022"],
  treeshake: true,
});

export default config;
