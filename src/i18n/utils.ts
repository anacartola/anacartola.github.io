import {
  DEFAULT_LOCALE,
  LOCALES,
  getDictionary,
  isLocale,
  type Dictionary,
  type Locale,
} from "./index";

/**
 * Read the active locale from a URL's first path segment.
 * PT is unprefixed (default), so `/projects` -> "pt" and `/en/projects` -> "en".
 */
export function getLangFromUrl(url: URL): Locale {
  const [, maybeLocale] = url.pathname.split("/");
  return isLocale(maybeLocale) ? maybeLocale : DEFAULT_LOCALE;
}

/** Bound translator: `const t = useTranslations(locale)` then `t.nav.home`. */
export function useTranslations(locale: Locale): Dictionary {
  return getDictionary(locale);
}

/**
 * Strip the locale prefix from a pathname, returning the canonical route
 * shared across locales (e.g. `/en/blog/foo` and `/blog/foo` -> `/blog/foo`).
 * Always begins with "/"; the site root is "/".
 */
export function getRouteWithoutLocale(url: URL): string {
  const segments = url.pathname.split("/").filter(Boolean);
  if (segments.length > 0 && isLocale(segments[0])) {
    segments.shift();
  }
  return "/" + segments.join("/");
}

/**
 * Build a locale-aware path from a canonical route.
 * Default locale (PT) stays unprefixed; others get an `/<locale>` prefix.
 */
export function localizedPath(route: string, locale: Locale): string {
  const clean = "/" + route.split("/").filter(Boolean).join("/");
  const path = clean === "/" ? "" : clean;
  const prefixed = locale === DEFAULT_LOCALE ? path : `/${locale}${path}`;
  return prefixed === "" ? "/" : prefixed;
}

/** Absolute URL for a canonical route in a given locale (for hreflang/OG). */
export function absoluteUrl(site: URL | undefined, route: string, locale: Locale): string {
  const path = localizedPath(route, locale);
  return new URL(path, site).toString();
}

/**
 * hreflang alternates for a page. `availableLocales` is the subset that
 * actually has content for this route; x-default points at the default locale.
 */
export function buildAlternates(
  site: URL | undefined,
  route: string,
  availableLocales: readonly Locale[] = LOCALES,
): { hreflang: string; href: string }[] {
  const alternates = availableLocales.map((locale) => ({
    hreflang: locale === "pt" ? "pt-BR" : locale === "zh" ? "zh-Hans" : locale,
    href: absoluteUrl(site, route, locale),
  }));
  alternates.push({ hreflang: "x-default", href: absoluteUrl(site, route, DEFAULT_LOCALE) });
  return alternates;
}
