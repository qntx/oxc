import { defineConfig } from "vite-plus";
import type { UserConfig } from "vite-plus";

import { fmt } from "./packages/oxfmt/src/index.ts";
import { config as lintPreset, merge } from "./packages/oxlint/src/index.ts";

const config: UserConfig = defineConfig({
  staged: { "*": "vp check --fix" },
  lint: merge(lintPreset, {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
  }),
  fmt,
  run: { cache: process.env["CI"] === undefined || process.env["CI"] === "" },
  test: { include: ["tests/**/*.test.ts"] },
});

export default config;
