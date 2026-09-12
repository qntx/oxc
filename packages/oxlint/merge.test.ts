import { describe, expect, test } from "bun:test";

import { config } from "./src/config.ts";
import { merge } from "./src/merge.ts";
import { react } from "./src/react.ts";

describe("merge", () => {
  test("undefined deletes a key", () => {
    expect(merge({ ignorePatterns: ["dist/**"] }, { ignorePatterns: undefined })).toEqual({});
  });

  test("empty ignorePatterns replaces", () => {
    expect(merge({ ignorePatterns: ["dist/**"] }, { ignorePatterns: [] })).toEqual({
      ignorePatterns: [],
    });
  });

  test("empty plugins replaces", () => {
    expect(merge({ plugins: ["vitest"] }, { plugins: [] })).toEqual({
      plugins: [],
    });
  });

  test("react includes core plugins", () => {
    expect(react.plugins).toEqual(
      expect.arrayContaining(["eslint", "typescript", "jsx-a11y", "react", "react-perf"]),
    );
    expect(config.overrides).toHaveLength(3);
    expect(react.overrides).toHaveLength(4);
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
    ).toEqual([
      { name: "react-x", specifier: "new" },
      { name: "keep", specifier: "keep" },
    ]);
  });
});
