# @qntx/oxlint

Shareable [Oxlint](https://oxc.rs/docs/guide/usage/linter.html) config for Vite+ apps and TypeScript libraries.

Clippy-mapped strictness: type safety and correctness fail the build (`any`, `!`, unsafe, floating promises, React Compiler). Tests relax like `allow-unwrap-in-tests`. Formatting is [`@qntx/oxfmt`](https://www.npmjs.com/package/@qntx/oxfmt), not lint.

Requires **oxlint 1.82.0**. Vite+ 0.3.1 nests 1.81.0; this repo overrides that. Vite+ consumers who do not override still run 1.81.0 (1.82 added no new rule ids).

## Install

```bash
bun add -d @qntx/oxlint @qntx/oxfmt
```

Do **not** add `oxlint` or `oxlint-tsgolint` to a Vite+ app. `vp lint` already nests them.

## Recipes

### Vite+ React

```ts
import { defineConfig } from "vite-plus";
import { react } from "@qntx/oxlint";
import { fmt } from "@qntx/oxfmt";

export default defineConfig({
  lint: react,
  fmt,
});
```

`react` already includes the core TypeScript/ESLint/Vitest table plus native `react` / `jsx-a11y` / `react-perf`.

### TypeScript library

```ts
import { defineConfig } from "vite-plus";
import { config } from "@qntx/oxlint";
import { fmt } from "@qntx/oxfmt";

export default defineConfig({
  lint: config,
  fmt,
});
```

`config` does not enable React plugins.

### Overrides

```ts
import { defineConfig } from "vite-plus";
import { config, merge } from "@qntx/oxlint";
import { fmt } from "@qntx/oxfmt";

export default defineConfig({
  lint: merge(config, { rules: { "eslint/no-console": "off" } }),
  fmt: { ...fmt, printWidth: 120 },
});
```

Drop default ignore patterns with `{ ignorePatterns: undefined }`. Replace them with `{ ignorePatterns: [] }` then set a new list.

### CLI

```ts
export { config as default } from "@qntx/oxlint";
```

Vite+ projects should put lint in `vite.config.ts`, not `oxlint.config.ts`.

## License

MIT © [QuantX](https://qntx.org)

---

<div align="center">

A **[QuantX](https://qntx.org)** open-source project.

<a href="https://qntx.org"><img alt="QuantX" width="369" src="https://raw.githubusercontent.com/qntx/.github/main/profile/qntx.svg" /></a>

Code is law. We write both.

</div>
