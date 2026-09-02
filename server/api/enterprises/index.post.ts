import { registerEnterprise } from "~~/server/services/enterprise.service";
import type { CreateEnterpriseInput } from "~~/shared/types/entities";

export default defineEventHandler(async (event) => {
  const body = await readBody<CreateEnterpriseInput>(event);
  return await registerEnterprise(body);
});
