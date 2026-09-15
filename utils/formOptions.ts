import languages from "../data/languages.json";
import ranges from "../data/ranges.json";

export { memberCategoryOptions as categoryOptions } from "../shared/utils/categories";

export const languageOptions = languages.map((l) => ({
  label: l.label,
  value: l.code,
}));

export const rangeOptions = ranges.map((r) => ({
  label: r.name,
  value: r.slug,
}));
