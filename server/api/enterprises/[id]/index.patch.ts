import { patchEnterprise } from "~~/server/services/enterprise.service";
import { Enterprise } from "~~/server/models/Enterprise";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Enterprise ID is required",
    });
  }

  const body = await readBody<Enterprise>(event);

  return await patchEnterprise(id, body);
});
