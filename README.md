# oxlint

Shareable [Oxlint](https://oxc.rs/docs/guide/usage/linter.html) and [Oxfmt](https://oxc.rs/docs/guide/usage/formatter.html) configs for Vite+ apps and TypeScript libraries.

- **[`@qntx/oxlint`](packages/oxlint)** — correctness and type safety (`config`, `react`, `merge`).
- **[`@qntx/oxfmt`](packages/oxfmt)** — printer (`fmt`). `printWidth: 100`, double quotes, semicolons, `sortImports` on.

Compose in one `vite.config.ts`. Do not use Oxlint `extends` (it merges only `rules` / `plugins` / `overrides` and drops `env` / `options` / `settings` / `ignorePatterns`).

The sibling repo [`qntx/oxfmt`](https://github.com/qntx/oxfmt) is a Vite+ starter. `@qntx/oxfmt` lives here.

Requires **oxlint 1.82.0**. Vite+ 0.3.1 nests 1.81.0; this repo overrides that. Vite+ consumers who do not override still run 1.81.0 (1.82 added no new rule ids).

## Install

```bash
bun add -d @qntx/oxlint @qntx/oxfmt
```

Do **not** add `oxlint`, `oxfmt`, or `oxlint-tsgolint` to a Vite+ app. `vp` already nests them.

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

Drop default ignore patterns with `{ ignorePatterns: undefined }`. Replace them with `{ ignorePatterns: [] }` then set a new list. `fmt` is a flat object; spread is enough.

### CLI

```ts
// oxlint.config.ts
export { config as default } from "@qntx/oxlint";

// oxfmt.config.ts
export { fmt as default } from "@qntx/oxfmt";
```

Vite+ projects should put lint and format in `vite.config.ts`.

## License

MIT © [QuantX](https://qntx.org)

---

<div align="center">

A **[QuantX](https://qntx.org)** open-source project.

<a href="https://qntx.org"><img alt="QuantX" width="369" src="https://raw.githubusercontent.com/qntx/.github/main/profile/qntx.svg" /></a>

Code is law. We write both.

</div>
