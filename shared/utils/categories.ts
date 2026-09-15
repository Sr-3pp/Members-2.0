const memberCategoryDefinitions = {
  consultor: { label: "Consultor", background: "bg-consultor", iconColor: "#46c1b6" },
  coach: { label: "Coach", background: "bg-coach", iconColor: "#f58624" },
  capacitador: { label: "Capacitador", background: "bg-capacitador", iconColor: "#95ca65" },
  "certificaciones-especiales": {
    label: "Certificaciones especiales",
    background: "bg-certificaciones-especiales",
    iconColor: "#666",
  },
} as const;

export const categoryDefinitions = {
  ...memberCategoryDefinitions,
  enterprise: { label: "Empresas", background: "bg-enterprise", iconColor: "#00aeef" },
  programs: { label: "Programas", background: "bg-program", iconColor: "#ea527d" },
} as const;

export type MemberCategory = keyof typeof memberCategoryDefinitions;
export type SearchCategory = keyof typeof categoryDefinitions;

export const isMemberCategory = (value: string): value is MemberCategory =>
  Object.hasOwn(memberCategoryDefinitions, value);

export const memberCategorySlugs = Object.keys(memberCategoryDefinitions) as MemberCategory[];

export const memberCategoryOptions = memberCategorySlugs.map((value) => ({
  value,
  label: categoryDefinitions[value].label,
}));

export const searchCategoryOptions = (Object.keys(categoryDefinitions) as SearchCategory[]).map((value) => ({
  value,
  label: categoryDefinitions[value].label,
}));
