import { defineConfig } from "vite-plus";
import type { UserConfig } from "vite-plus";

const config: UserConfig = defineConfig({
  pack: {
    dts: { tsgo: {} },
    exports: true,
  },
});

export default config;
