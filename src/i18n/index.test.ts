import { describe, it, expect } from "vitest";
import { getDictionary, deepMerge, type Locale } from "./index";

describe("deepMerge", () => {
  it("should merge missing keys from fallback", () => {
    const target = { a: 1, b: undefined as number | undefined };
    const fallback = { a: 2, b: 3 };
    const result = deepMerge(target as unknown as Record<string, unknown>, fallback as unknown as Record<string, unknown>);
    expect(result).toEqual({ a: 1, b: 3 });
  });

  it("should deeply merge nested objects", () => {
    const target = { nav: { home: "Home", search: undefined as string | undefined } };
    const fallback = { nav: { home: "Inicio", search: "Buscar" } };
    const result = deepMerge(target as unknown as Record<string, unknown>, fallback as unknown as Record<string, unknown>);
    expect(result).toEqual({ nav: { home: "Home", search: "Buscar" } });
  });

  it("should not mutate original objects", () => {
    const target = { a: 1 };
    const fallback = { b: 2 };
    deepMerge(target as unknown as Record<string, unknown>, fallback as unknown as Record<string, unknown>);
    expect(target).toEqual({ a: 1 });
    expect(fallback).toEqual({ b: 2 });
  });

  it("should return fallback when target is empty", () => {
    const result = deepMerge({}, { a: 1 });
    expect(result).toEqual({ a: 1 });
  });

  it("should not deeply merge arrays", () => {
    const target = { tags: ["a"] };
    const fallback = { tags: ["b", "c"] };
    const result = deepMerge(target as unknown as Record<string, unknown>, fallback as unknown as Record<string, unknown>);
    expect(result).toEqual({ tags: ["a"] });
  });

  it("should handle null values without crashing", () => {
    const target = { a: null, b: { c: 1 } };
    const fallback = { a: { d: 2 }, b: { c: 3, e: 4 } };
    const result = deepMerge(target as unknown as Record<string, unknown>, fallback as unknown as Record<string, unknown>);
    expect(result).toEqual({ a: null, b: { c: 1, e: 4 } });
  });
});

describe("getDictionary", () => {
  it("should return Spanish dictionary for 'es'", async () => {
    const dict = await getDictionary("es");
    expect(dict.app.title).toBe("MyReelMind");
    expect(dict.nav.home).toBe("Inicio");
  });

  it("should return English dictionary for 'en'", async () => {
    const dict = await getDictionary("en");
    expect(dict.app.title).toBe("MyReelMind");
    expect(dict.nav.home).toBe("Home");
  });

  it("should fall back to Spanish for unsupported locale", async () => {
    const dict = await getDictionary("fr" as Locale);
    expect(dict.nav.home).toBe("Inicio");
  });

  it("should deeply merge English with Spanish fallback", async () => {
    const dict = await getDictionary("en");
    const esDict = await getDictionary("es");

    const checkKeys = (obj: Record<string, unknown>, source: Record<string, unknown>) => {
      Object.keys(obj).forEach((key) => {
        expect(source).toHaveProperty(key);
        if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
          checkKeys(obj[key] as Record<string, unknown>, source[key] as Record<string, unknown>);
        }
      });
    };
    checkKeys(esDict as unknown as Record<string, unknown>, dict as unknown as Record<string, unknown>);
  });

  it("should define library.kicker and library.subtitle in both locales", async () => {
    const enDict = await getDictionary("en");
    const esDict = await getDictionary("es");

    for (const dict of [enDict, esDict]) {
      expect(typeof dict.library.kicker).toBe("string");
      expect(dict.library.kicker.length).toBeGreaterThan(0);
      expect(typeof dict.library.subtitle).toBe("string");
      expect(dict.library.subtitle.length).toBeGreaterThan(0);
    }
  });

  it("should define settings.kicker and settings.subtitle in both locales", async () => {
    const enDict = await getDictionary("en");
    const esDict = await getDictionary("es");

    for (const dict of [enDict, esDict]) {
      expect(typeof dict.settings.kicker).toBe("string");
      expect(dict.settings.kicker.length).toBeGreaterThan(0);
      expect(typeof dict.settings.subtitle).toBe("string");
      expect(dict.settings.subtitle.length).toBeGreaterThan(0);
    }
  });

  it("should define profile.kicker and profile.subtitle in both locales", async () => {
    const enDict = await getDictionary("en");
    const esDict = await getDictionary("es");

    for (const dict of [enDict, esDict]) {
      expect(typeof dict.profile.kicker).toBe("string");
      expect(dict.profile.kicker.length).toBeGreaterThan(0);
      expect(typeof dict.profile.subtitle).toBe("string");
      expect(dict.profile.subtitle.length).toBeGreaterThan(0);
    }
  });

  it("should define search.nowShowingHead in both locales", async () => {
    const enDict = await getDictionary("en");
    const esDict = await getDictionary("es");

    expect(typeof enDict.search.nowShowingHead).toBe("string");
    expect(enDict.search.nowShowingHead.length).toBeGreaterThan(0);
    expect(typeof esDict.search.nowShowingHead).toBe("string");
    expect(esDict.search.nowShowingHead.length).toBeGreaterThan(0);
  });
});
