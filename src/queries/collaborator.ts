"use server";

import db from "@/lib/supabase/db";
import { collaborators } from "@/lib/supabase/schema";
import { User } from "@/types/supabase.types";
import { and, eq } from "drizzle-orm";

/** Add collaborators to public workspace */
export async function addCollaborators(users: User[], workspaceId: string) {
  const response = users.forEach(async (user: User) => {
    const userExists = await db.query.collaborators.findFirst({
      where: (u, { eq }) =>
        and(eq(u.userId, user.id), eq(u.workspaceId, workspaceId)),
    });

    if (!userExists) {
      await db.insert(collaborators).values({ workspaceId, userId: user.id });
    }
  });

  return response;
}

/** Remove collaborator from public workspace */
export async function removeCollaborator(users: User[], workspaceId: string) {
  const response = users.forEach(async (user: User) => {
    const userExists = await db.query.collaborators.findFirst({
      where: (u, { eq }) =>
        and(eq(u.userId, user.id), eq(u.workspaceId, workspaceId)),
    });

    if (userExists) {
      await db
        .delete(collaborators)
        .where(
          and(
            eq(collaborators.workspaceId, workspaceId),
            eq(collaborators.userId, user.id)
          )
        );
    }
  });

  return response;
}
