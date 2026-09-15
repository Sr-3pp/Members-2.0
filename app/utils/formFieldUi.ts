import type { FormFieldProps } from "@nuxt/ui/runtime/types/index.js";

/**
 * Slot overrides that put a UFormField on an inverted surface.
 *
 * UFormField takes no `variant` or `color` prop — it forwards only `size`, `required`
 * and `orientation` to its theme — so unlike UInput this cannot be expressed as a
 * theme variant in app.config.ts and has to go through the `ui` prop instead.
 *
 * Usage: <UFormField label="Pais" :ui="invertedFormField">
 */
export const invertedFormField: FormFieldProps["ui"] = {
  label: "text-inverted bg-inverted",
  description: "text-inverted/70",
  hint: "text-inverted/70",
  help: "text-inverted/70",
};
