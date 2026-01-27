import { searchEnterprises } from "~~/server/services/enterprise.service";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const q = typeof query.q === "string" ? query.q : "";
  const status = typeof query.status === "string" ? query.status : undefined;
  const limit = query.limit ? Number(query.limit) || 20 : 20;

  return await searchEnterprises(q, status, limit);
});
