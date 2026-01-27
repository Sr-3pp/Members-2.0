import { listEnterprises } from "~~/server/services/enterprise.service";

export default defineEventHandler(async () => {
  return await listEnterprises();
});
