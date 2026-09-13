import { z } from "zod";

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

export const memberFormSchema = z.object({
  folio: z.string(),
  name: z.string(),
  last_name: z.string(),
  email: z.string().email("Invalid email"),
  phone: z.string(),
  mobile: z.string().optional(),
  range: z.string(),
  picture: z.string().optional().or(z.literal("")),
  social: socialSchema,
  countryCode: z.string(),
  city: z.string().optional(),
  nationality: z.string().optional(),
  languages: z.array(z.string()).optional(),
  education: z.string(),
  resume: z.string(),
  categories: z.array(z.string()),
  skills: skillsSchema,
  status: z.enum(["active", "inactive", "pending", "blocked"]),
});

export const enterpriseFormSchema = z.object({
  folio: z.string(),
  name: z.string(),
  phone: z.string(),
  picture: z.string().optional().or(z.literal("")),
  social: socialSchema,
  countryCode: z.string(),
  city: z.string().optional(),
  nationality: z.string().optional(),
  description: z.string(),
  resume: z.string(),
  skills: skillsSchema,
  status: z.enum(["active", "inactive", "pending", "blocked"]),
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
