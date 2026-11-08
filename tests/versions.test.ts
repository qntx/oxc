import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

import { expect, test } from "vite-plus/test";

const requireOxlint = createRequire(new URL("../packages/oxlint/package.json", import.meta.url));

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function loadJson(path: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(readFileSync(path, "utf8"));
  if (!isRecord(parsed)) {
    throw new Error(`${path} is not a JSON object`);
  }
  return parsed;
}

function dep(pkg: Record<string, unknown>, section: string, name: string): string {
  const table = pkg[section];
  if (!isRecord(table)) {
    throw new Error(`${section} is missing`);
  }
  const version = table[name];
  if (typeof version !== "string") {
    throw new TypeError(`${section}.${name} is missing`);
  }
  return version;
}

function versionOf(pkg: Record<string, unknown>): string {
  const { version } = pkg;
  if (typeof version !== "string") {
    throw new TypeError("version is missing");
  }
  return version;
}

const vitePlus = loadJson(requireOxlint.resolve("vite-plus/package.json"));
const oxlintPkg = loadJson(requireOxlint.resolve("./package.json"));
const oxfmtPkg = loadJson(
  createRequire(new URL("../packages/oxfmt/package.json", import.meta.url)).resolve(
    "./package.json",
  ),
);

const oxlintPin = dep(vitePlus, "dependencies", "oxlint").replace(/^=/, "");
const tsgolintPin = dep(vitePlus, "dependencies", "oxlint-tsgolint").replace(/^=/, "");
const oxfmtPin = dep(vitePlus, "dependencies", "oxfmt").replace(/^=/, "");

test("devDependency versions equal the vite-plus pins", () => {
  expect(dep(oxlintPkg, "devDependencies", "oxlint")).toBe(oxlintPin);
  expect(dep(oxlintPkg, "devDependencies", "oxlint-tsgolint")).toBe(tsgolintPin);
  expect(dep(oxfmtPkg, "devDependencies", "oxfmt")).toBe(oxfmtPin);
});

test("peer floors match the vite-plus pins", () => {
  expect(dep(oxlintPkg, "peerDependencies", "oxlint")).toBe(`^${oxlintPin}`);
  expect(dep(oxlintPkg, "peerDependencies", "oxlint-tsgolint")).toBe(`>=${tsgolintPin}`);
  expect(dep(oxfmtPkg, "peerDependencies", "oxfmt")).toBe(`>=${oxfmtPin} <1.0.0`);
});

test("package versions are lockstep", () => {
  expect(versionOf(oxlintPkg)).toBe(versionOf(oxfmtPkg));
});
