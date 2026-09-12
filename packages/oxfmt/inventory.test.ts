import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { fmt } from "./src/index.ts";

function schemaPath(): string {
  return join(
    dirname(fileURLToPath(import.meta.resolve("oxfmt/package.json"))),
    "configuration_schema.json",
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error(`${label} is not a record`);
  }
  return value;
}

function schemaKeys(): string[] {
  const parsed = asRecord(JSON.parse(readFileSync(schemaPath(), "utf8")), "schema");
  return Object.keys(asRecord(parsed.properties, "schema.properties"));
}

test("every Oxfmtrc schema key is explicit on fmt", () => {
  const keys = schemaKeys();
  expect(keys.length).toBeGreaterThan(0);

  const listed = new Set(Object.keys(fmt));
  const missing = keys.filter((key) => !listed.has(key));
  expect(missing, missing.join("\n")).toEqual([]);

  const extra = [...listed].filter((key) => !keys.includes(key));
  expect(extra, extra.join("\n")).toEqual([]);
});

test("sortImports is on", () => {
  expect(fmt.sortImports).toBeDefined();
  expect(fmt.sortImports).not.toBe(false);
  expect(fmt.sortImports).toEqual(expect.any(Object));
});
