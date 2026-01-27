import { patchProgram } from "~~/server/services/program.service";
import { Program } from "~~/server/models/Program";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Program ID is required",
    });
  }

  const body = await readBody<Program>(event);

  return await patchProgram(id, body);
});
