import { removeEnterprise } from "~~/server/services/enterprise.service";
import { requireRouterParam } from "~~/server/utils/request";

export default defineEventHandler(async (event) => {
  return await removeEnterprise(
    requireRouterParam(event, "id", "Enterprise ID"),
  );
});
