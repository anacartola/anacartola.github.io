import type { APIContext } from "astro";
import { buildRss } from "../../lib/rss";

export const GET = (context: APIContext) => buildRss("pt", context.site);
