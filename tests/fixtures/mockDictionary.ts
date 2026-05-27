import type { Dictionary } from "@/i18n/types";
import { dictionary } from "@/i18n/dictionaries/en";

/**
 * Shared, complete mock Dictionary for tests.
 * Derived from the English dictionary so it always matches the current
 * Dictionary type without manually maintaining inline partial literals.
 */
export const mockDictionary: Dictionary = dictionary;
