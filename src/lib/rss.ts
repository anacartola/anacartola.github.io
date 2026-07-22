import rss from "@astrojs/rss";
import { getPostsForLocale } from "./content";
import { getDictionary, HTML_LANG, type Locale } from "../i18n";
import { localizedPath } from "../i18n/utils";
import { SITE } from "../data/site";

/** Build the blog RSS feed for a single locale. */
export async function buildRss(locale: Locale, site: URL | undefined) {
  const t = getDictionary(locale);
  const posts = await getPostsForLocale(locale);
  return rss({
    title: `${t.site.author} — ${t.blog.title}`,
    description: t.meta.defaultDescription,
    site: site ?? SITE.url,
    items: posts.map(({ entry, slug }) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.pubDate,
      link: localizedPath(`/blog/${slug}`, locale),
      categories: entry.data.tags,
    })),
    customData: `<language>${HTML_LANG[locale]}</language>`,
  });
}
