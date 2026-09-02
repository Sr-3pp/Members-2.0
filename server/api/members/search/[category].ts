import { searchMembersByCategory } from "~~/server/services/member.service";
import { requireRouterParam } from "~~/server/utils/request";

export default defineEventHandler(async (event) => {
  return await searchMembersByCategory(
    requireRouterParam(event, "category", "Category"),
  );
});
