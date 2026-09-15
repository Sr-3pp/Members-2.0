import { bundledCountries } from "../../utils/countries";
import {
  COUNTRY_NAMES_URL,
  buildCountryList,
} from "~~/shared/utils/countries";

const zonesByCode = Object.fromEntries(
  bundledCountries.map((country) => [country.code, country.zone]),
);

// Names are refreshed from the provider once a day; a failed refresh keeps
// serving the last good list and, before any succeeded, the bundled one.
const fetchCountries = defineCachedFunction(
  async () => {
    const names = await $fetch<Record<string, string>>(COUNTRY_NAMES_URL);
    return buildCountryList(names, zonesByCode);
  },
  { name: "countries", getKey: () => "all", maxAge: 60 * 60 * 24, swr: true },
);

export default defineEventHandler(async () => {
  try {
    return await fetchCountries();
  } catch {
    return bundledCountries;
  }
});
