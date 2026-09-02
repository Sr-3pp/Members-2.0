import { registerMember } from "~~/server/services/member.service";
import type { CreateMemberInput } from "~~/shared/types/entities";

export default defineEventHandler(async (event) => {
  const body = await readBody<CreateMemberInput>(event);
  return await registerMember(body);
});
