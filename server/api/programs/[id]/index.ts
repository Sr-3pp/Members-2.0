import { getProgram } from "~~/server/services/program.service";
import { requireRouterParam } from "~~/server/utils/request";

export default defineEventHandler(async (event) => {
  return await getProgram(requireRouterParam(event, "id", "Program ID"));
});
