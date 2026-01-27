import { listMembers } from "~~/server/services/member.service";

export default defineEventHandler(async () => {
  return await listMembers();
});
