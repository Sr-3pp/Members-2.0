import {
  createMember,
  findMemberById,
  findMember,
  deleteMember,
  updateMember,
  searchMembers as repoSearchMembers,
} from "../repositories/member.repo";
import type {
  CreateMemberInput,
  UpdateMemberInput,
} from "~~/shared/types/entities";
import { normalizeSearchFilters, type SearchFilters } from "../utils/search";
import { requireEntity } from "../utils/service";

export async function listMembers() {
  return await findMember();
}

export async function getMember(id: string) {
  return requireEntity(await findMemberById(id), "Member");
}

export async function registerMember(input: CreateMemberInput) {
  // Minimal example: add business logic here
  if (!input.email?.includes("@")) {
    throw createError({ statusCode: 400, statusMessage: "Invalid email" });
  }
  return await createMember(input);
}

export async function removeMember(id: string) {
  return requireEntity(await deleteMember(id), "Member");
}

export async function patchMember(id: string, input: UpdateMemberInput) {
  return requireEntity(await updateMember(id, input), "Member");
}

export async function searchMembersByCategory(category: string) {
  return await searchMembers({ category });
}

export async function searchMembers(filters: SearchFilters) {
  return await repoSearchMembers(normalizeSearchFilters(filters));
}
