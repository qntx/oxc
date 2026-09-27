import { defineConfig } from "vite-plus";
import type { UserConfig } from "vite-plus";

const viteConfig: UserConfig = defineConfig({
  pack: {
    dts: { generator: "tsgo" },
    exports: true,
  },
});

export default viteConfig;
