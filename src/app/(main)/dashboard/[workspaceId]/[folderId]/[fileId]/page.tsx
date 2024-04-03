import React from "react";
import { redirect } from "next/navigation";
import { getFileDetails } from "@/queries/file";
import Editor from "@/components/modules/editor/editor.module";

export const dynamic = "force-dynamic";
interface FilePageProps {
  params: {
    workspaceId: string | undefined;
    folderId: string | undefined;
    fileId: string | undefined;
  };
}

const FilePage: React.FC<FilePageProps> = async ({ params }) => {
  const { workspaceId, folderId, fileId } = params;

  if (!workspaceId) redirect("/dashboard");
  if (!folderId) redirect(`/dashboard/${workspaceId}`);
  if (!fileId) redirect(`/dashboard/${workspaceId}/${folderId}`);

  const { data, error } = await getFileDetails(fileId);

  if (error || !data.length) redirect("/dashboard");

  return (
    <div className="relative">
      <Editor dirType="file" targetId={fileId} dirDetails={data[0] || {}} />
    </div>
  );
};

export default FilePage;
