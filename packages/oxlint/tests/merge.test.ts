import type { OxlintOverride } from "oxlint";
import { describe, expect, test } from "vite-plus/test";

import { config } from "../src/config.ts";
import { merge } from "../src/merge.ts";

describe("merge", () => {
  test("undefined deletes a key", () => {
    expect(merge({ ignorePatterns: ["dist/**"] }, { ignorePatterns: undefined })).toStrictEqual({});
  });

  test("empty ignorePatterns replaces", () => {
    expect(merge({ ignorePatterns: ["dist/**"] }, { ignorePatterns: [] })).toStrictEqual({
      ignorePatterns: [],
    });
  });

  test("empty plugins replaces", () => {
    expect(merge({ plugins: ["vitest"] }, { plugins: [] })).toStrictEqual({
      plugins: [],
    });
  });

  // Verifies the common consumer shape: appending a typed OxlintOverride to the
  // base preset's overrides.
  test("base config merges an appended override", () => {
    const patch: OxlintOverride = { files: ["x/**"], rules: { "eslint/no-console": "off" } };
    const merged = merge(config, { overrides: [patch] });
    expect(merged.overrides).toHaveLength(config.overrides.length + 1);
    expect(merged.overrides?.at(-1)).toStrictEqual(patch);
  });

  test("jsPlugins later-wins by name", () => {
    expect(
      merge(
        {
          jsPlugins: [
            { name: "react-x", specifier: "old" },
            { name: "keep", specifier: "keep" },
          ],
        },
        { jsPlugins: [{ name: "react-x", specifier: "new" }] },
      ).jsPlugins,
    ).toStrictEqual([
      { name: "react-x", specifier: "new" },
      { name: "keep", specifier: "keep" },
    ]);
  });
});
