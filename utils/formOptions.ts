import languages from "../data/languages.json";
import countries from "../data/countries.json";
import categories from "../data/categories.json";
import ranges from "../data/ranges.json";

export const languageOptions = languages.map((l) => ({
  label: l.label,
  value: l.code,
}));

export const countryOptions = countries.map((c) => ({
  label: c.label,
  value: c.code,
}));

export const categoryOptions = categories.map((c) => ({
  label: c.name,
  value: c.slug,
  image: c.image,
}));

export const rangeOptions = ranges.map((r) => ({
  label: r.name,
  value: r.slug,
}));
