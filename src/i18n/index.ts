export type { Dictionary } from "./types";
export type Locale = "es" | "en";

const dictionaries: Record<Locale, () => Promise<{ dictionary: import("./types").Dictionary }>> = {
  es: () => import("./dictionaries/es"),
  en: () => import("./dictionaries/en"),
};

export async function getDictionary(locale: Locale): Promise<import("./types").Dictionary> {
  const mod = await (dictionaries[locale] ?? dictionaries.es)();
  return mod.dictionary;
}

export const defaultLocale: Locale = "es";
export const locales: Locale[] = ["es", "en"];
