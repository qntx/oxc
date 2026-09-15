import { defineConfig } from "vite-plus";

import { config, merge } from "./src/index.ts";

export default defineConfig({
  staged: { "*": "vp check --fix" },
  pack: {
    dts: { generator: "tsgo" },
    exports: true,
  },
  lint: merge(config, {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
  }),
  fmt: {},
  run: { cache: true },
});
