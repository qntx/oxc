import { expect, test } from "bun:test";

import type { OxfmtConfig } from "oxfmt";

import { fmt } from "./src/index.ts";

test("object-valued settings extend without narrowing", () => {
  const extended: OxfmtConfig = {
    ...fmt,
    sortImports: {
      ...fmt.sortImports,
      internalPattern: [...fmt.sortImports.internalPattern, "@app/"],
    },
    sortTailwindcss: {
      ...fmt.sortTailwindcss,
      functions: [...fmt.sortTailwindcss.functions, "tv"],
    },
    sortPackageJson: { ...fmt.sortPackageJson, sortScripts: !fmt.sortPackageJson.sortScripts },
  };

  expect(extended).toMatchObject({
    sortImports: { internalPattern: [...fmt.sortImports.internalPattern, "@app/"] },
    sortTailwindcss: { functions: [...fmt.sortTailwindcss.functions, "tv"] },
    sortPackageJson: { sortScripts: true },
  });
  expect(fmt.sortTailwindcss.functions).toContain("cn");
  expect(fmt.sortPackageJson.sortScripts).toBe(false);
});
