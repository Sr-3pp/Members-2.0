import { connectDb } from "~~/server/db/mongoose";

export default defineEventHandler(async () => {
  try {
    const conn = await connectDb();

    return {
      status: "ok",
      database: "connected",
      host: conn.connection.host,
      name: conn.connection.name,
      readyState: conn.connection.readyState, // 1 = connected
      time: new Date().toISOString(),
    };
  } catch (error: unknown) {
    return {
      status: "error",
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error",
      time: new Date().toISOString(),
    };
  }
});
