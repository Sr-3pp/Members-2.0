const categoryImage = (file: string) => `/img/categories/${file}.png`;

const memberCategoryDefinitions = {
  consultor: {
    label: "Consultor",
    background: "bg-consultor",
    ring: "ring-consultor",
    iconColor: "#46c1b6",
    image: categoryImage("consultor"),
  },
  coach: {
    label: "Coach",
    background: "bg-coach",
    ring: "ring-coach",
    iconColor: "#f58624",
    image: categoryImage("coach"),
  },
  capacitador: {
    label: "Capacitador",
    background: "bg-capacitador",
    ring: "ring-capacitador",
    iconColor: "#95ca65",
    image: categoryImage("capacitador"),
  },
  "certificaciones-especiales": {
    label: "Certificaciones especiales",
    background: "bg-certificaciones-especiales",
    ring: "ring-certificaciones-especiales",
    iconColor: "#666",
    image: categoryImage("certificaciones-especiales"),
  },
} as const;

export const categoryDefinitions = {
  ...memberCategoryDefinitions,
  enterprise: {
    label: "Empresas",
    background: "bg-enterprise",
    ring: "ring-enterprise",
    iconColor: "#00aeef",
    image: categoryImage("empresa"),
  },
  programs: {
    label: "Programas",
    background: "bg-program",
    ring: "ring-program",
    iconColor: "#ea527d",
    image: categoryImage("programa"),
  },
} as const;

export type MemberCategory = keyof typeof memberCategoryDefinitions;
export type SearchCategory = keyof typeof categoryDefinitions;

export const isMemberCategory = (value: string): value is MemberCategory =>
  Object.hasOwn(memberCategoryDefinitions, value);

export const memberCategorySlugs = Object.keys(memberCategoryDefinitions) as MemberCategory[];

export const memberCategoryOptions = memberCategorySlugs.map((value) => ({
  value,
  label: categoryDefinitions[value].label,
  image: categoryDefinitions[value].image,
}));

export const searchCategoryOptions = (Object.keys(categoryDefinitions) as SearchCategory[]).map((value) => ({
  value,
  label: categoryDefinitions[value].label,
}));
