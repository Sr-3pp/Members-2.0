import languages from "../data/languages.json";
import countries from "../data/countries.json";
import ranges from "../data/ranges.json";

export { memberCategoryOptions as categoryOptions } from "../shared/utils/categories";

export const languageOptions = languages.map((l) => ({
  label: l.label,
  value: l.code,
}));

export const countryOptions = countries.map((c) => ({
  label: c.label,
  value: c.code,
}));

export const rangeOptions = ranges.map((r) => ({
  label: r.name,
  value: r.slug,
}));
