"use server";

import db from "@/lib/supabase/db";
import { files } from "../../migrations/schema";
import { File } from "@/types/supabase.types";
import { eq } from "drizzle-orm";
import { validate as validateUUID } from "uuid";

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

export async function createFile(file: File) {
  try {
    await db.insert(files).values(file);
    return { data: null, error: null };
  } catch (error) {
    return { data: null, error: "Error" };
  }
}

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
