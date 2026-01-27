import { promises as fs } from "node:fs";
import { join } from "node:path";

export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event);
  const file = form?.find((f) => f.name === "file");

  if (!file || !file.data) {
    throw createError({ statusCode: 400, statusMessage: "No file uploaded" });
  }

  // ✅ Validate image
  if (!file.type?.startsWith("image/")) {
    throw createError({
      statusCode: 400,
      statusMessage: "Only images allowed",
    });
  }

  // ✅ Create upload dir
  const uploadDir = join(process.cwd(), "public/uploads/members");
  await fs.mkdir(uploadDir, { recursive: true });

  // ✅ Safe filename
  const ext = file.filename?.split(".").pop() || "jpg";
  const filename = `${crypto.randomUUID()}.${ext}`;

  const filePath = join(uploadDir, filename);

  // ✅ Write file
  await fs.writeFile(filePath, file.data);

  // ✅ Public URL
  const publicUrl = `/uploads/members/${filename}`;

  return publicUrl;
});
