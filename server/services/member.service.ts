import {
  createMember,
  findMemberById,
  findMember,
  deleteMember,
  updateMember,
  getMembersByCategory,
  searchMembers as repoSearchMembers,
} from "../repositories/member.repo";
import type { MemberSearchFilters } from "../repositories/member.repo";

import type { Member } from "../models/Member";

export async function listMembers() {
  return await findMember();
}

export async function getMember(id: string) {
  const user = await findMemberById(id);
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "Member not found" });
  }
  return user;
}

export async function registerMember(input: Member) {
  // Minimal example: add business logic here
  if (!input.email?.includes("@")) {
    throw createError({ statusCode: 400, statusMessage: "Invalid email" });
  }
  return await createMember(input);
}

export async function removeMember(id: string) {
  const user = await findMemberById(id);
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "Member not found" });
  }

  return await deleteMember(id);
}

export async function patchMember(id: string, input: Member) {
  const user = await findMemberById(id);
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "Member not found" });
  }
  return await updateMember(id, input);
}

export async function searchMembersByCategory(category: string) {
  return await getMembersByCategory(category);
}

export async function searchMembers(filters: MemberSearchFilters) {
  return await repoSearchMembers({
    ...filters,
    query: filters.query?.trim(),
    country: filters.country?.trim().toUpperCase(),
    category: filters.category?.trim(),
    limit: Math.min(Math.max(filters.limit ?? 20, 1), 100),
  });
}
