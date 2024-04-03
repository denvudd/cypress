import React from "react";
import { redirect } from "next/navigation";
import { getWorkspaceDetails } from "@/queries/workspace";
import Editor from "@/components/modules/editor/editor.module";

export const dynamic = "force-dynamic";
interface WorkspacePageProps {
  params: {
    workspaceId: string | undefined;
  };
}

const WorkspacePage: React.FC<WorkspacePageProps> = async ({ params }) => {
  const { workspaceId } = params;

  if (!workspaceId) redirect("/dashboard");

  const { data, error } = await getWorkspaceDetails(workspaceId);

  if (error || !data.length) redirect("/dashboard");

  return (
    <div className="relative">
      <Editor
        dirType="workspace"
        targetId={workspaceId}
        dirDetails={data[0] || {}}
      />
    </div>
  );
};

export default WorkspacePage;
