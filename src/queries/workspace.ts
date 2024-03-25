"use server";

import db from "@/lib/supabase/db";
import { Workspace } from "@/types/supabase.types";
import { workspaces } from "../../migrations/schema";

/** Get workspace by user id */
export async function getWorkspaceByUserId(userId: string) {
  const workspace = await db.query.workspaces.findFirst({
    where: (workspace, { eq }) => eq(workspace.workspaceOwner, userId),
  });

  return workspace;
}

export async function createWorkspace (workspace: Workspace) {
  try {
    const response = await db.insert(workspaces).values(workspace);
    
    return { data: null, error: null };
  } catch (error) {
    console.log(error);
    return { data: null, error: "Error" };
  }
};
