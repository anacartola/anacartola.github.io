import { pt } from "./pt";
import { en } from "./en";
import { fr } from "./fr";
import { zh } from "./zh";

/** Ordered by content priority: PT (native) · EN (target market) · FR · ZH. */
export const LOCALES = ["pt", "en", "fr", "zh"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "pt";

/** Prefixed locales (everything except the unprefixed default). Drives [lang]. */
export const SECONDARY_LOCALES = LOCALES.filter(
  (l) => l !== DEFAULT_LOCALE,
) as Exclude<Locale, "pt">[];

/** Locales served with a learning-stage disclaimer banner. */
export const LEARNING_LOCALES: Locale[] = ["fr", "zh"];

/** BCP-47 tags for <html lang> and hreflang. */
export const HTML_LANG: Record<Locale, string> = {
  pt: "pt-BR",
  en: "en",
  fr: "fr",
  zh: "zh-Hans",
};

/** Human-readable names, in each locale's own language (for the switcher). */
export const LOCALE_NAMES: Record<Locale, string> = {
  pt: "Português",
  en: "English",
  fr: "Français",
  zh: "中文",
};

/** The UI dictionary shape is inferred from the PT dictionary (source of truth). */
export type Dictionary = typeof pt;

const dictionaries: Record<Locale, Dictionary> = { pt, en, fr, zh };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}
