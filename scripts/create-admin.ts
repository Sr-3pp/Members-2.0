import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { createAuth } from "../server/lib/auth";
import { loginSchema } from "../shared/utils/auth";

async function main() {
  try { process.loadEnvFile(); } catch { /* Environment variables may be supplied directly. */ }
  const uri = process.env.MONGODB_URI ?? process.env.NUXT_MONGODB_URI;
  const secret = process.env.NUXT_BETTER_AUTH_SECRET;
  const baseURL = process.env.NUXT_BETTER_AUTH_URL;
  const credentials = loginSchema.parse({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
  if (!uri || !secret || secret.length < 32 || !baseURL) {
    throw new Error("Set MONGODB_URI, NUXT_BETTER_AUTH_SECRET (32+ characters), and NUXT_BETTER_AUTH_URL.");
  }
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  try {
    await client.connect();
    const auth = createAuth({ database: mongodbAdapter(client.db()), secret, baseURL });
    await auth.api.createUser({
      body: { ...credentials, name: process.env.ADMIN_NAME || "Administrator", role: "admin" },
    });
    console.log("Better Auth admin account created.");
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Could not create admin.");
  process.exitCode = 1;
});
