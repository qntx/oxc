<!-- markdownlint-disable MD033 MD041 -->

# @qntx/oxlint

Shareable [Oxlint](https://oxc.rs/docs/guide/usage/linter.html) config for Vite+ apps and TypeScript libraries. Clippy-mapped strictness: type safety and correctness fail the build (`any`, `!`, unsafe, floating promises, React Compiler). Tests relax like `allow-unwrap-in-tests`. Formatting is [`@qntx/oxfmt`](https://www.npmjs.com/package/@qntx/oxfmt), not lint.

## Install

```bash
bun add -d @qntx/oxlint @qntx/oxfmt
```

Do **not** add `oxlint`, `oxfmt`, or `oxlint-tsgolint` to a Vite+ app — `vp` already nests them. Requires Vite+ 1.4.0 or later (oxlint `^1.89.0`, oxlint-tsgolint `>=7.0.2004`).

## Usage

### Vite+ React

```ts
import { defineConfig } from "vite-plus";

import { fmt } from "@qntx/oxfmt";
import { react } from "@qntx/oxlint";

export default defineConfig({
  lint: react,
  fmt,
});
```

`react` already includes the core TypeScript/ESLint/Vitest table plus native `react` / `jsx-a11y`.

`react` assumes the project is compiled by React Compiler: it enables the native compiler rules, forbids `useMemo` / `useCallback` / `memo` (named, namespace, and `React.*` access), and turns off rules that only push toward manual memoization. Setting your own `eslint/no-restricted-imports` or `eslint/no-restricted-properties` replaces the preset entry, so copy its `react` entry into yours.

### TypeScript library

```ts
import { defineConfig } from "vite-plus";

import { fmt } from "@qntx/oxfmt";
import { config } from "@qntx/oxlint";

export default defineConfig({
  lint: config,
  fmt,
});
```

`config` does not enable React plugins.

### Overrides

```ts
import { defineConfig } from "vite-plus";

import { fmt } from "@qntx/oxfmt";
import { config, merge } from "@qntx/oxlint";

export default defineConfig({
  lint: merge(config, { rules: { "eslint/no-console": "off" } }),
  fmt: { ...fmt, printWidth: 120 },
});
```

Drop default ignore patterns with `{ ignorePatterns: undefined }`. Replace them with `{ ignorePatterns: [] }` then set a new list. `import/no-unassigned-import` already allows `**/*.css` — extend `allow` for other side-effect imports.

### CLI

```ts
// oxlint.config.ts
export { config as default } from "@qntx/oxlint";

// oxfmt.config.ts
export { fmt as default } from "@qntx/oxfmt";
```

Vite+ projects should put lint and format in `vite.config.ts`.

## License

Licensed under the MIT License ([LICENSE](LICENSE) or <https://opensource.org/licenses/MIT>).

---

<div align="center">

A **[QuantX](https://qntx.org)** open-source project.

<a href="https://qntx.org"><img alt="QuantX" width="369" src="https://raw.githubusercontent.com/qntx/.github/main/profile/qntx.svg" /></a>

Code is law. We write both.

</div>
