import { registerEnterprise } from "~~/server/services/enterprise.service";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return await registerEnterprise(body);
});
