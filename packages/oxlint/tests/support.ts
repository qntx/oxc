import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import type { OxlintConfig } from "oxlint";

const requireHere = createRequire(import.meta.url);

export function oxlintCli(): string {
  return join(dirname(requireHere.resolve("oxlint/package.json")), "bin/oxlint");
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export type Label = { span: { line: number; column: number } };

export type Diagnostic = {
  code: string;
  filename: string;
  help?: string;
  labels: Label[];
  message: string;
};

function isLabel(value: unknown): value is Label {
  return (
    isRecord(value) &&
    isRecord(value["span"]) &&
    typeof value["span"]["line"] === "number" &&
    typeof value["span"]["column"] === "number"
  );
}

function isDiagnostic(value: unknown): value is Diagnostic {
  return (
    isRecord(value) &&
    typeof value["code"] === "string" &&
    typeof value["filename"] === "string" &&
    (value["help"] === undefined || typeof value["help"] === "string") &&
    typeof value["message"] === "string" &&
    Array.isArray(value["labels"]) &&
    value["labels"].every(isLabel)
  );
}

// Lints `fixtures` (file name → source) under `config` in a fresh tmp dir and
// returns oxlint's parsed diagnostics.
export function lint(config: OxlintConfig, fixtures: Record<string, string>): Diagnostic[] {
  const dir = mkdtempSync(join(tmpdir(), "oxlint-test-"));
  const rc = join(dir, ".oxlintrc.json");
  writeFileSync(rc, `${JSON.stringify(config)}\n`);

  const paths: string[] = [];
  for (const [name, source] of Object.entries(fixtures)) {
    const path = join(dir, name);
    writeFileSync(path, source);
    paths.push(path);
  }

  const result = spawnSync(oxlintCli(), ["-c", rc, "--format=json", ...paths], {
    cwd: dir,
    encoding: "utf8",
  });
  if (result.error !== undefined) {
    throw result.error;
  }

  const parsed: unknown = JSON.parse(result.stdout);
  const diagnostics = isRecord(parsed) ? parsed["diagnostics"] : undefined;
  if (!Array.isArray(diagnostics)) {
    throw new TypeError(`oxlint did not print diagnostics JSON: ${result.stdout}${result.stderr}`);
  }

  return diagnostics.filter(isDiagnostic);
}
