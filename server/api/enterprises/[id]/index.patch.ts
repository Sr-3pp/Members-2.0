import { patchEnterprise } from "~~/server/services/enterprise.service";
import type { UpdateEnterpriseInput } from "~~/shared/types/entities";
import { requireRouterParam } from "~~/server/utils/request";

export default defineEventHandler(async (event) => {
  const id = requireRouterParam(event, "id", "Enterprise ID");
  const body = await readBody<UpdateEnterpriseInput>(event);
  return await patchEnterprise(id, body);
});
