import type {
  OxfmtConfig,
  SortImportsConfig,
  SortPackageJsonConfig,
  SortTailwindcssConfig,
} from "oxfmt";

type FmtObjects = {
  sortImports: SortImportsConfig &
    Required<
      Pick<
        SortImportsConfig,
        | "customGroups"
        | "ignoreCase"
        | "internalPattern"
        | "newlinesBetween"
        | "order"
        | "partitionByComment"
        | "partitionByNewline"
        | "sortSideEffects"
      >
    >;
  sortPackageJson: SortPackageJsonConfig & Required<Pick<SortPackageJsonConfig, "sortScripts">>;
  sortTailwindcss: SortTailwindcssConfig &
    Required<
      Pick<
        SortTailwindcssConfig,
        "attributes" | "functions" | "preserveDuplicates" | "preserveWhitespace"
      >
    >;
};

type Fmt = {
  [K in keyof Required<OxfmtConfig>]: K extends keyof FmtObjects
    ? FmtObjects[K]
    : Required<OxfmtConfig>[K];
};

/**
 * Every Oxfmtrc key is present (`Required`), and the object-valued settings are typed as the
 * objects the preset ships, so consumers extend them (e.g. `fmt.sortImports.internalPattern`)
 * without narrowing the `boolean | …Config` unions. Nested keys are `Pick`ed rather than `Required`
 * because the declaration resolves against the consumer's oxfmt version, and `groups` is left to
 * the library default.
 */
export const fmt: Fmt = {
  arrowParens: "always",
  bracketSameLine: false,
  bracketSpacing: true,
  embeddedLanguageFormatting: "auto",
  endOfLine: "lf", // Git/CI; rustfmt Auto is wrong on Windows checkouts
  experimentalOperatorPosition: "end",
  htmlWhitespaceSensitivity: "css",
  ignorePatterns: [
    "**/.vite-hooks/**",
    "**/build/**",
    "**/coverage/**",
    "**/dist/**",
    "**/node_modules/**",
  ],
  insertFinalNewline: true,
  jsdoc: true, // enable defaults; do not hand-tune tag aliases
  jsxSingleQuote: false,
  objectWrap: "preserve",
  overrides: [],
  printWidth: 100, // rustfmt max_width
  proseWrap: "preserve",
  quoteProps: "as-needed",
  semi: true,
  singleAttributePerLine: false,
  singleQuote: false, // current qntx TS
  // object, not `true`/`false`: upstream default is off; XOR requires this on
  // `groups` omitted — library default is the rustfmt StdExternalCrate analogue
  sortImports: {
    customGroups: [],
    ignoreCase: true,
    internalPattern: ["~/", "@/", "#", "@qntx/"],
    newlinesBetween: true,
    order: "asc",
    partitionByComment: false,
    partitionByNewline: false,
    sortSideEffects: false, // do not reorder `import "./init"`
  },
  sortPackageJson: { sortScripts: false }, // scripts order is semantic
  sortTailwindcss: {
    functions: ["clsx", "cn", "cva", "tw"],
    attributes: [],
    preserveDuplicates: false,
    preserveWhitespace: false,
  },
  svelte: false,
  tabWidth: 2,
  trailingComma: "all",
  useTabs: false,
  vueIndentScriptAndStyle: false,
};

export { fmt as default };
