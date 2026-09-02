import { patchProgram } from "~~/server/services/program.service";
import type { UpdateProgramInput } from "~~/shared/types/entities";
import { requireRouterParam } from "~~/server/utils/request";

export default defineEventHandler(async (event) => {
  const id = requireRouterParam(event, "id", "Program ID");
  const body = await readBody<UpdateProgramInput>(event);
  return await patchProgram(id, body);
});
