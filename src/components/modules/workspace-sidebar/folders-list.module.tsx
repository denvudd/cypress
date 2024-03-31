"use client";

import React from "react";

import { useAppState } from "@/hooks/use-app-state";
import { AppFoldersType } from "@/lib/providers/app-state.provider";
import { Folder } from "@/types/supabase.types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PlusIcon } from "lucide-react";
import { useSupabaseUser } from "@/hooks/user-supabase-user";
import { v4 as uuidv4 } from "uuid";
import { createFolder } from "@/queries/folder";
import { toast } from "sonner";
import { MAX_FOLDERS_FREE_PLAN } from "@/lib/config/constants";
import { Accordion } from "@/components/ui/accordion";

interface FoldersListProps {
  defaultFolders: Folder[];
  workspaceId: string;
}

const FoldersList: React.FC<FoldersListProps> = ({
  defaultFolders,
  workspaceId,
}) => {
  const { subscription } = useSupabaseUser();
  const { state: appState, folderId, dispatch } = useAppState();
  const [folders, setFolders] = React.useState<AppFoldersType[]>([]);

  React.useEffect(() => {
    if (defaultFolders.length === 0) return;

    const workspace = appState.workspaces.find((ws) => ws.id === workspaceId);
    if (!workspace) return;

    const updatedFolders = defaultFolders.map((folder) => {
      const matchingFolder = workspace.folders.find((f) => f.id === folder.id);
      const files = matchingFolder ? matchingFolder.files : [];

      return { ...folder, files };
    });

    dispatch({
      type: "SET_FOLDERS",
      payload: { workspaceId, folders: updatedFolders },
    });
  }, [defaultFolders, workspaceId]);

  React.useEffect(() => {
    setFolders(
      appState.workspaces.find((workspace) => workspace.id === workspaceId)
        ?.folders || []
    );
  }, [appState, workspaceId]);

  const handleAddFolder = async () => {
    if (folders?.length >= MAX_FOLDERS_FREE_PLAN && !subscription) {
    }

    const newFolder: Folder = {
      id: uuidv4(),
      data: null,
      createdAt: new Date().toISOString(),
      iconId: "📁",
      inTrash: null,
      title: "Untitled Folder",
      workspaceId,
    };

    dispatch({
      type: "ADD_FOLDER",
      payload: {
        workspaceId,
        folder: {
          ...newFolder,
          files: [],
        },
      },
    });

    const { data, error } = await createFolder(newFolder);

    if (error) {
      toast.error("Something went wrong. Please try again.", {
        description: "Could not create a folder",
      });
    }

    toast.success(`Folder created!`);
  };

  return (
    <>
      <div className="flex sticky z-20 top-0 w-full h-10 group/title justify-between items-center text-muted-foreground">
        <div className="text-muted-foreground font-medium text-sm">Folders</div>
        <Tooltip>
          <TooltipTrigger>
            <PlusIcon
              className="size-4 cursor-pointer"
              onClick={handleAddFolder}
            />
          </TooltipTrigger>
          <TooltipContent>Create folder</TooltipContent>
        </Tooltip>
      </div>
      <Accordion
        type="multiple"
        defaultValue={[folderId || ""]}
        className="pb-20"
      >
        {folders
          .filter((folder) => !folder.inTrash)
          .map((folder) => (
            <div className="" key={folder.id}></div>
          ))}
      </Accordion>
    </>
  );
};

export default FoldersList;
