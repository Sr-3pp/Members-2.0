import type { Country, Skill, SocialLinks } from "../shared/types/entities";

export const createFormSkills = (skills?: Skill[]) =>
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

export const resolveFormCountry = async (
  countryCode: string,
): Promise<Country> => {
  const code = countryCode.toLowerCase();
  const country = await $fetch<{
    name: { common: string };
    flags: { svg: string };
    subregion: string;
  }>(
    `https://restcountries.com/v3.1/alpha/${code}?fields=name,flags,subregion`,
  );
  return {
    code,
    name: country.name.common || "",
    flag: country.flags.svg || "",
    zone: country.subregion || "",
  };
};

export const buildProfilePayload = async <
  T extends {
    pictureFile: File | null;
    countryCode: string;
    skills: Skill[];
  },
>(
  form: T,
) => {
  const { pictureFile: _pictureFile, countryCode, skills, ...values } = form;
  return {
    ...trimFormStrings(values),
    skills: cleanFormSkills(skills),
    country: await resolveFormCountry(countryCode),
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
