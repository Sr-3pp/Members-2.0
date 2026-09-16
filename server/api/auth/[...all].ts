import { getAuth } from "../../utils/betterAuth";

export default defineEventHandler(async (event) => {
  const auth = await getAuth();
  return auth.handler(toWebRequest(event));
});
