import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { Plus, PlusCircle } from "lucide-react";

import { getUserSubscriptionStatus } from "@/queries/subscription";
import { getFolders } from "@/queries/folder";
import {
  getCollaboratingWorkspaces,
  getPrivateWorkspaces,
  getSharedWorkspaces,
} from "@/queries/workspace";

import WorkspaceDropdown from "./workspace-dropdown.module";
import WorkspaceCreator from "@/components/global/workspace-creator.global";
import PlanUsage from "./plan-usage.module";
import CustomDialog from "@/components/global/custom-dialog.global";
import FoldersList from "./folders-list.module";
import WorkspaceNavigation from "./workspace-navigation.module";
import { ScrollArea } from "@/components/ui/scroll-area";

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

  // if (subscriptionError || foldersError) redirect("/dashboard");
  // console.log(subscriptionError)
  // console.log(foldersError)

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
        "hidden sm:flex sm:flex-col w-[280px] shrink-0 p-4 md:gap-4 justify-between bg-sidebar z-40",
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
        <CustomDialog
          trigger={
            <button className="flex transition-all cursor-pointer text-sm font-medium rounded-md hover:bg-muted text-muted-foreground justify-between items-center gap-2 p-2 w-full">
              Create workspace
              <Plus className="size-3" />
            </button>
          }
          header="Create a workspace"
          content={<WorkspaceCreator />}
          description="Workspace give you the power to collaborate with others. You 
        can change your workspace privacy settings after creating workspace too."
        />
        <PlanUsage
          foldersLength={folders?.length || 0}
          subscription={subscription}
        />
        <WorkspaceNavigation workspaceId={workspaceId} />
        <ScrollArea className="h-[450px] overflow-auto relative">
          <FoldersList
            defaultFolders={folders || []}
            workspaceId={workspaceId}
          />
        </ScrollArea>
      </div>
    </aside>
  );
};

export default WorkspaceSidebar;
