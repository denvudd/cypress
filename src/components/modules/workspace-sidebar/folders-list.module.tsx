"use client";

import React from "react";

import { useAppState } from "@/hooks/use-app-state";
import { AppFoldersType } from "@/lib/providers/app-state.provider";
import { Folder } from "@/types/supabase.types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PlusIcon } from "lucide-react";
import { useSupabaseUser } from "@/hooks/user-supabase-user";
import { v4 as uuidv4 } from "uuid";
import { createFolder } from "@/queries/folder";
import { toast } from "sonner";
import { MAX_FOLDERS_FREE_PLAN } from "@/lib/config/constants";
import { Accordion } from "@/components/ui/accordion";
import FolderDropdown from "./folder-dropdown.module";

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

  const [folders, setFolders] = React.useState<Folder[]>(defaultFolders);
  const [favoriteFolders, setFavoriteFolders] = React.useState<Folder[]>([]);

  React.useEffect(() => {
    if (!!defaultFolders.length) {
      dispatch({
        type: "SET_FOLDERS",
        payload: {
          workspaceId,
          folders: defaultFolders.map((folder) => {
            const folders =
              appState.workspaces.find((w) => w.id === workspaceId)?.folders ||
              [];
            const files = folders.find((f) => f.id === folder.id)?.files || [];

            return {
              ...folder,
              files,
            };
          }),
        },
      });
    }
  }, [defaultFolders, workspaceId]);

  React.useEffect(() => {
    // console.log('find', appState.workspaces.find((workspace) => workspace.id === workspaceId))
    setFolders(
      appState.workspaces.find((workspace) => workspace.id === workspaceId)
        ?.folders || []
    );
  }, [appState, workspaceId]);

  React.useEffect(() => {
    setFavoriteFolders(folders?.filter((folder) => folder.inFavorite) || []);
  }, [folders]);

  const handleAddFolder = async () => {
    if (folders?.length >= MAX_FOLDERS_FREE_PLAN && !subscription) {
      // WIP
    }

    const newFolder: Folder = {
      id: uuidv4(),
      data: null,
      createdAt: new Date().toISOString(),
      iconId: "📁",
      inTrash: null,
      inFavorite: null,
      title: `Untitled Folder (${folders.length + 1})`,
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
    <div className="flex flex-col pb-20">
      {favoriteFolders && !!favoriteFolders.length && (
        <div>
          <div className="flex sticky z-20 top-0 w-full my-2 group/title justify-between items-center text-muted-foreground">
            <div className="text-muted-foreground font-medium text-sm">
              Favorite
            </div>
          </div>
          <Accordion
            type="multiple"
            className="pb-0"
            defaultValue={[folderId || ""]}
          >
            {favoriteFolders.map((folder) => (
              <FolderDropdown
                key={folder.id}
                title={folder.title}
                listType="folder"
                id={folder.id}
                inFavorite={folder.inFavorite}
                iconId={folder.iconId}
              />
            ))}
          </Accordion>
        </div>
      )}

      <div>
        <div className="flex sticky z-20 top-0 w-full my-2 group/title justify-between items-center text-muted-foreground">
          <div className="text-muted-foreground font-medium text-sm">
            Private
          </div>

          <Tooltip delayDuration={300}>
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
          className="pb-0"
          defaultValue={[folderId || ""]}
        >
          {folders
            .filter((folder) => !folder.inTrash)
            .map((folder) => (
              <FolderDropdown
                key={folder.id}
                title={folder.title}
                listType="folder"
                id={folder.id}
                inFavorite={folder.inFavorite}
                iconId={folder.iconId}
              />
            ))}
        </Accordion>
      </div>
    </div>
  );
};

export default FoldersList;
