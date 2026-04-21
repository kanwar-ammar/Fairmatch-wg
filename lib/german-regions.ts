export const GERMAN_REGIONS = [
  "Berlin",
  "Hamburg",
  "Munich",
  "Cologne",
  "Frankfurt am Main",
  "Stuttgart",
  "Dusseldorf",
  "Dortmund",
  "Essen",
  "Leipzig",
  "Bremen",
  "Dresden",
  "Hanover",
  "Nuremberg",
  "Duisburg",
  "Bochum",
  "Wuppertal",
  "Bielefeld",
  "Bonn",
  "Munster",
  "Karlsruhe",
  "Mannheim",
  "Augsburg",
  "Wiesbaden",
  "Gelsenkirchen",
  "Monchengladbach",
  "Braunschweig",
  "Chemnitz",
  "Kiel",
  "Aachen",
  "Halle (Saale)",
  "Magdeburg",
  "Freiburg im Breisgau",
  "Krefeld",
  "Lubeck",
  "Mainz",
  "Erfurt",
  "Rostock",
  "Kassel",
  "Saarbrucken",
] as const;

const normalizedRegionMap = new Map(
  GERMAN_REGIONS.map((region) => [region.toLowerCase(), region]),
);

export function normalizeGermanRegion(value: string): string | null {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;
  return normalizedRegionMap.get(normalized) ?? null;
}

export function isGermanRegion(value: string): boolean {
  return normalizeGermanRegion(value) !== null;
}
