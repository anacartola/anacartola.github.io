// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// ponytail: single source of truth for locales — mirrored in src/i18n.
// When a 5th locale is added, update here + src/i18n/index.ts + add dictionary file.
export default defineConfig({
  site: 'https://anacartola.com',
  base: '/',
  output: 'static',
  trailingSlash: 'ignore',
  i18n: {
    defaultLocale: 'pt',
    locales: ['pt', 'en', 'fr', 'zh'],
    routing: {
      // PT is the native/canonical language: it earns the unprefixed root URLs.
      // en/fr/zh live under /en, /fr, /zh (emitted by the [lang] page tree).
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: 'pt',
        locales: { pt: 'pt-BR', en: 'en-US', fr: 'fr-FR', zh: 'zh-CN' },
      },
    }),
  ],
});
