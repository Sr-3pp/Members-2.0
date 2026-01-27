import { getEnterprise } from "~~/server/services/enterprise.service";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id") as string;
  console.log("Fetching enterprise with ID:", id);
  return await getEnterprise(id);
});
