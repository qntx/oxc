import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { expect, test } from "vite-plus/test";

import { fmt } from "../packages/oxfmt/src/index.ts";
import { config } from "../packages/oxlint/src/index.ts";

const requireOxlint = createRequire(new URL("../packages/oxlint/package.json", import.meta.url));
const requireOxfmt = createRequire(new URL("../packages/oxfmt/package.json", import.meta.url));

function oxlintCli(): string {
  return join(dirname(requireOxlint.resolve("oxlint/package.json")), "bin/oxlint");
}

type OxfmtFormat = (
  fileName: string,
  sourceText: string,
  options: typeof fmt,
) => Promise<{ code: string; errors: unknown[] }>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOxfmtFormat(value: unknown): value is OxfmtFormat {
  return typeof value === "function";
}

function oxfmtFormat(): OxfmtFormat {
  const loaded: unknown = requireOxfmt("oxfmt");
  if (!isRecord(loaded) || !isOxfmtFormat(loaded["format"])) {
    throw new Error("oxfmt.format is missing");
  }
  return loaded["format"];
}

function lintCodes(source: string): string[] {
  const dir = mkdtempSync(join(tmpdir(), "oxlint-xor-"));
  const rc = join(dir, ".oxlintrc.json");
  const file = join(dir, "file.ts");

  writeFileSync(
    rc,
    `${JSON.stringify({
      ...config,
      // tmp cwd has no tsgolint; XOR rules are syntactic
      options: { ...config.options, typeAware: false, typeCheck: false },
    })}\n`,
  );
  writeFileSync(file, source);

  const result = spawnSync(oxlintCli(), ["-c", rc, "-f", "json", file], {
    cwd: dir,
    encoding: "utf8",
  });
  const parsed: unknown = JSON.parse(result.stdout);
  const diagnostics = isRecord(parsed) ? parsed["diagnostics"] : undefined;
  if (!Array.isArray(diagnostics)) {
    throw new TypeError(result.stdout + result.stderr);
  }

  return diagnostics.flatMap((item) =>
    isRecord(item) && typeof item["code"] === "string" ? [item["code"]] : [],
  );
}

test("printer-owned rules stay off; newline-after-import stays error", () => {
  expect(config.rules).toStrictEqual(
    expect.objectContaining({
      "eslint/sort-imports": "off",
      "unicorn/empty-brace-spaces": "off",
      "unicorn/no-nested-ternary": "off",
      "unicorn/number-literal-case": "off",
      "import/newline-after-import": "error",
      "eslint/one-var": "off",
      "eslint/max-lines": "off",
      "import/no-default-export": "off",
    }),
  );
});

test("oxlint does not report empty-brace-spaces on {} / function f() {}", () => {
  const object = lintCodes("export const o = {};\n");
  expect(object).toStrictEqual([]);

  const fn = lintCodes("function f() {}\nexport { f };\n");
  expect(fn).not.toContain("unicorn(empty-brace-spaces)");
});

test("oxfmt output is lint-clean for hex case and nested ternaries", async () => {
  const format = oxfmtFormat();
  const result = await format(
    "file.ts",
    `export const mask = 0xFF;
export const big = 0xABCDn;
export const sep = 0xFF_FF;
export const prefix = 0XFF;
export const exp = 1E+10;
export const bin = 0B1010;
export const oct = 0O77;

export function sign(value: number): string {
  return value > 0 ? "p" : (value < 0 ? "n" : "z");
}

export function magnitude(left: number, right: number): string {
  return (left > 0 ? left : right) > 1 ? "y" : "n";
}
`,
    fmt,
  );

  expect(result.errors).toStrictEqual([]);
  expect(result.code).toBe(`export const mask = 0xff;
export const big = 0xabcdn;
export const sep = 0xff_ff;
export const prefix = 0xff;
export const exp = 1e10;
export const bin = 0b1010;
export const oct = 0o77;

export function sign(value: number): string {
  return value > 0 ? "p" : value < 0 ? "n" : "z";
}

export function magnitude(left: number, right: number): string {
  return (left > 0 ? left : right) > 1 ? "y" : "n";
}
`);
  expect(lintCodes(result.code)).toStrictEqual([]);
});

test("import/newline-after-import still errors if the blank line is missing", () => {
  const missing = lintCodes(`import { x } from "./x.ts";
export const y = 1;
`);
  expect(missing).toContain("import(newline-after-import)");

  const present = lintCodes(`import { x } from "./x.ts";

export const y = 1;
`);
  expect(present).not.toContain("import(newline-after-import)");
});
