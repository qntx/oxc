# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-09-15

### Added

- `@qntx/oxc` — single-package shareable Oxlint config (`config`, `react`, `merge`).

### Removed

- `@qntx/oxfmt` shareable formatter package. Use Vite+ `fmt: {}`.
- `@qntx/oxlint` package name. Use `@qntx/oxc`.

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

[Unreleased]: https://github.com/qntx/oxc/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/qntx/oxc/compare/v1.0.2...v1.1.0
[1.0.2]: https://github.com/qntx/oxc/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/qntx/oxc/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/qntx/oxc/releases/tag/v1.0.0
