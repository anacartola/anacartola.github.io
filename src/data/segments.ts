/**
 * Segments / industries served. ALWAYS visible (low risk, high value).
 * Unlike clients, segments carry no NDA or trademark exposure.
 *
 * The author fills this in. Placeholders below are clearly marked — replace
 * them with real segments. `count` is the aggregate number of engagements in
 * that segment (used by the "+N clients in fintech…" aggregate on /about).
 */
export interface Segment {
  /** i18n-agnostic key; label comes from the data (segments are proper nouns). */
  id: string;
  label: string;
  /** Suit/area this segment most maps to, for colour categorisation. */
  suit?: "spades" | "diamonds" | "hearts" | "clubs";
  /** Number of engagements — feeds the aggregated client count. */
  count?: number;
}

// {{ TODO: author — replace with real segments. Do not invent. }}
export const segments: Segment[] = [
  { id: "placeholder-1", label: "{{ TODO: segmento 1 }}", suit: "diamonds", count: 0 },
  { id: "placeholder-2", label: "{{ TODO: segmento 2 }}", suit: "spades", count: 0 },
  { id: "placeholder-3", label: "{{ TODO: segmento 3 }}", suit: "clubs", count: 0 },
];
