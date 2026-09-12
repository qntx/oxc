import type { ExternalPluginEntry, OxlintConfig } from "oxlint";

const REPLACE_IF_EMPTY = new Set(["ignorePatterns", "plugins", "jsPlugins", "overrides"]);

export function merge(...parts: Array<OxlintConfig | undefined>): OxlintConfig {
  const out: OxlintConfig = {};

  for (const part of parts) {
    if (part === undefined) {
      continue;
    }

    for (const key of Object.keys(part)) {
      const value: unknown = Reflect.get(part, key);

      if (value === undefined || value === null) {
        Reflect.deleteProperty(out, key);
        continue;
      }

      const prev: unknown = Reflect.get(out, key);

      if (Array.isArray(value) && value.length === 0 && REPLACE_IF_EMPTY.has(key)) {
        assign(out, key, []);
        continue;
      }

      if (key === "jsPlugins" && Array.isArray(prev) && Array.isArray(value)) {
        const plugins = new Map<string, ExternalPluginEntry>();

        for (const plugin of [...pluginEntries(prev), ...pluginEntries(value)]) {
          plugins.set(typeof plugin === "string" ? plugin : plugin.name, plugin);
        }

        out.jsPlugins = [...plugins.values()];
        continue;
      }

      if (Array.isArray(prev) && Array.isArray(value)) {
        assign(out, key, uniqueConcat(prev, value));
        continue;
      }

      if (isPlain(prev) && isPlain(value)) {
        const next: Record<string, unknown> = { ...prev };

        for (const [nestedKey, nestedValue] of Object.entries(value)) {
          if (nestedValue === undefined || nestedValue === null) {
            Reflect.deleteProperty(next, nestedKey);
          } else {
            next[nestedKey] = nestedValue;
          }
        }

        assign(out, key, next);
        continue;
      }

      assign(out, key, value);
    }
  }

  return out;
}

function uniqueConcat(left: unknown[], right: unknown[]): unknown[] {
  const seen = new Set<unknown>();
  const result: unknown[] = [];

  for (const item of [...copyUnknownArray(left), ...copyUnknownArray(right)]) {
    if (seen.has(item)) {
      continue;
    }

    seen.add(item);
    result.push(item);
  }

  return result;
}

function copyUnknownArray(value: unknown[]): unknown[] {
  return value.map((item: unknown) => item);
}

function assign(out: OxlintConfig, key: string, value: unknown): void {
  Object.assign(out, { [key]: value });
}

function pluginEntries(value: unknown[]): ExternalPluginEntry[] {
  const entries: ExternalPluginEntry[] = [];

  for (const item of value) {
    if (typeof item === "string") {
      entries.push(item);
      continue;
    }

    if (isPlain(item) && typeof item.name === "string" && typeof item.specifier === "string") {
      entries.push({ name: item.name, specifier: item.specifier });
    }
  }

  return entries;
}

function isPlain(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
