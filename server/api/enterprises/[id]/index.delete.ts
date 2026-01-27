import { removeEnterprise } from "~~/server/services/enterprise.service";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Enterprise ID is required",
    });
  }

  return await removeEnterprise(id);
});
