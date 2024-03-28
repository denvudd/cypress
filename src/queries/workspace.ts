"use server";

import db from "@/lib/supabase/db";
import { Workspace } from "@/types/supabase.types";
import { users, workspaces } from "../../migrations/schema";
import { notExists, and, eq } from "drizzle-orm";
import { collaborators } from "@/lib/supabase/schema";

/** Get workspace by user id */
export async function getWorkspaceByUserId(userId: string) {
  const workspace = await db.query.workspaces.findFirst({
    where: (workspace, { eq }) => eq(workspace.workspaceOwner, userId),
  });

  return workspace;
}

/** Creating workspace */
export async function createWorkspace(workspace: Workspace) {
  try {
    const response = await db.insert(workspaces).values(workspace);

    return { data: null, error: null };
  } catch (error) {
    console.log(error);
    return { data: null, error: "Error" };
  }
}

/** Get only private workspaces */
export async function getPrivateWorkspaces(userId: string) {
  if (!userId) return [];

  const privateWorkspaces: Workspace[] = await db
    .select({
      id: workspaces.id,
      createdAt: workspaces.createdAt,
      workspaceOwner: workspaces.workspaceOwner,
      title: workspaces.title,
      iconId: workspaces.iconId,
      data: workspaces.data,
      inTrash: workspaces.inTrash,
      logo: workspaces.logo,
      bannerUrl: workspaces.bannerUrl,
    })
    .from(workspaces)
    .where(
      and(
        notExists(
          db
            .select()
            .from(collaborators)
            .where(eq(collaborators.workspaceId, workspaces.id))
        ),
        eq(workspaces.workspaceOwner, userId)
      )
    );

  return privateWorkspaces;
}

/** Get only collaborating workspaces */
export async function getCollaboratingWorkspaces(userId: string) {
  if (!userId) return [];

  const collaboratingWorkspaces: Workspace[] = await db
    .select({
      id: workspaces.id,
      createdAt: workspaces.createdAt,
      workspaceOwner: workspaces.workspaceOwner,
      title: workspaces.title,
      iconId: workspaces.iconId,
      data: workspaces.data,
      inTrash: workspaces.inTrash,
      logo: workspaces.logo,
      bannerUrl: workspaces.bannerUrl,
    })
    .from(users)
    .innerJoin(collaborators, eq(users.id, collaborators.userId))
    .innerJoin(workspaces, eq(collaborators.workspaceId, workspaces.id))
    .where(eq(users.id, userId));

  return collaboratingWorkspaces;
}

/** Get only shared workspaces */
export async function getSharedWorkspaces(userId: string) {
  if (!userId) return [];

  const sharedWorkspaces: Workspace[] = await db
    .select({
      id: workspaces.id,
      createdAt: workspaces.createdAt,
      workspaceOwner: workspaces.workspaceOwner,
      title: workspaces.title,
      iconId: workspaces.iconId,
      data: workspaces.data,
      inTrash: workspaces.inTrash,
      logo: workspaces.logo,
      bannerUrl: workspaces.bannerUrl,
    })
    .from(workspaces)
    .orderBy(workspaces.createdAt)
    .innerJoin(collaborators, eq(workspaces.id, collaborators.workspaceId))
    .where(eq(workspaces.workspaceOwner, userId));

  return sharedWorkspaces;
}
