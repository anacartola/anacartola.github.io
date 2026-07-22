import type { APIContext, GetStaticPaths } from "astro";
import { buildRss } from "../../../lib/rss";
import { SECONDARY_LOCALES, isLocale, DEFAULT_LOCALE } from "../../../i18n";

export const getStaticPaths = (() =>
  SECONDARY_LOCALES.map((lang) => ({ params: { lang } }))) satisfies GetStaticPaths;

export const GET = (context: APIContext) => {
  const lang = context.params.lang;
  return buildRss(isLocale(lang) ? lang : DEFAULT_LOCALE, context.site);
};
