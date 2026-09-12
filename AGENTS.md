# AGENTS.md

- Do not preserve backward compatibility. Remove obsolete paths instead of adding compatibility layers, fallbacks, or migrations.
- Choose the simplest implementation that fully meets the current requirements. Avoid speculative abstractions, configuration, and indirection.
- Grow the system in layers. Start from the smallest version that works end to end, and add each new capability on top of a product that already works. Never trade a working product for unfinished complexity.
- Keep components modular and concerns clearly separated.
- Prefer established, well-maintained libraries when they reduce overall complexity or improve reliability. Do not reimplement common functionality without a clear reason.
- Lean on the dependencies already in the project before writing your own implementation or adding packages. Do not assume a library lacks a capability without checking its documentation and types.
- Make architectural decisions for the long term. Do not accept a stopgap that only works for now and is meant to be replaced later.

## Inventory

- For every core plugin listed in `packages/oxlint/src/config.ts` and `packages/oxlint/src/react.ts`, every non-nursery Oxlint rule of that plugin must be explicit in `rules` (enabled or disabled).
- Source of truth: `oxlint --rules --format=json`. Skip `category === "nursery"`.
- Do not use root `categories`.
- Type-safety and correctness rules stay `error`. Do not weaken `no-explicit-any`, `no-non-null-assertion`, `strict-boolean-expressions`, or `no-unsafe-*` on production files. Test overlays may relax them the way Clippy allows unwrap in tests.
