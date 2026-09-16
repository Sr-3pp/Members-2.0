import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { connectDb } from "../db/mongoose";
import { createAuth } from "../lib/auth";

let auth: ReturnType<typeof createAuth> | undefined;

export async function getAuth() {
  if (auth) return auth;
  const { betterAuthSecret, betterAuthUrl } = useRuntimeConfig();
  if (betterAuthSecret.length < 32 || !betterAuthUrl) {
    throw createError({ statusCode: 503, statusMessage: "Authentication is not configured" });
  }
  const connection = await connectDb();
  auth = createAuth({
    database: mongodbAdapter(connection.connection.db!),
    secret: betterAuthSecret,
    baseURL: betterAuthUrl,
  });
  return auth;
}
