"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink, FileIcon, FolderIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useAppState } from "@/hooks/use-app-state";
import { AppFoldersType } from "@/lib/providers/app-state.provider";
import { File } from "@/types/supabase.types";
import CypressTrashIcon from "@/components/ui/icons/trash-icon";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Trash: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { state: appState, workspaceId } = useAppState();

  const [folders, setFolders] = React.useState<AppFoldersType[] | []>([]);
  const [files, setFiles] = React.useState<File[] | []>([]);

  React.useEffect(() => {
    const currentWorkspace = appState.workspaces.find(
      (workspace) => workspace.id === workspaceId
    );

    const trashedFolders =
      currentWorkspace?.folders.filter((folder) => folder.inTrash) || [];

    const trashedFiles: File[] =
      currentWorkspace?.folders
        .flatMap((folder) => folder.files)
        .filter((file) => file.inTrash) || [];

    setFolders(trashedFolders);
    setFiles(trashedFiles);
  }, [appState, workspaceId]);

  return (
    <Dialog>
      <DialogTrigger>
        <li>
          <div className="group/native flex items-center transition-all gap-2">
            <CypressTrashIcon className="size-5" />
            <span className="text-sm font-medium">Trash</span>
          </div>
        </li>
      </DialogTrigger>

      <DialogContent className="max-h-[520px]">
        <DialogHeader>
          <DialogTitle>Trash</DialogTitle>
          <DialogDescription>
            Permanently delete files and folders or restore them.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          {!!folders.length && (
            <div className="flex flex-col gap-2">
              <h3>Folders</h3>
              <Separator />
              <div className="flex flex-col gap-1">
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    className="hover:bg-muted group/item rounded-md p-1 flex item-center justify-between transition-colors"
                  >
                    <article>
                      <aside className="flex text-sm font-medium items-center gap-2">
                        <FileIcon className="size-4 text-muted-foreground" />
                        {folder.title}
                      </aside>
                    </article>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={`/dashboard/${folder.workspaceId}/${folder.id}`}
                        >
                          <ExternalLink className="opacity-0 group-hover/item:opacity-100 transition-opacity mr-1 size-4" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent align="end">View folder</TooltipContent>
                    </Tooltip>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!!files.length && (
            <>
              <h3>Files</h3>
              <Separator />
              <div className="flex flex-col gap-1">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="hover:bg-muted group/item rounded-md p-1 flex item-center justify-between transition-colors"
                  >
                    <article>
                      <aside className="flex text-sm font-medium items-center gap-2">
                        <FileIcon className="size-4 text-muted-foreground" />
                        {file.title}
                      </aside>
                    </article>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={`/dashboard/${file.workspaceId}/${file.folderId}/${file.id}`}
                        >
                          <ExternalLink className="opacity-0 group-hover/item:opacity-100 transition-opacity mr-1 size-4" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent align="end">View file</TooltipContent>
                    </Tooltip>
                  </div>
                ))}
              </div>
            </>
          )}

          {!files.length && !folders.length && (
            <div className="text-muted-foreground text-sm font-medium h-[70px] flex items-center flex-col justify-center">
              No items in trash
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Trash;
