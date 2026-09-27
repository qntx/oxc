# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.4] - 2026-09-27

### Fixed

- `@qntx/oxlint` `config` and `react`, and `@qntx/oxfmt` `fmt`, are declared with their public config types instead of `satisfies`-inferred literals. The emitted `overrides` members carried `excludeFiles?: undefined`, so `exactOptionalPropertyTypes` consumers (e.g. `@qntx/tsconfig` strictest) could not pass `config` to `merge` — TS2345 `Type 'undefined' is not assignable to type 'GlobSet'`.
- `@qntx/oxlint` `merge` accepts `undefined`/`null` property values in every input part, matching its delete-the-key contract under `exactOptionalPropertyTypes`.
- Repository CI: per-package `typecheck` (`tsc --noEmit`) scripts so the org `ci-bun` workflow's typecheck step runs instead of skipping — `vp check` alone does not surface `isolatedDeclarations` diagnostics.

## [1.0.3] - 2026-09-27

### Fixed

- `@qntx/oxlint` turns off `unicorn/number-literal-case` and `unicorn/no-nested-ternary`. oxfmt lowercases hex digits and strips non-semantic parentheses around nested ternaries, so the two tools never reached a fixed point.
- `@qntx/oxfmt` accepts oxfmt `>=0.66.0 <1.0.0`. `^0.66.0` excluded every 0.67+ release, including the oxfmt copy current Vite+ installs.

## [1.0.2] - 2026-09-12

### Fixed

- Root `devEngines.packageManager.onFail` is `ignore` so CI `npm publish` is not rejected by npm 11 (`EBADDEVENGINES`).

## [1.0.1] - 2026-09-12

### Changed

- Lockstep patch to verify tag-triggered OIDC publish (`v1.0.1`).

## [1.0.0] - 2026-09-11

First `@qntx/oxlint` and `@qntx/oxfmt` release. Git tag is `v1.0.0`.

### Added

- `@qntx/oxlint` `config`, `react`, `merge` — native TypeScript / ESLint / import / node / oxc / promise / unicorn / vitest table. `react` adds native `react` / `jsx-a11y` / `react-perf`.
- `@qntx/oxfmt` `fmt` — every Oxfmtrc key explicit (`printWidth: 100`, double quotes, semicolons, `sortImports` on).
- Vite+ composition: `{ lint: react, fmt }` for React apps, `{ lint: config, fmt }` for libraries.
- Publish (OIDC, both packages) and GitHub Release callers on `v*.*.*`. `cliff.toml` `tag_pattern = "v[0-9].*"`.

### Changed

- Repository is a bun Vite+ monorepo. Packages live under `packages/oxlint` and `packages/oxfmt`.
- Type-safety and correctness rules are `error` (`no-explicit-any`, `no-non-null-assertion`, `strict-boolean-expressions`, `no-unsafe-*`, React Compiler native). Test overlay matches Clippy unwrap-in-tests.
- XOR: `eslint/sort-imports` off, `unicorn/empty-brace-spaces` off. `import/newline-after-import` stays `error`.
- The sibling `qntx/oxfmt` starter is superseded by `packages/oxfmt`.

[Unreleased]: https://github.com/qntx/oxc/compare/v1.0.4...HEAD
[1.0.4]: https://github.com/qntx/oxc/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/qntx/oxc/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/qntx/oxc/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/qntx/oxc/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/qntx/oxc/releases/tag/v1.0.0
