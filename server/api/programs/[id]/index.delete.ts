import { removeProgram } from "~~/server/services/program.service";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Program ID is required",
    });
  }

  return await removeProgram(id);
});
