import { getMember } from "~~/server/services/member.service";
import { requireRouterParam } from "~~/server/utils/request";

export default defineEventHandler(async (event) => {
  return await getMember(requireRouterParam(event, "id", "Member ID"));
});
