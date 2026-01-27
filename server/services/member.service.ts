import {
  createMember,
  findMemberById,
  findMember,
  deleteMember,
  updateMember,
  getMembersByCategory,
  searchMembers as repoSearchMembers,
} from "../repositories/member.repo";

import { Member } from "../models/Member";

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

export async function searchMembers(query: string, status?: string, limit = 20) {
  return await repoSearchMembers(query, status, limit);
}
