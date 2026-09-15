import { findCountry, type CountryEntry } from "~~/shared/utils/countries";

/** The full country list from the API, shared by every component that needs it. */
export const useCountries = () => {
  const { data, status, error } = useAsyncData<CountryEntry[]>(
    "countries",
    () => $fetch<CountryEntry[]>("/api/countries"),
    { default: () => [] },
  );

  const countries = computed(() => data.value ?? []);
  const options = computed(() =>
    countries.value.map((country) => ({ label: country.label, value: country.code })),
  );
  const loading = computed(() => status.value === "pending");
  const find = (code: string) => findCountry(countries.value, code);

  return { countries, options, loading, error, find };
};
