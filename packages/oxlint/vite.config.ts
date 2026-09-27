import { defineConfig } from "vite-plus";

const viteConfig: ReturnType<typeof defineConfig> = defineConfig({
  pack: {
    dts: { generator: "tsgo" },
    exports: true,
  },
});

export default viteConfig;
