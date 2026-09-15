import { searchEnterprises } from "~~/server/services/enterprise.service";
import { searchFiltersFromQuery } from "~~/server/utils/search";

export default defineEventHandler(
  async (event) => await searchEnterprises(searchFiltersFromQuery(event)),
);
