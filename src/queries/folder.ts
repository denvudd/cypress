"use server";

import db from "@/lib/supabase/db";
import { validate } from "uuid";
import { folders } from "../../migrations/schema";
import { eq } from "drizzle-orm";
import { Folder } from "@/types/supabase.types";

/** Get all folders by workspace */
export async function getFolders(workspaceId: string) {
  const isValidId = validate(workspaceId);

  if (!isValidId) {
    return {
      data: null,
      error: "Invalid ID",
    };
  }

  try {
    const results: Folder[] = await db
      .select()
      .from(folders)
      .orderBy(folders.createdAt)
      .where(eq(folders.workspaceId, workspaceId));

    return {
      data: results,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: `Error ${error}`,
    };
  }
}

export async function createFolder(folder: Folder) {
  try {
    const response = await db.insert(folders).values(folder);

    return { data: null, error: null };
  } catch (error) {
    return {
      data: null,
      error: `Error: ${error}`,
    };
  }
}
