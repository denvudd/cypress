import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

import { getUserSubscriptionStatus } from "@/queries/subscription";
import { getFolders } from "@/queries/folder";
import {
  getCollaboratingWorkspaces,
  getPrivateWorkspaces,
  getSharedWorkspaces,
} from "@/queries/workspace";

import WorkspaceDropdown from "./workspace-dropdown.module";

import { cn } from "@/lib/utils";

interface WorkspaceSidebarProps {
  workspaceId: string;
  className?: string;
}

const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = async ({
  className,
  workspaceId,
}) => {
  const supabaseClient = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (!user) return null;

  const { data: subscription, error: subscriptionError } =
    await getUserSubscriptionStatus(user.id);
  const { data: folders, error: foldersError } = await getFolders(workspaceId);

  if (subscriptionError || foldersError) redirect("/dashboard");

  const [privateWorkspaces, collaboratingWorkspaces, sharedWorkspaces] =
    await Promise.all([
      getPrivateWorkspaces(user.id),
      getCollaboratingWorkspaces(user.id),
      getSharedWorkspaces(user.id),
    ]);

  const defaultWorkspace = [
    ...privateWorkspaces,
    ...collaboratingWorkspaces,
    ...sharedWorkspaces,
  ].find((workspace) => workspace.id === workspaceId);

  return (
    <aside
      className={cn(
        "hidden sm:flex sm:flex-col w-[280px] shrink-0 p-4 md:gap-4 justify-between",
        {
          className,
        }
      )}
    >
      <div className="">
        <WorkspaceDropdown
          collaboratingWorkspaces={collaboratingWorkspaces}
          defaultValue={defaultWorkspace}
          privateWorkspaces={privateWorkspaces}
          sharedWorkspaces={sharedWorkspaces}
        />
      </div>
    </aside>
  );
};

export default WorkspaceSidebar;
