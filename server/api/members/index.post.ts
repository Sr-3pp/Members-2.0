import { registerMember } from "~~/server/services/member.service";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return await registerMember(body);
});
