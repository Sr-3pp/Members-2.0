import { z } from "zod";
import { memberCategorySlugs } from "../shared/utils/categories";

const socialSchema = z.object({
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  fb: z.string().optional(),
  tw: z.string().optional(),
  in: z.string().optional(),
});

const skillsSchema = z
  .array(
    z.object({
      name: z.string().optional().default(""),
      level: z.number().optional().default(0),
    }),
  )
  .optional();

const profileFormSchema = z.object({
  folio: z.string(),
  name: z.string(),
  phone: z.string(),
  picture: z.string().optional().or(z.literal("")),
  social: socialSchema,
  countryCode: z.string().length(2, "Select a country"),
  city: z.string().optional(),
  nationality: z.string().optional(),
  resume: z.string(),
  skills: skillsSchema,
  status: z.enum(["active", "inactive", "pending", "blocked"]),
});

export const memberFormSchema = profileFormSchema.extend({
  last_name: z.string(),
  email: z.string().email("Invalid email"),
  mobile: z.string().optional(),
  range: z.string(),
  languages: z.array(z.string()).optional(),
  education: z.string(),
  categories: z.array(z.enum(memberCategorySlugs)),
});

export const enterpriseFormSchema = profileFormSchema.extend({
  description: z.string(),
});

export const programFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  length: z.number().min(1, "Length must be at least 1 day"),
  enterpriseId: z.string().optional(),
  participants: z.array(z.string()).optional(),
  photo: z.string().optional().or(z.literal("")),
  description: z.string().optional(),
  skills: skillsSchema,
  status: z.enum(["active", "inactive", "archived"]),
});
