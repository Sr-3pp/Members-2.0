/** The only geographic zones a member or enterprise country may belong to. */
export const ZONES = [
  "North America",
  "Central America",
  "South America",
  "Africa",
  "Asia",
  "Europe",
  "Australia",
] as const;

export type Zone = (typeof ZONES)[number];

export const isZone = (value: unknown): value is Zone =>
  typeof value === "string" && (ZONES as readonly string[]).includes(value);

export const zoneOptions = ZONES.map((zone) => ({ label: zone, value: zone }));
