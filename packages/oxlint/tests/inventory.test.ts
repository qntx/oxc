import { spawnSync } from "node:child_process";

import { expect, test } from "vite-plus/test";

import { config } from "../src/config.ts";
import { react } from "../src/react.ts";
import { isRecord, oxlintCli } from "./support.ts";

type RuleJson = {
  category: string;
  scope: string;
  value: string;
};

function isRuleJson(value: unknown): value is RuleJson {
  return (
    isRecord(value) &&
    typeof value["category"] === "string" &&
    typeof value["scope"] === "string" &&
    typeof value["value"] === "string"
  );
}

function asRuleList(value: unknown): RuleJson[] {
  if (!Array.isArray(value)) {
    throw new TypeError("oxlint --rules did not print a JSON array");
  }
  return value.filter(isRuleJson);
}

test("every non-nursery rule of enabled plugins is explicit", () => {
  const result = spawnSync(oxlintCli(), ["--rules", "--format=json"], { encoding: "utf8" });
  expect(result.error).toBeUndefined();
  expect(result.stderr).toBe("");
  expect(result.status).toBe(0);

  const rules = asRuleList(JSON.parse(result.stdout));
  expect(rules.length).toBeGreaterThan(0);

  const listed = new Set([...Object.keys(config.rules), ...Object.keys(react.rules)]);
  const enabled = new Set<string>([...config.plugins, ...react.plugins]);

  const missing = rules
    .filter((rule) => rule.category !== "nursery")
    .filter((rule) => enabled.has(rule.scope.replaceAll("_", "-")))
    .map((rule) => `${rule.scope.replaceAll("_", "-")}/${rule.value}`)
    .filter((id) => !listed.has(id));

  expect(missing).toStrictEqual([]);
});
