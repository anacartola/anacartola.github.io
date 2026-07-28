// ============================================================
// src/lib/resources.ts — camada de conteúdo dos Recursos.
// Self-contained de propósito: reimplementa os 3 helpers privados
// (baseSlug / groupBySlug / resolveForLocale) com a MESMA semântica
// de src/lib/content.ts, para você NÃO precisar editar content.ts.
// Se preferir centralizar, exporte esses helpers de content.ts e
// importe-os aqui — o comportamento é idêntico (mesma cadeia de
// fallback: locale pedido → EN → PT → qualquer; mesmo availableLocales).
// ============================================================
import { getCollection, type CollectionEntry } from "astro:content";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "../i18n";
import type { Localized } from "./content";

export type ResourceEntry = CollectionEntry<"resources">;

const LANG_SUFFIX = /\.(pt|en|fr|zh)$/;
const baseSlug = (id: string): string => id.replace(LANG_SUFFIX, "");

function groupBySlug(entries: ResourceEntry[]): Map<string, Map<Locale, ResourceEntry>> {
  const map = new Map<string, Map<Locale, ResourceEntry>>();
  for (const entry of entries) {
    const slug = baseSlug(entry.id);
    if (!map.has(slug)) map.set(slug, new Map());
    map.get(slug)!.set(entry.data.lang, entry);
  }
  return map;
}

function resolveForLocale(
  byLang: Map<Locale, ResourceEntry>,
  slug: string,
  requestedLocale: Locale,
): Localized<ResourceEntry> | undefined {
  const chain: Locale[] = [requestedLocale, "en", DEFAULT_LOCALE];
  const availableLocales = LOCALES.filter((l) => byLang.has(l));
  for (const l of chain) {
    const entry = byLang.get(l);
    if (entry) {
      return { slug, entry, lang: l, requestedLocale, isFallback: l !== requestedLocale, availableLocales };
    }
  }
  const first = [...byLang.entries()][0];
  if (!first) return undefined;
  return {
    slug, entry: first[1], lang: first[0], requestedLocale,
    isFallback: first[0] !== requestedLocale, availableLocales,
  };
}

async function loadResources(): Promise<ResourceEntry[]> {
  return getCollection("resources");
}

export async function getResourceSlugs(): Promise<string[]> {
  return [...groupBySlug(await loadResources()).keys()];
}

export async function getResourcesForLocale(locale: Locale): Promise<Localized<ResourceEntry>[]> {
  const grouped = groupBySlug(await loadResources());
  const resolved: Localized<ResourceEntry>[] = [];
  for (const [slug, byLang] of grouped) {
    const r = resolveForLocale(byLang, slug, locale);
    if (r) resolved.push(r);
  }
  return resolved.sort(
    (a, b) =>
      a.entry.data.order - b.entry.data.order ||
      a.entry.data.title.localeCompare(b.entry.data.title),
  );
}

export async function getResourceForLocale(
  slug: string,
  locale: Locale,
): Promise<Localized<ResourceEntry> | undefined> {
  const byLang = groupBySlug(await loadResources()).get(slug);
  return byLang ? resolveForLocale(byLang, slug, locale) : undefined;
}
