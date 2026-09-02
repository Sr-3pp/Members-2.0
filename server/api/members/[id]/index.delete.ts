import { removeMember } from "~~/server/services/member.service";
import { requireRouterParam } from "~~/server/utils/request";

export default defineEventHandler(async (event) => {
  return await removeMember(requireRouterParam(event, "id", "Member ID"));
});
