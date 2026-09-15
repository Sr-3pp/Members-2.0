import { searchPrograms } from "~~/server/services/program.service";
import { searchFiltersFromQuery } from "~~/server/utils/search";

export default defineEventHandler(
  async (event) => await searchPrograms(searchFiltersFromQuery(event)),
);
