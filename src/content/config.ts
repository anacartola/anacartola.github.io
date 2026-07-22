import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/** Suit <-> area: spades Analytics · diamonds Business · hearts Research · clubs Engineering. */
const suit = z.enum(["spades", "diamonds", "hearts", "clubs"]);

const lang = z.enum(["pt", "en", "fr", "zh"]);

// The default glob id slugifies the filename and drops the "." before the lang
// suffix ("foo.pt" -> "foopt"), which breaks base-slug grouping. Keep the raw
// filename (sans extension) so ids stay "<base-slug>.<lang>".
const keepLangId = ({ entry }: { entry: string }) =>
  entry.replace(/\.(md|mdx)$/i, "");

const projects = defineCollection({
  loader: glob({
    pattern: "**/*.mdx",
    base: "./src/content/projects",
    generateId: keepLangId,
  }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    lang,
    suit, // área principal (naipe da marca)
    stack: z.array(z.string()), // ['dbt','Airflow',...]
    role: z.string(),
    period: z.string().optional(),
    heroImage: z.string().optional(),
    repo: z.string().url().optional(),
    liveUrl: z.string().url().optional(),
    featured: z.boolean().default(false),
    relatedPosts: z.array(z.string()).default([]), // base slugs de posts
    order: z.number().default(0),
  }),
});

const posts = defineCollection({
  loader: glob({
    pattern: "**/*.mdx",
    base: "./src/content/posts",
    generateId: keepLangId,
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    lang,
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    suit: suit.optional(),
    relatedProject: z.string().optional(), // base slug do projeto
    draft: z.boolean().default(false),
    coverImage: z.string().optional(),
  }),
});

export const collections = { projects, posts };
