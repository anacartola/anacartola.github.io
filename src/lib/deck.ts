import type { Localized, ProjectEntry } from "./content";
import { DECK_COLUMNS, rankLabel, type DeckColumn, type Suit } from "../data/suits";

export interface DeckCard {
  project: Localized<ProjectEntry>;
  suit: Suit;
  column: DeckColumn;
  rank: string;
  index: number;
}

export interface ColumnStack {
  column: DeckColumn;
  cards: DeckCard[];
}

export function buildDeck(projects: Localized<ProjectEntry>[]): ColumnStack[] {
  const bySuit = new Map<Suit, Localized<ProjectEntry>[]>();
  for (const p of projects) {
    if (!bySuit.has(p.entry.data.suit)) bySuit.set(p.entry.data.suit, []);
    bySuit.get(p.entry.data.suit)!.push(p);
  }

  return DECK_COLUMNS.map((col) => {
    const items = (bySuit.get(col) ?? []).sort(
      (a, b) =>
        a.entry.data.order - b.entry.data.order ||
        a.entry.data.title.localeCompare(b.entry.data.title),
    );
    const cards: DeckCard[] = items.map((project, i) => ({
      project,
      suit: col,
      column: col,
      rank: rankLabel(i),
      index: 0,
    }));
    cards.reverse();
    cards.forEach((card, i) => { card.index = i; });
    return { column: col, cards };
  });
}
