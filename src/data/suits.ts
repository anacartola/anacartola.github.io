export type Suit = "spades" | "diamonds" | "hearts" | "clubs" | "coringa";
export type DeckColumn = Suit;

export const SUITS: Suit[] = ["spades", "diamonds", "hearts", "clubs", "coringa"];
export const DECK_COLUMNS: DeckColumn[] = ["spades", "diamonds", "hearts", "clubs", "coringa"];

export interface ColumnMeta {
  glyph: string;
  suitColor: string;
  ornamentColor: string;
}

export const COLUMN_META: Record<DeckColumn, ColumnMeta> = {
  spades:   { glyph: "♠", suitColor: "var(--frame-default)", ornamentColor: "var(--blue-300)" },
  clubs:    { glyph: "♣", suitColor: "var(--frame-default)", ornamentColor: "var(--blue-300)" },
  diamonds: { glyph: "♦", suitColor: "var(--orange-600)",    ornamentColor: "var(--blue-300)" },
  hearts:   { glyph: "♥", suitColor: "var(--orange-600)",    ornamentColor: "var(--blue-300)" },
  coringa:  { glyph: "🎩", suitColor: "var(--yellow-700)",   ornamentColor: "var(--blue-300)" },
};

export function rankLabel(index: number): string {
  return String(index + 1).padStart(2, "0");
}
