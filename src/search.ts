import type { Practitioner } from "./types";

export function normalizeText(value: string): string {
  return value.trim().toLocaleLowerCase("sv-SE");
}

export function normalizePostalCode(value: string): string {
  return value.replace(/\s/g, "");
}

export function filterPractitioners(items: Practitioner[], query: string, nameQuery = ""): Practitioner[] {
  const normalizedQuery = normalizeText(query);
  const normalizedName = normalizeText(nameQuery);
  if (!normalizedQuery && !normalizedName) return items;

  const postalQuery = normalizePostalCode(normalizedQuery);
  const isPostalSearch = /^\d+$/.test(postalQuery);

  return items.filter((item) => {
    const nameMatches = !normalizedName || normalizeText(item.name).includes(normalizedName);
    if (!nameMatches) return false;
    if (!normalizedQuery) return true;

    if (isPostalSearch) {
      return normalizePostalCode(item.postalCode).startsWith(postalQuery);
    }

    return normalizeText(item.locality) === normalizedQuery;
  });
}
