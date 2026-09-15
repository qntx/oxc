# @qntx/oxc

Shareable [Oxlint](https://oxc.rs/docs/guide/usage/linter.html) config for Vite+ apps and TypeScript libraries.

Exports `config`, `react`, and `merge`. Formatting is Vite+ Oxfmt (`fmt: {}`). Do not use Oxlint `extends` (it merges only `rules` / `plugins` / `overrides` and drops `env` / `options` / `settings` / `ignorePatterns`).

Requires **oxlint 1.82.0**. Vite+ 0.3.1 nests 1.81.0; this repo overrides that.

`@qntx/oxlint` and `@qntx/oxfmt` are deprecated. Use `@qntx/oxc`.

## Install

```bash
bun add -d @qntx/oxc
```

Do **not** add `oxlint` or `oxlint-tsgolint` to a Vite+ app. `vp` already nests them. Override nested oxlint to 1.82.0 and oxlint-tsgolint to 7.0.2001.

## Recipes

### Vite+ React

```ts
import { defineConfig } from "vite-plus";
import { react } from "@qntx/oxc";

export default defineConfig({
  lint: react,
  fmt: {},
});
```

### TypeScript library

```ts
import { defineConfig } from "vite-plus";
import { config } from "@qntx/oxc";

export default defineConfig({
  lint: config,
  fmt: {},
});
```

`config` does not enable React plugins.

### Overrides

```ts
import { defineConfig } from "vite-plus";
import { config, merge } from "@qntx/oxc";

export default defineConfig({
  lint: merge(config, { rules: { "eslint/no-console": "off" } }),
  fmt: {},
});
```

Drop default ignore patterns with `{ ignorePatterns: undefined }`. Replace them with `{ ignorePatterns: [] }` then set a new list.

### CLI

```ts
// oxlint.config.ts
export { config as default } from "@qntx/oxc";
```

Vite+ projects should put lint in `vite.config.ts`.

## License

MIT © [QuantX](https://qntx.org)

---

<div align="center">

A **[QuantX](https://qntx.org)** open-source project.

<a href="https://qntx.org"><img alt="QuantX" width="369" src="https://raw.githubusercontent.com/qntx/.github/main/profile/qntx.svg" /></a>

Code is law. We write both.

</div>
