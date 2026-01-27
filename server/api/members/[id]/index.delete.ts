import { removeMember } from "~~/server/services/member.service";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Member ID is required",
    });
  }

  return await removeMember(id);
});
