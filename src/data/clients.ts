/**
 * Named clients / logos. Legal contract embedded in the data model:
 * using a consulting client's logo WITHOUT permission can violate an NDA and
 * trademark rights. Therefore `permission` is a REQUIRED flag on the datum,
 * not a layout decision.
 *
 * <ClientWall /> renders a client ONLY when:
 *     permission === "granted"   OR   publicWork === true
 * Everyone else is counted in aggregate ("+N clients in fintech, health…")
 * with no name and no logo.
 *
 * The author fills this in. NEVER invent company names.
 */
export interface Client {
  name: string;
  /** Path to an svg/png under /public (or src asset). Only shown if renderable. */
  logo?: string;
  /** Segment id/label this client belongs to (drives the aggregate copy). */
  segment: string;
  /** Explicit permission to display name/logo. Default posture is "none". */
  permission: "granted" | "pending" | "none";
  /** Work already public (published case, talk, release) — also displayable. */
  publicWork?: boolean;
}

// {{ TODO: author — fill with real clients. Leave permission="none" until you
//    have written confirmation. Do not invent names or logos. }}
export const clients: Client[] = [
  // Example shape (not a real client — remove before publishing):
  // { name: "Acme Fintech", logo: "/clients/acme.svg", segment: "Fintech", permission: "granted" },
  // { name: "Confidential", segment: "Health", permission: "none" },
];

/** Clients cleared to display (name/logo). */
export function displayableClients(list: Client[] = clients): Client[] {
  return list.filter((c) => c.permission === "granted" || c.publicWork === true);
}

/** Aggregate count of clients NOT displayed, grouped by segment. */
export function aggregatedBySegment(
  list: Client[] = clients,
): { segment: string; count: number }[] {
  const hidden = list.filter(
    (c) => !(c.permission === "granted" || c.publicWork === true),
  );
  const bySegment = new Map<string, number>();
  for (const c of hidden) {
    bySegment.set(c.segment, (bySegment.get(c.segment) ?? 0) + 1);
  }
  return [...bySegment.entries()].map(([segment, count]) => ({ segment, count }));
}
