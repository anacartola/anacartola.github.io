import { getCollection, type CollectionEntry } from "astro:content";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "../i18n";

export type ProjectEntry = CollectionEntry<"projects">;
export type PostEntry = CollectionEntry<"posts">;

/** Blog posts per page. */
export const PAGE_SIZE = 6;

/** Chunk a list into fixed-size pages (1-indexed metadata added by caller). */
export function chunk<T>(list: T[], size = PAGE_SIZE): T[][] {
  if (list.length === 0) return [[]];
  const pages: T[][] = [];
  for (let i = 0; i < list.length; i += size) {
    pages.push(list.slice(i, i + size));
  }
  return pages;
}

/** Content ids look like `<base-slug>.<lang>` (e.g. "spades-analytics.pt"). */
const LANG_SUFFIX = /\.(pt|en|fr|zh)$/;
export const baseSlug = (id: string): string => id.replace(LANG_SUFFIX, "");

export interface Localized<E> {
  /** Language-agnostic slug shared across a piece of content's translations. */
  slug: string;
  entry: E;
  /** Locale actually rendered (may differ from requested when falling back). */
  lang: Locale;
  requestedLocale: Locale;
  /** True when the requested locale had no translation and we fell back. */
  isFallback: boolean;
  /** Locales this content actually exists in. */
  availableLocales: Locale[];
}

async function loadProjects(): Promise<ProjectEntry[]> {
  return getCollection("projects");
}

async function loadPosts(includeDrafts = false): Promise<PostEntry[]> {
  const posts = await getCollection("posts");
  // Drafts are visible in dev, hidden in production builds.
  return includeDrafts || !import.meta.env.PROD
    ? posts
    : posts.filter((p) => !p.data.draft);
}

function groupBySlug<E extends { id: string; data: { lang: Locale } }>(
  entries: E[],
): Map<string, Map<Locale, E>> {
  const map = new Map<string, Map<Locale, E>>();
  for (const entry of entries) {
    const slug = baseSlug(entry.id);
    if (!map.has(slug)) map.set(slug, new Map());
    map.get(slug)!.set(entry.data.lang, entry);
  }
  return map;
}

/** Fallback chain: requested locale -> EN (target market) -> PT (default) -> any. */
function resolveForLocale<E>(
  byLang: Map<Locale, E>,
  slug: string,
  requestedLocale: Locale,
): Localized<E> | undefined {
  const chain: Locale[] = [requestedLocale, "en", DEFAULT_LOCALE];
  const availableLocales = LOCALES.filter((l) => byLang.has(l));
  for (const l of chain) {
    const entry = byLang.get(l);
    if (entry) {
      return {
        slug,
        entry,
        lang: l,
        requestedLocale,
        isFallback: l !== requestedLocale,
        availableLocales,
      };
    }
  }
  const first = [...byLang.entries()][0];
  if (!first) return undefined;
  return {
    slug,
    entry: first[1],
    lang: first[0],
    requestedLocale,
    isFallback: first[0] !== requestedLocale,
    availableLocales,
  };
}

// --- Projects --------------------------------------------------------------

export async function getProjectSlugs(): Promise<string[]> {
  const grouped = groupBySlug(await loadProjects());
  return [...grouped.keys()];
}

export async function getProjectsForLocale(
  locale: Locale,
): Promise<Localized<ProjectEntry>[]> {
  await assertRelationsValid();
  const grouped = groupBySlug(await loadProjects());
  const resolved: Localized<ProjectEntry>[] = [];
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

export async function getProjectForLocale(
  slug: string,
  locale: Locale,
): Promise<Localized<ProjectEntry> | undefined> {
  await assertRelationsValid();
  const grouped = groupBySlug(await loadProjects());
  const byLang = grouped.get(slug);
  return byLang ? resolveForLocale(byLang, slug, locale) : undefined;
}

// --- Posts -----------------------------------------------------------------

export async function getPostSlugs(): Promise<string[]> {
  const grouped = groupBySlug(await loadPosts());
  return [...grouped.keys()];
}

export async function getPostsForLocale(
  locale: Locale,
): Promise<Localized<PostEntry>[]> {
  await assertRelationsValid();
  const grouped = groupBySlug(await loadPosts());
  const resolved: Localized<PostEntry>[] = [];
  for (const [slug, byLang] of grouped) {
    const r = resolveForLocale(byLang, slug, locale);
    if (r) resolved.push(r);
  }
  return resolved.sort(
    (a, b) => b.entry.data.pubDate.getTime() - a.entry.data.pubDate.getTime(),
  );
}

export async function getPostForLocale(
  slug: string,
  locale: Locale,
): Promise<Localized<PostEntry> | undefined> {
  await assertRelationsValid();
  const grouped = groupBySlug(await loadPosts());
  const byLang = grouped.get(slug);
  return byLang ? resolveForLocale(byLang, slug, locale) : undefined;
}

// --- Relations (project <-> posts) -----------------------------------------

export async function getRelatedPostsForProject(
  project: ProjectEntry,
  locale: Locale,
): Promise<Localized<PostEntry>[]> {
  const slugs = project.data.relatedPosts;
  if (slugs.length === 0) return [];
  const grouped = groupBySlug(await loadPosts());
  const related: Localized<PostEntry>[] = [];
  for (const slug of slugs) {
    const byLang = grouped.get(slug);
    const r = byLang ? resolveForLocale(byLang, slug, locale) : undefined;
    if (r) related.push(r);
  }
  return related;
}

export async function getRelatedProjectForPost(
  post: PostEntry,
  locale: Locale,
): Promise<Localized<ProjectEntry> | undefined> {
  const slug = post.data.relatedProject;
  if (!slug) return undefined;
  const grouped = groupBySlug(await loadProjects());
  const byLang = grouped.get(slug);
  return byLang ? resolveForLocale(byLang, slug, locale) : undefined;
}

// --- Reading time ----------------------------------------------------------

/** Rough reading time in minutes from an entry's raw body (~200 wpm). */
export function readingTimeMinutes(entry: PostEntry): number {
  const words = (entry.body ?? "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// --- Relation validation (data contract — fails the build) -----------------
// ponytail: never cut this. A dangling relatedPosts/relatedProject slug is a
// broken contract and must stop the build with a precise message, not warn.

let validated = false;

export async function assertRelationsValid(): Promise<void> {
  if (validated) return;
  const projects = await loadProjects();
  const posts = await getCollection("posts"); // drafts included for existence checks
  const projectSlugs = new Set(projects.map((p) => baseSlug(p.id)));
  const postSlugs = new Set(posts.map((p) => baseSlug(p.id)));

  const errors: string[] = [];
  for (const p of projects) {
    for (const rel of p.data.relatedPosts) {
      if (!postSlugs.has(rel)) {
        errors.push(
          `Project "${baseSlug(p.id)}" (${p.id}) -> relatedPosts["${rel}"]: no post with base slug "${rel}" exists.`,
        );
      }
    }
  }
  for (const post of posts) {
    const rel = post.data.relatedProject;
    if (rel && !projectSlugs.has(rel)) {
      errors.push(
        `Post "${baseSlug(post.id)}" (${post.id}) -> relatedProject "${rel}": no project with base slug "${rel}" exists.`,
      );
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `\n[content] Broken project<->post relations (data contract — fix before building):\n  - ${errors.join(
        "\n  - ",
      )}\n`,
    );
  }
  validated = true;
}
