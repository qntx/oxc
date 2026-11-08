import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { expect, test } from "vite-plus/test";

import { config } from "../src/config.ts";
import { react } from "../src/react.ts";
import { oxlintCli } from "./support.ts";

const packageRoot = join(import.meta.dirname, "..");

test.each([
  ["config", config],
  ["react", react],
])("oxlint accepts the exported %s preset type-aware", (_name, preset) => {
  const dir = mkdtempSync(join(tmpdir(), "oxlint-accept-"));
  const rc = join(dir, ".oxlintrc.json");
  writeFileSync(rc, `${JSON.stringify(preset)}\n`);

  const result = spawnSync(oxlintCli(), ["-c", rc, "src/index.ts"], {
    cwd: packageRoot,
    encoding: "utf8",
  });

  expect(result.error).toBeUndefined();
  expect(result.stderr).toBe("");
  expect(result.status).toBe(0);
});
