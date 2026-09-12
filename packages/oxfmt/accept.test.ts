import { expect, test } from "bun:test";

import { format } from "oxfmt";

import { fmt } from "./src/index.ts";

test("oxfmt.format accepts the exported config", async () => {
  const result = await format("file.ts", "const x=1\n", fmt);

  expect(result.errors).toEqual([]);
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

  expect(result.errors).toEqual([]);
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

  expect(result.errors).toEqual([]);
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

  expect(result.errors).toEqual([]);
  expect(result.code).toBe(`import fs from "node:fs";

import { x } from "lodash";

import { y } from "@qntx/foo";
export const a = 1;
`);
});
