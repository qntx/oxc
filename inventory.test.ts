/* oxlint-disable vitest/no-conditional-in-test -- completeness scan */
import { expect, test } from "bun:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "./src/config.ts";
import { react } from "./src/react.ts";

type RuleJson = {
  category: string;
  scope: string;
  value: string;
};

function oxlintCli(): string {
  return join(dirname(fileURLToPath(import.meta.resolve("oxlint/package.json"))), "bin/oxlint");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isRuleJson(value: unknown): value is RuleJson {
  return (
    isRecord(value) &&
    typeof value.category === "string" &&
    typeof value.scope === "string" &&
    typeof value.value === "string"
  );
}

function ruleIds(rules: Record<string, unknown> | undefined): string[] {
  return rules === undefined ? [] : Object.keys(rules);
}

function pluginIds(plugins: unknown): string[] {
  return Array.isArray(plugins)
    ? plugins.filter((plugin): plugin is string => typeof plugin === "string")
    : [];
}

test("every non-nursery rule of enabled plugins is explicit", () => {
  const result = Bun.spawnSync([oxlintCli(), "--rules", "--format=json"], {
    stderr: "pipe",
    stdout: "pipe",
  });

  expect(result.exitCode, result.stderr.toString()).toBe(0);

  const parsed: unknown = JSON.parse(result.stdout.toString());
  expect(Array.isArray(parsed)).toBe(true);

  const rules = Array.isArray(parsed) ? parsed.filter(isRuleJson) : [];
  expect(rules.length).toBeGreaterThan(0);

  const listed = new Set([...ruleIds(config.rules), ...ruleIds(react.rules)]);
  const enabled = new Set([...pluginIds(config.plugins), ...pluginIds(react.plugins)]);

  const missing = rules.flatMap((rule) => {
    const plugin = rule.scope.replaceAll("_", "-");
    const id = `${plugin}/${rule.value}`;
    const skip = rule.category === "nursery" || !enabled.has(plugin) || listed.has(id);
    return skip ? [] : [id];
  });

  expect(missing, missing.join("\n")).toEqual([]);
});
