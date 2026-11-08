import { format } from "oxfmt";
import { expect, test } from "vite-plus/test";

import { fmt } from "../src/index.ts";

test("oxfmt.format accepts the exported config", async () => {
  const result = await format("file.ts", "const x=1\n", fmt);

  expect(result.errors).toStrictEqual([]);
  expect(result.code).toBe("const x = 1;\n");
});

test("sortImports groups builtin before relative and does not insert a blank after the last import", async () => {
  const result = await format(
    "file.ts",
    `import { z } from "./z.ts";
import fs from "node:fs";
import { y } from "./y.ts";
export const a = 1;
`,
    fmt,
  );

  expect(result.errors).toStrictEqual([]);
  expect(result.code).toBe(`import fs from "node:fs";

import { y } from "./y.ts";
import { z } from "./z.ts";
export const a = 1;
`);
});

test("sortSideEffects leaves side-effect imports in source order", async () => {
  const result = await format(
    "file.ts",
    `import "./b.ts";
import "./a.ts";
import { z } from "./z.ts";
import { a } from "./a.ts";
`,
    fmt,
  );

  expect(result.errors).toStrictEqual([]);
  expect(result.code).toBe(`import "./b.ts";
import "./a.ts";
import { a } from "./a.ts";
import { z } from "./z.ts";
`);
});

test("internalPattern treats @qntx/ as internal", async () => {
  const result = await format(
    "file.ts",
    `import { x } from "lodash";
import { y } from "@qntx/foo";
import fs from "node:fs";
export const a = 1;
`,
    fmt,
  );

  expect(result.errors).toStrictEqual([]);
  expect(result.code).toBe(`import fs from "node:fs";

import { x } from "lodash";

import { y } from "@qntx/foo";
export const a = 1;
`);
});

test("empty braces print as {} / function f() {} without interior spaces", async () => {
  const object = await format("file.ts", "const o = { };\n", fmt);
  expect(object.errors).toStrictEqual([]);
  expect(object.code).toBe("const o = {};\n");

  const fn = await format("file.ts", "function f() { }\n", fmt);
  expect(fn.errors).toStrictEqual([]);
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

  expect(result.errors).toStrictEqual([]);
  expect(result.code).toBe(`import { y } from "./y.ts";
export const z = 1;
`);
});
