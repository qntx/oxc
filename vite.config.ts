import { defineConfig } from "vite-plus";

import { fmt } from "./packages/oxfmt/src/index.ts";
import { config, merge } from "./packages/oxlint/src/index.ts";

export default defineConfig({
  staged: { "*": "vp check --fix" },
  lint: merge(config, {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
  }),
  fmt,
  run: { cache: true },
});
