import { defineConfig } from "vite-plus";
import type { UserConfig } from "vite-plus";

const config: UserConfig = defineConfig({
  pack: {
    dts: { tsgo: {} },
    exports: true,
  },
  test: { testTimeout: 30_000 },
});

export default config;
