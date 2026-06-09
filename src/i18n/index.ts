import { cache } from "react";

export type { Dictionary } from "./types";
export type Locale = "es" | "en";

const dictionaries: Record<Locale, () => Promise<{ dictionary: import("./types").Dictionary }>> = {
  es: () => import("./dictionaries/es"),
  en: () => import("./dictionaries/en"),
};

export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  fallback: T
): T {
  const result: Record<string, unknown> = {};
  const keys = Object.keys(fallback);

  for (const key of Object.keys(target)) {
    if (!keys.includes(key)) {
      keys.push(key);
    }
  }

  for (const key of keys) {
    const targetValue = target[key];
    const fallbackValue = fallback[key];

    if (
      targetValue !== undefined &&
      typeof targetValue === "object" &&
      targetValue !== null &&
      !Array.isArray(targetValue) &&
      typeof fallbackValue === "object" &&
      fallbackValue !== null &&
      !Array.isArray(fallbackValue)
    ) {
      result[key] = deepMerge(
        targetValue as Record<string, unknown>,
        fallbackValue as Record<string, unknown>
      );
    } else if (key in target && targetValue !== undefined) {
      result[key] = targetValue;
    } else {
      result[key] = fallbackValue;
    }
  }

  return result as T;
}

export const getDictionary = cache(
  async (locale: Locale): Promise<import("./types").Dictionary> => {
    const targetMod = await (dictionaries[locale] ?? dictionaries.es)();
    const fallbackMod = dictionaries.es;

    if (locale === "es") {
      return targetMod.dictionary;
    }

    const fallback = await fallbackMod();
    return deepMerge(
      targetMod.dictionary as unknown as Record<string, unknown>,
      fallback.dictionary as unknown as Record<string, unknown>
    ) as unknown as import("./types").Dictionary;
  }
);

export const defaultLocale: Locale = "es";
export const locales: Locale[] = ["es", "en"];
