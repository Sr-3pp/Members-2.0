import type { Zone } from "./zones";
import type { Country } from "../types/entities";

export interface CountryEntry {
  /** ISO 3166-1 alpha-2 code, lowercase. */
  code: string;
  label: string;
  zone: Zone;
}

/** Free, keyless provider used for country names and flag images. */
export const COUNTRY_NAMES_URL = "https://flagcdn.com/en/codes.json";
export const providerFlagUrl = (code: string) =>
  `https://flagcdn.com/${code.toLowerCase()}.svg`;

/** Flags are served through the app so each one is fetched from the provider once. */
export const flagUrl = (code: string) => `/api/flags/${code.toLowerCase()}.svg`;

const COUNTRY_CODE = /^[a-z]{2}$/;

/**
 * Merges live provider names with the known zones. Codes without a zone are
 * left out, since every stored country must belong to one of the fixed zones.
 */
export const buildCountryList = (
  names: Record<string, string>,
  zones: Record<string, Zone>,
): CountryEntry[] =>
  Object.entries(names)
    .flatMap(([code, label]) => {
      const zone = zones[code];
      return COUNTRY_CODE.test(code) && zone && label ? [{ code, label, zone }] : [];
    })
    .sort((a, b) => a.label.localeCompare(b.label, "en"));

export const findCountry = (countries: CountryEntry[], code: string) => {
  const normalized = code.trim().toLowerCase();
  return countries.find((country) => country.code === normalized);
};

/** Shapes a list entry the way it is persisted on members and enterprises. */
export const toCountry = (entry: CountryEntry): Country => ({
  code: entry.code,
  name: entry.label,
  flag: flagUrl(entry.code),
  zone: entry.zone,
});
