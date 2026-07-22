# anacartola.com

Personal site and technical portfolio for Ana Carolina Cartola (A. Cartola).
Astro, TypeScript, static output, multilingual (PT, EN, FR, ZH), deployed to
GitHub Pages.

## Stack

- Astro 5 with TypeScript, `output: 'static'`.
- Content Collections (`astro:content`) with Zod schemas, MDX for articles.
- Native Astro i18n routing.
- Self-hosted fonts via `@fontsource`.
- No backend. Search, relations, and i18n are resolved at build time.

## Local development

Node 18.20+, 20.3+, or 22+ is required (Astro 5). Install it first if `node`
is not on your PATH.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static build into ./dist
npm run preview  # serve the built site
npm run check    # astro type-check (optional)
```

## Internationalisation

Four locales, ordered by content priority: PT (native), EN (target market),
FR, ZH.

- **PT is the default and is served unprefixed** at `/`. EN, FR, and ZH live
  under `/en`, `/fr`, `/zh`. This is set in `astro.config.mjs`
  (`i18n.routing.prefixDefaultLocale: false`).
- Pages are authored once. Root files under `src/pages/` render PT; the
  `src/pages/[lang]/` tree emits EN, FR, and ZH from the same page components in
  `src/components/pages/`. There is no duplicated page markup to drift.
- UI strings live in `src/i18n/{pt,en,fr,zh}.ts`. PT is the source of truth for
  the dictionary shape; the other locales are typed against it, so a missing key
  is a type error. Never hardcode UI text in a component.
- FR and ZH show a persistent, dismissible learning-language notice at the top
  of the content (`<LearningLanguageNotice />`). It renders only for those two
  locales.

### Translation fallback

Each post and project has one file per language, named
`slug.<lang>.mdx` (for example `spades-churn-measurement.en.mdx`). Not every
piece needs all four languages. When a translation is missing, the resolver
falls back in this order: requested locale, then EN, then PT, then any
available. Cards for fallen-back content show a "not available in [LANG]" badge,
and the page shows a short fallback note.

The shipped example proves this: the project exists in all four languages, but
the linked post exists only in PT, EN, and FR, so the ZH views fall back to EN.

## Content authoring

### Add a project

Create `src/content/projects/<slug>.<lang>.mdx`:

```mdx
---
title: "Behavioural churn measurement"
summary: "One line, from business problem to pipeline to story."
lang: en
suit: spades            # spades Analytics, diamonds Business, hearts Research, clubs Engineering
stack: ["Python", "SQL", "dbt"]
role: "Analytics Engineering + Data Strategy"
period: "2024"          # optional
featured: true          # optional, surfaces on the home page
relatedPosts: ["measurement-framework-churn"]  # base slugs of related posts
order: 1                # optional sort key
---

## Section

Body in MDX. Components can be imported when needed.
```

Note: MDX treats `{` as a JavaScript expression. If you need literal braces in
body text, escape them as `\{`.

### Add a post

Create `src/content/posts/<slug>.<lang>.mdx`:

```mdx
---
title: "A measurement framework before touching the pipeline"
description: "One line for cards and meta description."
lang: en
pubDate: 2024-11-04
tags: ["measurement", "analytics-engineering"]
suit: spades                                   # optional
relatedProject: "spades-churn-measurement"     # optional, base slug of a project
draft: false                                   # drafts are hidden in production
---

Body in MDX.
```

### Add a translation

Copy an existing file, change the language suffix in the filename and the
`lang` field, and translate the content. Keep the base slug identical so the
translations link together and the language switcher can preserve the route.

### The project to article relation is a contract

A project lists related posts in `relatedPosts[]`; a post points back with
`relatedProject`. Both directions are resolved at build time and validated. If
any referenced base slug does not exist, **the build fails** with a precise
message naming the file and the broken slug. This is intentional and is not
softened to a warning. See `src/lib/content.ts` (`assertRelationsValid`).

## Authority section: segments and clients

- **Segments** (`src/data/segments.ts`) are always shown. Fill in the real
  industries served.
- **Clients** (`src/data/clients.ts`) are permission-gated. A client's name or
  logo is displayed only when `permission === 'granted'` or `publicWork === true`.
  Everyone else is folded into an aggregate count per segment, with no name and
  no logo. The permission flag is a required field on the datum because using a
  consulting client's logo without permission can violate an NDA and trademark
  rights. This is a data rule, not a layout choice. Never invent client names.

Both files ship with clearly marked placeholders for the author to complete.

## Design system

Tokens live in `src/styles/tokens.css` and are consumed everywhere as CSS custom
properties. Do not hardcode a hex value in a component.

Key rules encoded in the tokens and components:

- Teal (`--blue-500`) always dominates. Purple is an accent only. Maximum of two
  secondary colours per composition.
- `blue-500` and `red-500` fail as text colours. They are used as fills (with
  white text) or icon strokes only. For readable red text, use `red-300`.
- Flat colour only (Art Déco). No gradients between scales.
- Suits map to areas and to colour as a real categorisation system: spades
  Analytics, diamonds Business (yellow), hearts Research, clubs Engineering
  (orange).
- Signature anatomy: external straight (square outer border) with an internal
  round inset rectangle. The signature interaction is the copper/patina hover:
  teal shifts to copper on hover for primary actions, nav, links, and card
  corners.
- Light and dark modes are both supported. The theme follows the OS preference
  until the user toggles it, after which the choice persists in `localStorage`.

## Fonts

- **Body/UI: Open Sans**, self-hosted via `@fontsource/open-sans`. Free.
- **Display/Headings: Croco**, a commercial Art Déco face used for titles only.
  It is not bundled. Until it is licensed and installed, the geometric fallback
  Josefin Sans stands in (`@fontsource/josefin-sans`).

To install Croco once licensed: add the web font files, reference them with an
`@font-face` block (or a fontsource-style import), and confirm the first family
in `--font-display` in `src/styles/tokens.css` is `"Croco"`. Nothing else needs
to change.

## Brand symbols

Approved symbols come from the Art Déco geometric vocabulary: top hat, suits,
magnifier, compass, key, hourglass, constellations, chess knight. The three
mascots (Corvo, Beagle, Vaga-lume) ship as geometric SVG placeholders in
`src/components/symbols/` and use `fill="currentColor"`. Replace them with the
final brand assets when available. Do not introduce prohibited symbols (rocket,
unicorn, lightbulb, brain, gear or cylinder or cloud as identity, owl, bar
chart, upward line, eye, generic hexagon, lock or shield). Gear, cylinder,
cloud, and upward arrow are allowed only as functional UI icons, never as
identity.

## Deployment: GitHub Pages

The workflow is `.github/workflows/deploy.yml` (build with `withastro/action`,
publish with `actions/deploy-pages`).

1. Push to `main`, or run the workflow manually.
2. In the repository, open **Settings > Pages** and set **Source** to
   **GitHub Actions**.
3. The custom domain is handled by `public/CNAME` (`anacartola.com`). In
   **Settings > Pages > Custom domain**, confirm `anacartola.com` and enable
   **Enforce HTTPS** once the certificate is issued.
4. Point DNS for `anacartola.com` at GitHub Pages (an `ALIAS`/`ANAME` or four
   `A` records to the GitHub Pages IPs, plus a `CNAME` for `www` if used). See
   GitHub's "Managing a custom domain" docs for the current IP set.

`public/.nojekyll` is included so the `_astro/` output directory is served
as-is.

## Redirect acartola.dev to anacartola.com (Cloudflare)

Out of scope for the build. To set up the 301 redirect:

1. Add `acartola.dev` as a zone in Cloudflare and point its nameservers there.
2. Create a Redirect Rule (Rules > Redirect Rules):
   - When incoming requests match: hostname equals `acartola.dev` (add
     `www.acartola.dev` as a second condition if needed).
   - Then: Static redirect to `https://anacartola.com` (or dynamic, preserving
     path and query), Status code **301**, Preserve query string on.
3. Add a proxied DNS record for `acartola.dev` (for example an `A` record to a
   dummy address like `192.0.2.1` with the orange cloud on) so Cloudflare can
   apply the rule.

## Manual checklist for the author

- [ ] Install and license Croco, then set it as the first family in
      `--font-display`.
- [ ] Fill in `src/data/segments.ts` with real segments.
- [ ] Fill in `src/data/clients.ts`. Keep `permission: 'none'` until you have
      written confirmation. Never invent names.
- [ ] Replace all `{{ TODO: ... }}` copy placeholders per locale (dictionaries
      and the `intro`/`meta` strings), and the `TODO:` markers in the example
      MDX bodies.
- [ ] Replace the mascot and Cartola SVG placeholders in
      `src/components/symbols/` with final assets.
- [ ] Replace `public/og-default.svg` with a licensed-font Open Graph image.
- [ ] Confirm the real social handles in `src/data/site.ts` (LinkedIn, GitHub,
      email).
- [ ] Enable GitHub Pages (Source: GitHub Actions) and confirm the custom
      domain.
- [ ] Configure the `acartola.dev` to `anacartola.com` redirect in Cloudflare.
- [ ] Add real projects and posts, and confirm the build passes (the relation
      validator will catch broken related slugs).

## Code conventions (PONYTAIL)

Prefer the standard library and native platform features over dependencies, and
an existing dependency over a new one. Avoid speculative abstraction. Where a
ceiling is deliberate, it is marked in the code with a `// ponytail:` comment
noting the limit and when to migrate.
