import { searchEnterprises } from "~~/server/services/enterprise.service";
import {
  optionalQueryString,
  queryLimit,
} from "~~/server/utils/request";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  return await searchEnterprises({
    query: optionalQueryString(query.q),
    country: optionalQueryString(query.country),
    status: optionalQueryString(query.status),
    limit: queryLimit(query.limit),
  });
});
