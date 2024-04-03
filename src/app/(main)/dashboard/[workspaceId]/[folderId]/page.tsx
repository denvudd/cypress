import React from "react";
import { redirect } from "next/navigation";
import { getFolderDetails } from "@/queries/folder";
import Editor from "@/components/modules/editor/editor.module";

export const dynamic = "force-dynamic";
interface FolderPageProps {
  params: {
    workspaceId: string | undefined;
    folderId: string | undefined;
  };
}

const FolderPage: React.FC<FolderPageProps> = async ({ params }) => {
  const { workspaceId, folderId } = params;

  if (!workspaceId) redirect("/dashboard");
  if (!folderId) redirect(`/dashboard/${workspaceId}`);

  const { data, error } = await getFolderDetails(folderId);

  if (error || !data.length) redirect("/dashboard");

  return (
    <div className="relative">
      <Editor dirType="folder" targetId={folderId} dirDetails={data[0] || {}} />
    </div>
  );
};

export default FolderPage;
