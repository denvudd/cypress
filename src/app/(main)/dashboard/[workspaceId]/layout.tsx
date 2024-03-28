import React from "react";
import WorkspaceSidebar from "@/components/modules/workspace-sidebar/workspace-sidebar.module";
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
    <div className="flex overflow-hidden h-screen w-screen">
      <WorkspaceSidebar workspaceId={params.workspaceId} />
      <div className="dark:border-border/70 border-l w-full relative overflow-x-hidden overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export default WorkspaceIdLayout;
