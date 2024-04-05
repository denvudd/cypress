import React from "react";
import WorkspaceSidebar from "@/components/modules/workspace-sidebar/workspace-sidebar.module";
import WorkspaceMobileSidebar from "@/components/modules/workspace-sidebar/workspace-mobile-sidebar/workspace-mobile-sidebar.module";
import { redirect } from "next/navigation";

interface WorkspaceIdLayoutProps {
  children: React.ReactNode;
  params: {
    workspaceId: string | undefined;
  };
}

const WorkspaceIdLayout: React.FC<WorkspaceIdLayoutProps> = ({
  children,
  params,
}) => {
  if (!params.workspaceId) redirect("/dashboard");

  return (
    <main className="flex overflow-hidden h-screen w-screen">
      <WorkspaceSidebar workspaceId={params.workspaceId} />
      <WorkspaceMobileSidebar>
        <WorkspaceSidebar
          workspaceId={params.workspaceId}
          className="w-screen inline-block sm:hidden"
        />
      </WorkspaceMobileSidebar>
      <div className="dark:border-border/70 border-l w-full relative overflow-x-hidden overflow-y-auto">
        {children}
      </div>
    </main>
  );
};

export default WorkspaceIdLayout;
