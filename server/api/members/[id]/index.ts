import { getMember } from "~~/server/services/member.service";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id") as string;
  return await getMember(id);
});
