import { searchMembers } from "~~/server/services/member.service";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const name =
    typeof query.name === "string"
      ? query.name
      : typeof query.q === "string"
        ? query.q
        : undefined;
  const country = typeof query.country === "string" ? query.country : undefined;
  const category = typeof query.category === "string" ? query.category : undefined;
  const status = typeof query.status === "string" ? query.status : undefined;
  const parsedLimit = typeof query.limit === "string" ? Number(query.limit) : 20;

  return await searchMembers({
    query: name,
    country,
    category,
    status,
    limit: Number.isFinite(parsedLimit) ? parsedLimit : 20,
  });
});
