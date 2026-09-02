import mongoose from "mongoose";

const { mongodbUri: uri } = useRuntimeConfig();

type Cache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};
const g = globalThis as unknown as { _mongoose?: Cache };
const cache = (g._mongoose ||= { conn: null, promise: null });

export async function connectDb() {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(uri, {
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 5000,
      })
      .then((instance) => instance)
      .catch((error) => {
        cache.promise = null;
        throw error;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
