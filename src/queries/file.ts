"use server";

import db from "@/lib/supabase/db";
import { files } from "../../migrations/schema";
import { File } from "@/types/supabase.types";
import { eq } from "drizzle-orm";
import { validate, validate as validateUUID } from "uuid";

/** Get files by folder ID */
export async function getFiles(folderId: string) {
  const isValid = validateUUID(folderId);

  if (!isValid) return { data: null, error: "Error" };

  try {
    const results = (await db
      .select()
      .from(files)
      .orderBy(files.createdAt)
      .where(eq(files.folderId, folderId))) as File[] | [];

    return { data: results, error: null };
  } catch (error) {
    return { data: null, error: "Error" };
  }
}

/** Get file details by file ID */
export const getFileDetails = async (fileId: string) => {
  const isValid = validate(fileId);

  if (!isValid) {
    return {
      data: [],
      error: "Error",
    };
  }
  try {
    const response = (await db
      .select()
      .from(files)
      .where(eq(files.id, fileId))
      .limit(1)) as File[];
    return { data: response, error: null };
  } catch (error) {
    return { data: [], error: `Error ${error}` };
  }
};

/** Create file */
export async function createFile(file: File) {
  try {
    await db.insert(files).values(file);
    return { data: null, error: null };
  } catch (error) {
    return { data: null, error: "Error" };
  }
}

/** Update file by file ID */
export async function updateFile(file: Partial<File>, fileId: string) {
  try {
    const response = await db
      .update(files)
      .set(file)
      .where(eq(files.id, fileId));

    return { data: null, error: null };
  } catch (error) {
    return { data: null, error: "Error" };
  }
}

/** Delete file by file ID */
export async function deleteFile(fileId: string) {
  if (!fileId)
    return {
      data: null,
      error: "No file ID provided",
    };

  await db.delete(files).where(eq(files.id, fileId));
}
