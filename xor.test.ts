import { expect, test } from "bun:test";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "./src/config.ts";

function oxlintCli(): string {
  return join(dirname(fileURLToPath(import.meta.resolve("oxlint/package.json"))), "bin/oxlint");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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
