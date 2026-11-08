import { expect, test } from "vite-plus/test";

import { config } from "../src/config.ts";
import { react } from "../src/react.ts";
import type { Diagnostic } from "./support.ts";
import { lint } from "./support.ts";

// Type-aware mode needs a tsconfig project; the lint fixtures live in a bare tmp dir.
const preset = {
  ...react,
  options: { ...react.options, typeAware: false, typeCheck: false },
};

const restrictedCodes = new Set([
  "eslint(no-restricted-imports)",
  "eslint(no-restricted-properties)",
]);

const bannedCodes = new Set([
  "eslint(no-restricted-imports)",
  "eslint(no-restricted-properties)",
  "react(hook-use-state)",
  "react(jsx-no-constructed-context-values)",
]);

function at(diagnostics: Diagnostic[], code: string, filename: string): Diagnostic[] {
  return diagnostics.filter((d) => d.code === code && d.filename.endsWith(filename));
}

test("react is the base preset plus the react plugin overlay", () => {
  expect(react.plugins).toStrictEqual([...config.plugins, "jsx-a11y", "react"]);
  expect(react.overrides).toHaveLength(config.overrides.length + 1);
  expect(Object.keys(react.rules)).toStrictEqual(expect.arrayContaining(Object.keys(config.rules)));
});

test("react forbids manual memoization", () => {
  const diagnostics = lint(preset, {
    "default.tsx": [
      'import React from "react";',
      "export const a = React.useMemo(() => 1, []);",
      "export const b = React.useCallback(() => 1, []);",
      "export const c = React.memo(function C() { return null; });",
    ].join("\n"),
    "named.tsx": 'import { memo, useCallback as cb, useMemo } from "react";',
    "namespace.tsx": 'import * as React from "react";\nexport type { React };',
    "reexport.tsx": 'export { memo as m } from "react";',
  });

  for (const diagnostic of diagnostics.filter((d) => restrictedCodes.has(d.code))) {
    expect(diagnostic.help).toContain("useEffectEvent");
  }

  expect(at(diagnostics, "eslint(no-restricted-imports)", "named.tsx")).toHaveLength(3);
  expect(at(diagnostics, "eslint(no-restricted-imports)", "reexport.tsx")).toHaveLength(1);
  expect(at(diagnostics, "eslint(no-restricted-imports)", "namespace.tsx")).toHaveLength(1);
  // The default import itself is not restricted; only the React.* accesses are.
  expect(at(diagnostics, "eslint(no-restricted-imports)", "default.tsx")).toHaveLength(0);

  const reactDot = at(diagnostics, "eslint(no-restricted-properties)", "default.tsx");

  expect(reactDot.map((d) => [d.labels[0]?.span.line, d.labels[0]?.span.column])).toStrictEqual([
    [2, 18],
    [3, 18],
    [4, 18],
  ]);
});

test("react allows compiler-era idioms", () => {
  const diagnostics = lint(preset, {
    "ok.tsx": [
      'import type * as React from "react";',
      'import { type useMemo, createContext, useState } from "react";',
      "",
      "export type Node = React.ReactNode;",
      "export type UseMemo = typeof useMemo;",
      "",
      "const Ctx = createContext({ a: 0 });",
      "",
      "export function List({ items }: { items: number[] }) {",
      "  return <span>{items.length}</span>;",
      "}",
      "",
      "export function Provider({ a, b }: { a: number; b: number }) {",
      "  const [store] = useState(() => new Map<string, number>());",
      "  return (",
      "    <Ctx value={{ a }}>",
      "      <List items={[a, b, store.size]} />",
      "    </Ctx>",
      "  );",
      "}",
    ].join("\n"),
  });

  expect(diagnostics.filter((d) => bannedCodes.has(d.code))).toStrictEqual([]);
  expect(diagnostics.filter((d) => d.code.includes("react-perf"))).toStrictEqual([]);
  expect(diagnostics.filter((d) => d.code.includes("react_perf"))).toStrictEqual([]);
});
