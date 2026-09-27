import { expect, test } from "bun:test";
import { mkdtemp, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { fmt } from "../oxfmt/src/index.ts";
import { config } from "./src/config.ts";

// Resolved from @qntx/oxfmt, which declares the oxfmt dependency. This package does not.
const requireOxfmt = createRequire(
  fileURLToPath(new URL("../oxfmt/package.json", import.meta.url)),
);

function oxlintCli(): string {
  return join(dirname(fileURLToPath(import.meta.resolve("oxlint/package.json"))), "bin/oxlint");
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
  if (!isRecord(loaded) || !isOxfmtFormat(loaded.format)) {
    throw new Error("oxfmt.format is missing");
  }
  return loaded.format;
}

async function lintCodes(source: string): Promise<string[]> {
  const dir = await mkdtemp(join(tmpdir(), "oxlint-xor-"));
  const rc = join(dir, ".oxlintrc.json");
  const file = join(dir, "file.ts");

  await writeFile(
    rc,
    `${JSON.stringify({
      ...config,
      // tmp cwd has no tsgolint; XOR rules are syntactic
      options: { ...config.options, typeAware: false, typeCheck: false },
    })}\n`,
  );
  await writeFile(file, source);

  const result = Bun.spawnSync([oxlintCli(), "-c", rc, "-f", "json", file], {
    cwd: dir,
    stderr: "pipe",
    stdout: "pipe",
  });
  const stdout = result.stdout.toString();
  const parsed: unknown = JSON.parse(stdout);
  if (!isRecord(parsed) || !Array.isArray(parsed.diagnostics)) {
    throw new Error(stdout + result.stderr.toString());
  }

  return parsed.diagnostics.flatMap((item) =>
    isRecord(item) && typeof item.code === "string" ? [item.code] : [],
  );
}

test("printer-owned rules stay off; newline-after-import stays error", () => {
  expect(config.rules["eslint/sort-imports"]).toBe("off");
  expect(config.rules["unicorn/empty-brace-spaces"]).toBe("off");
  expect(config.rules["unicorn/no-nested-ternary"]).toBe("off");
  expect(config.rules["unicorn/number-literal-case"]).toBe("off");
  expect(config.rules["import/newline-after-import"]).toBe("error");
  expect(config.rules["eslint/one-var"]).toBe("off");
  expect(config.rules["eslint/max-lines"]).toBe("off");
  expect(config.rules["import/no-default-export"]).toBe("off");
});

test("oxlint does not report empty-brace-spaces on {} / function f() {}", async () => {
  const object = await lintCodes("export const o = {};\n");
  expect(object).toEqual([]);

  const fn = await lintCodes("function f() {}\nexport { f };\n");
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

  expect(result.errors).toEqual([]);
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
  expect(await lintCodes(result.code)).toEqual([]);
});

test("import/newline-after-import still errors if the blank line is missing", async () => {
  const missing = await lintCodes(`import { x } from "./x.ts";
export const y = 1;
`);
  expect(missing).toContain("import(newline-after-import)");

  const present = await lintCodes(`import { x } from "./x.ts";

export const y = 1;
`);
  expect(present).not.toContain("import(newline-after-import)");
});
