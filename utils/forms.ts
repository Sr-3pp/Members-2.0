import {
  findCountry,
  toCountry,
  type CountryEntry,
} from "../shared/utils/countries";
import type {
  Country,
  Enterprise,
  Member,
  Skill,
  SocialLinks,
} from "../shared/types/entities";

export interface FormSkill {
  name: string;
  level: number;
}

export const createFormSkills = (skills?: Skill[]): FormSkill[] =>
  skills?.length
    ? skills.map((skill) => ({
        name: skill.name ?? "",
        level: skill.level ?? 0,
      }))
    : Array.from({ length: 5 }, () => ({ name: "", level: 0 }));

export const createFormSocial = (social?: SocialLinks) => ({
  website: social?.website ?? "",
  fb: social?.fb ?? "",
  tw: social?.tw ?? "",
  in: social?.in ?? "",
});

/**
 * Editable state shared by the member and enterprise forms. Entity-specific
 * fields are added on top of this by each form composable.
 */
export const createProfileFormState = (initial?: Member | Enterprise) => ({
  folio: initial?.folio ?? "",
  name: initial?.name ?? "",
  phone: initial?.phone ?? "",
  pictureFile: null as File | null,
  picture: initial?.picture ?? "",
  social: createFormSocial(initial?.social),
  countryCode: initial?.country?.code ?? "",
  city: initial?.city ?? "",
  nationality: initial?.nationality ?? "",
  resume: initial?.resume ?? "",
  skills: createFormSkills(initial?.skills),
  status: initial?.status ?? "active",
});

export const cleanFormSkills = (skills: Skill[]) =>
  skills
    .map((skill) => ({
      name: (skill.name ?? "").trim(),
      level: skill.level ?? 0,
    }))
    .filter((skill) => skill.name && skill.level > 0);

// Preserve nested values while normalizing top-level text fields.
export const trimFormStrings = <T extends object>(values: T): T =>
  Object.fromEntries(
    Object.entries(values).map(([key, value]) => [
      key,
      typeof value === "string" ? value.trim() : value,
    ]),
  ) as T;

/**
 * Resolves the selected code against the country list (from `/api/countries`
 * or the bundled copy), so the stored zone is always one of the fixed values.
 */
export const resolveFormCountry = (
  countryCode: string,
  countries: CountryEntry[],
): Country => {
  const country = findCountry(countries, countryCode);
  if (!country) throw new Error(`Unknown country code "${countryCode}"`);
  return toCountry(country);
};

export const buildProfilePayload = <
  T extends {
    pictureFile: File | null;
    countryCode: string;
    skills: Skill[];
  },
>(
  form: T,
  countries: CountryEntry[],
) => {
  const { pictureFile: _pictureFile, countryCode, skills, ...values } = form;
  return {
    ...trimFormStrings(values),
    skills: cleanFormSkills(skills),
    country: resolveFormCountry(countryCode, countries),
  };
};

export const buildProgramPayload = <
  T extends {
    photoFile: File | null;
    enterpriseId: string;
    skills: Skill[];
  },
>(
  form: T,
) => {
  const { photoFile: _photoFile, enterpriseId, skills, ...values } = form;
  return {
    ...trimFormStrings(values),
    ...(enterpriseId ? { enterprise: enterpriseId } : {}),
    skills: cleanFormSkills(skills),
  };
};

export const uploadFormImage = (file: File) => {
  const body = new FormData();
  body.append("file", file);
  return $fetch<string>("/api/uploads/picture", { method: "POST", body });
};
