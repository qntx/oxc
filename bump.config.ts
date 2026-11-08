import { defineConfig } from "bumpp";

// @qntx/oxlint and @qntx/oxfmt release in lockstep from one `v*.*.*` tag.
// bun.lock records workspace versions, so execute refreshes it and `all`
// commits it. main is protected: bumpp opens a `release/v<version>` pull
// request; tag the merge commit by hand after it lands.
const config: ReturnType<typeof defineConfig> = defineConfig({
  files: ["packages/oxlint/package.json", "packages/oxfmt/package.json"],
  execute: "bun install",
  all: true,
  commit: true,
  pr: true,
  push: true,
});

export default config;
