import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteFolder, updateFolder } from "@/queries/folder";
import { deleteFile, updateFile } from "@/queries/file";

import { Button } from "@/components/ui/button";
import { useAppState } from "@/hooks/use-app-state";
import { DirectionType } from "@/types/global.type";

interface EditorDeletePanelProps {
  targetId: string;
  inTrash: string | null | undefined;
  dirType: DirectionType;
}

const EditorDeletePanel: React.FC<EditorDeletePanelProps> = ({
  targetId,
  dirType,
  inTrash,
}) => {
  const router = useRouter();
  const { folderId, workspaceId, dispatch } = useAppState();

  if (!inTrash) return undefined;

  // Restore file from Trash to workspace
  const handleRestoreFile = async () => {
    if (dirType === "file") {
      if (!folderId || !workspaceId || !targetId) return undefined;

      dispatch({
        type: "UPDATE_FILE",
        payload: {
          file: {
            inTrash: "",
          },
          fileId: targetId,
          folderId,
          workspaceId,
        },
      });

      await updateFile({ inTrash: "" }, targetId);
    }

    if (dirType === "folder") {
      if (!folderId || !workspaceId) return undefined;

      dispatch({
        type: "UPDATE_FOLDER",
        payload: {
          folder: { inTrash: "" },
          folderId: targetId,
          workspaceId,
        },
      });

      await updateFolder({ inTrash: "" }, targetId);
    }
  };

  // Delete file permanently from Trash
  const handleDeleteFile = async () => {
    if (dirType === "file") {
      if (!folderId || !workspaceId || !targetId) return undefined;

      dispatch({
        type: "DELETE_FILE",
        payload: {
          fileId: targetId,
          folderId,
          workspaceId,
        },
      });

      await deleteFile(targetId);
      router.replace(`/dashboard/${workspaceId}/${folderId}`);
    }

    if (dirType === "folder") {
      if (!folderId || !workspaceId) return undefined;

      dispatch({
        type: "DELETE_FOLDER",
        payload: {
          folderId: targetId,
          workspaceId,
        },
      });

      await deleteFolder(targetId);
      router.replace(`/dashboard/${workspaceId}`);
    }

    toast.success(
      `${dirType === "file" ? "File" : "Folder"} deleted successfully!`
    );
  };

  return (
    <article
      className="py-2 z-40 bg-destructive flex md:flex-row flex-col justify-center items-center gap-4 flex-wrap 
      slide-in-from-top-[48%] animate-in fade-in-0 zoom-in-95"
    >
      <div className="flex flex-col sm:flex-row gap-2 justify-between w-full px-4 items-center">
        <div className="flex flex-col text-center sm:text-left">
          <span className="text-white text-sm font-medium">
            This {dirType} in the trash.
          </span>
          <span className="text-white text-xs font-medium">{inTrash}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="bg-transparent border-white text-white hover:bg-white hover:text-[#EB5757]"
            variant="outline"
            onClick={handleRestoreFile}
          >
            Restore
          </Button>
          <Button
            size="sm"
            className="bg-transparent border-white text-white hover:bg-white hover:text-[#EB5757]"
            variant="outline"
            onClick={handleDeleteFile}
          >
            Delete
          </Button>
        </div>
      </div>
    </article>
  );
};

export default EditorDeletePanel;
