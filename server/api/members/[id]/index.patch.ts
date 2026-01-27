import { patchMember } from "~~/server/services/member.service";
import MemberSchema from "~~/server/models/Member";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Member ID is required",
    });
  }

  const body = await readBody(event);

  return await patchMember(id, body as Partial<typeof MemberSchema.prototype>);
});
