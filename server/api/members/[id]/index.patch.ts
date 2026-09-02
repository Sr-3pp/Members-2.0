import { patchMember } from "~~/server/services/member.service";
import type { UpdateMemberInput } from "~~/shared/types/entities";
import { requireRouterParam } from "~~/server/utils/request";

export default defineEventHandler(async (event) => {
  const id = requireRouterParam(event, "id", "Member ID");
  const body = await readBody<UpdateMemberInput>(event);
  return await patchMember(id, body);
});
