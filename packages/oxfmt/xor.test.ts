import { expect, test } from "bun:test";

import { format } from "oxfmt";

import { fmt } from "./src/index.ts";

test("sortImports is on; semi, double quotes, printWidth 100", () => {
  expect(fmt.sortImports).toBeDefined();
  expect(fmt.sortImports).not.toBe(false);
  expect(fmt.semi).toBe(true);
  expect(fmt.singleQuote).toBe(false);
  expect(fmt.printWidth).toBe(100);
});

test("empty braces print as {} / function f() {} without interior spaces", async () => {
  const object = await format("file.ts", "const o = { };\n", fmt);
  expect(object.errors).toEqual([]);
  expect(object.code).toBe("const o = {};\n");

  const fn = await format("file.ts", "function f() { }\n", fmt);
  expect(fn.errors).toEqual([]);
  expect(fn.code).toBe("function f() {}\n");
});

test("does not insert a blank line after the last import", async () => {
  const result = await format(
    "file.ts",
    `import { y } from "./y.ts";
export const z = 1;
`,
    fmt,
  );

  expect(result.errors).toEqual([]);
  expect(result.code).toBe(`import { y } from "./y.ts";
export const z = 1;
`);
});
