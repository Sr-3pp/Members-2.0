import { searchMembers } from "~~/server/services/member.service";
import {
  optionalQueryString,
  queryLimit,
} from "~~/server/utils/request";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  return await searchMembers({
    query: optionalQueryString(query.name) ?? optionalQueryString(query.q),
    country: optionalQueryString(query.country),
    category: optionalQueryString(query.category),
    status: optionalQueryString(query.status),
    limit: queryLimit(query.limit),
  });
});
