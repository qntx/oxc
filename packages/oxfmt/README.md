# @qntx/oxfmt

Shareable [Oxfmt](https://oxc.rs/docs/guide/usage/formatter.html) config for Vite+ apps and TypeScript libraries.

`printWidth: 100`, double quotes, semicolons, `sortImports` on. Formatting lives here; lint does not own style.

This is the `@qntx/oxfmt` product. The sibling GitHub repo `qntx/oxfmt` is a Vite+ starter and is superseded.

## Install

```bash
bun add -d @qntx/oxlint @qntx/oxfmt
```

Do **not** add `oxfmt` to a Vite+ app. `vp fmt` already nests it.

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

Library: `{ lint: config, fmt }`. Overlay with spread: `{ ...fmt, printWidth: 120 }`.

### CLI

```ts
export { fmt as default } from "@qntx/oxfmt";
```

## License

MIT © [QuantX](https://qntx.org)

---

<div align="center">

A **[QuantX](https://qntx.org)** open-source project.

<a href="https://qntx.org"><img alt="QuantX" width="369" src="https://raw.githubusercontent.com/qntx/.github/main/profile/qntx.svg" /></a>

Code is law. We write both.

</div>
