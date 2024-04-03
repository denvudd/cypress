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

/** Get folder details by folder ID */
export const getFolderDetails = async (folderId: string) => {
  const isValid = validate(folderId);

  if (!isValid) {
    return {
      data: [],
      error: "Error",
    };
  }

  try {
    const response = (await db
      .select()
      .from(folders)
      .where(eq(folders.id, folderId))
      .limit(1)) as Folder[];

    return { data: response, error: null };
  } catch (error) {
    return { data: [], error: `Error ${error}` };
  }
};

/** Create folder */
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

/** Update folder by folder ID */
export async function updateFolder(folder: Partial<Folder>, folderId: string) {
  try {
    const response = await db
      .update(folders)
      .set(folder)
      .where(eq(folders.id, folderId));

    return { data: null, error: null };
  } catch (error) {
    return {
      data: null,
      error: `Error: ${error}`,
    };
  }
}

/** Delete folder by folder ID */
export async function deleteFolder(folderId: string) {
  if (!folderId)
    return {
      data: null,
      error: "No folder ID provided",
    };

  await db.delete(folders).where(eq(folders.id, folderId));
}
