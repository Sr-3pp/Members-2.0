import { searchMembers } from "~~/server/services/member.service";
import { searchFiltersFromQuery } from "~~/server/utils/search";

export default defineEventHandler(
  async (event) => await searchMembers(searchFiltersFromQuery(event)),
);
