import { expect, test } from "bun:test";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { react } from "./src/react.ts";

function oxlintCli(): string {
  return join(dirname(fileURLToPath(import.meta.resolve("oxlint/package.json"))), "bin/oxlint");
}

test("oxlint CLI is 1.82.0", () => {
  const result = Bun.spawnSync([oxlintCli(), "--version"], {
    stderr: "pipe",
    stdout: "pipe",
  });

  expect(result.exitCode, result.stderr.toString()).toBe(0);
  expect(result.stdout.toString()).toContain("1.82.0");
});

test("oxlint accepts the exported config", async () => {
  const dir = await mkdtemp(join(tmpdir(), "oxlint-config-"));
  const rc = join(dir, ".oxlintrc.json");

  await writeFile(rc, `${JSON.stringify(react)}\n`);

  const result = Bun.spawnSync([oxlintCli(), "-c", rc, "src/index.ts"], {
    cwd: import.meta.dir,
    stderr: "pipe",
    stdout: "pipe",
  });

  expect(result.exitCode, result.stdout.toString() + result.stderr.toString()).toBe(0);
});
