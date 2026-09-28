import { expect, test } from "bun:test";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { OxlintConfig } from "oxlint";

import { react } from "./src/react.ts";

function oxlintCli(): string {
  return join(dirname(fileURLToPath(import.meta.resolve("oxlint/package.json"))), "bin/oxlint");
}

type Label = { span: { line: number; column: number } };

type Diagnostic = {
  code: string;
  filename: string;
  help?: string;
  labels: Label[];
  message: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isLabel(value: unknown): value is Label {
  return (
    isRecord(value) &&
    isRecord(value.span) &&
    typeof value.span.line === "number" &&
    typeof value.span.column === "number"
  );
}

function isDiagnostic(value: unknown): value is Diagnostic {
  return (
    isRecord(value) &&
    typeof value.code === "string" &&
    typeof value.filename === "string" &&
    (value.help === undefined || typeof value.help === "string") &&
    Array.isArray(value.labels) &&
    value.labels.every(isLabel)
  );
}

const restrictedCodes = new Set([
  "eslint(no-restricted-imports)",
  "eslint(no-restricted-properties)",
]);

async function lint(fixtures: Record<string, string>): Promise<Diagnostic[]> {
  const dir = await mkdtemp(join(tmpdir(), "oxlint-react-"));
  const rc = join(dir, ".oxlintrc.json");
  // Type-aware mode needs a tsconfig project; these fixtures live in a bare tmp dir.
  const config: OxlintConfig = {
    ...react,
    options: { ...react.options, typeAware: false, typeCheck: false },
  };

  const paths = Object.keys(fixtures).map((name) => join(dir, name));

  async function writeFixture([name, source]: [string, string]): Promise<void> {
    await writeFile(join(dir, name), source);
  }

  await Promise.all([
    writeFile(rc, `${JSON.stringify(config)}\n`),
    ...Object.entries(fixtures).map(writeFixture),
  ]);

  const result = Bun.spawnSync([oxlintCli(), "-c", rc, "--format=json", ...paths], {
    cwd: dir,
    stderr: "pipe",
    stdout: "pipe",
  });

  expect(result.stdout.length > 0, result.stderr.toString()).toBe(true);

  const parsed: unknown = JSON.parse(result.stdout.toString());
  const diagnostics =
    isRecord(parsed) && Array.isArray(parsed.diagnostics) ? parsed.diagnostics : [];

  return diagnostics.filter(isDiagnostic);
}

function at(diagnostics: Diagnostic[], code: string, filename: string): Diagnostic[] {
  return diagnostics.filter((d) => d.code === code && d.filename.endsWith(filename));
}

test("react forbids manual memoization", async () => {
  const diagnostics = await lint({
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

  expect(reactDot.map((d) => [d.labels[0].span.line, d.labels[0].span.column])).toEqual([
    [2, 18],
    [3, 18],
    [4, 18],
  ]);
});

const bannedCodes = new Set([
  "eslint(no-restricted-imports)",
  "eslint(no-restricted-properties)",
  "react(hook-use-state)",
  "react(jsx-no-constructed-context-values)",
]);

test("react allows compiler-era idioms", async () => {
  const diagnostics = await lint({
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

  expect(diagnostics.filter((d) => bannedCodes.has(d.code))).toEqual([]);
  expect(diagnostics.filter((d) => d.code.includes("react-perf"))).toEqual([]);
  expect(diagnostics.filter((d) => d.code.includes("react_perf"))).toEqual([]);
});
