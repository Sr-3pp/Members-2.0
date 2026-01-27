import { searchMembersByCategory } from "~~/server/services/member.service";

export default defineEventHandler(async (event) => {
  const category = getRouterParam(event, "category");

  return await searchMembersByCategory(category as string);
});
