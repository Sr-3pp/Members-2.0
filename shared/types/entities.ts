import type { MemberCategory } from "../utils/categories";
import type { Zone } from "../utils/zones";

export type MemberStatus = "active" | "inactive" | "pending" | "blocked";
export type ProgramStatus = "active" | "inactive" | "archived";
export type MemberRange = "afiliado" | "especialista" | "experto" | "profesional";

export interface SocialLinks {
  website?: string;
  fb?: string;
  tw?: string;
  in?: string;
}

export interface Country {
  code?: string;
  name?: string;
  flag?: string;
  zone?: Zone;
}

export interface Skill {
  name?: string;
  level?: number;
}

export interface Member {
  _id: string;
  folio?: string;
  name: string;
  last_name: string;
  email: string;
  phone?: string;
  mobile?: string;
  range: MemberRange;
  picture?: string;
  social?: SocialLinks;
  categories: MemberCategory[];
  country?: Country;
  city?: string;
  nationality?: string;
  languages: string[];
  education?: string;
  resume?: string;
  skills: Skill[];
  status: MemberStatus;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Enterprise {
  _id: string;
  folio?: string;
  name: string;
  phone?: string;
  picture?: string;
  social?: SocialLinks;
  country?: Country;
  city?: string;
  nationality?: string;
  languages: string[];
  description?: string;
  resume?: string;
  skills: Skill[];
  status: MemberStatus;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Program {
  _id: string;
  title: string;
  length: number;
  enterprise?: string | Enterprise | null;
  skills: Skill[];
  description?: string;
  photo?: string;
  participants: Array<string | Member>;
  status: ProgramStatus;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/** A program as the API returns it, with its enterprise resolved by `populate`. */
export type ProgramWithEnterprise = Program & { enterprise?: Enterprise | null };

type PersistedKeys = "_id" | "createdAt" | "updatedAt";

export type CreateMemberInput = Omit<Member, PersistedKeys>;
export type UpdateMemberInput = Partial<CreateMemberInput>;
export type CreateEnterpriseInput = Omit<Enterprise, PersistedKeys>;
export type UpdateEnterpriseInput = Partial<CreateEnterpriseInput>;
export type CreateProgramInput = Omit<Program, PersistedKeys>;
export type UpdateProgramInput = Partial<CreateProgramInput>;
