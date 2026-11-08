<!-- markdownlint-disable MD033 MD041 -->

# @qntx/oxfmt

Shareable [Oxfmt](https://oxc.rs/docs/guide/usage/formatter.html) config for Vite+ apps and TypeScript libraries. `printWidth: 100`, double quotes, semicolons, `sortImports` on. Formatting lives here; lint does not own style. `**/bun.lock` is ignored — bun rewrites it.

## Install

```bash
bun add -d @qntx/oxlint @qntx/oxfmt
```

Do **not** add `oxfmt` to a Vite+ app — `vp` already nests it. Requires Vite+ 1.4.0 or later (oxfmt `>=0.74.0 <1.0.0`).

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

Library: `{ lint: config, fmt }`. Overlay with spread: `{ ...fmt, printWidth: 120 }`.

Extend object-valued settings (`sortImports`, `sortPackageJson`, `sortTailwindcss`) by spreading the nested object — they are typed as the objects the preset ships, so no narrowing is needed:

```ts
export default {
  ...fmt,
  sortImports: {
    ...fmt.sortImports,
    internalPattern: [...fmt.sortImports.internalPattern, "@app/"],
  },
};
```

### CLI

```ts
// oxfmt.config.ts
export { fmt as default } from "@qntx/oxfmt";
```

Vite+ projects should put format in `vite.config.ts`, not `oxfmt.config.ts`.

## License

Licensed under the MIT License ([LICENSE](LICENSE) or <https://opensource.org/licenses/MIT>).

---

<div align="center">

A **[QuantX](https://qntx.org)** open-source project.

<a href="https://qntx.org"><img alt="QuantX" width="369" src="https://raw.githubusercontent.com/qntx/.github/main/profile/qntx.svg" /></a>

Code is law. We write both.

</div>
