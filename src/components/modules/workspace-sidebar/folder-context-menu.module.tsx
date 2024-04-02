"use client";

import React from "react";
import { ExternalLink, LinkIcon, Star, StarOff, TrashIcon } from "lucide-react";
import { toast } from "sonner";

import { updateFile } from "@/queries/file";
import { updateFolder } from "@/queries/folder";

import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import { useAppState } from "@/hooks/use-app-state";

interface FolderContextMenuProps {
  workspaceId: string;
  accordionId: string;
  userEmail: string | undefined;
  listType: "folder" | "file";
  inFavorite?: string | null;
}

const FolderContextMenu: React.FC<FolderContextMenuProps> = ({
  listType,
  inFavorite,
  userEmail,
  workspaceId,
  accordionId,
}) => {
  const { dispatch, folderId } = useAppState();

  React.useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      const isCopyLink = event.ctrlKey && event.key === "l";
      const isMoveToTrash = event.ctrlKey && event.key === "Backspace";

      if (isCopyLink) {
        event.preventDefault();
        event.stopPropagation();

        handleCopyLink();

        return undefined;
      }

      if (isMoveToTrash) {
        event.preventDefault();
        event.stopPropagation();

        await handleMoveToTrash();
        
        return undefined;
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [folderId, accordionId, workspaceId, listType]);

  const handleCopyLink = () => {
    if (listType === "folder") {
      navigator.clipboard.writeText(
        `${window.location.origin}/dashboard/${workspaceId}/${accordionId}`
      );
    }

    if (listType === "file") {
      navigator.clipboard.writeText(
        `${window.location.origin}/dashboard/${workspaceId}/${folderId}/${accordionId}`
      );
    }

    toast.success("Link copied to clipboard!");
  };

  const handleMoveToFavorite = async () => {
    if (!userEmail || !workspaceId) return undefined;

    const pathId = accordionId.split("folder");

    if (listType === "folder") {
      dispatch({
        type: "UPDATE_FOLDER",
        payload: {
          folder: { inFavorite: `Moved by ${userEmail}` },
          folderId: pathId[0],
          workspaceId,
        },
      });

      const { data, error } = await updateFolder(
        { inFavorite: `Moved by ${userEmail}` },
        pathId[0]
      );

      if (error) {
        toast.error("Error! Could not move the folder to favorite", {
          description: "Please try again later",
        });
      }

      toast.success("Folder moved to favorite");
    }
  };

  const handleRemoveFromFavorite = async () => {
    if (!userEmail || !workspaceId) return undefined;

    const pathId = accordionId.split("folder");

    if (listType === "folder") {
      dispatch({
        type: "UPDATE_FOLDER",
        payload: {
          folder: { inFavorite: "" },
          folderId: pathId[0],
          workspaceId,
        },
      });

      const { data, error } = await updateFolder({ inFavorite: "" }, pathId[0]);

      if (error) {
        toast.error("Error! Could not move the folder to favorite", {
          description: "Please try again later",
        });
      }

      toast.success("Folder moved to favorite");
    }
  };

  const handleMoveToTrash = async () => {
    if (!userEmail || !workspaceId) return undefined;

    const pathId = accordionId.split("folder");

    if (listType === "folder") {
      dispatch({
        type: "UPDATE_FOLDER",
        payload: {
          folder: { inTrash: `Deleted by ${userEmail}` },
          folderId: pathId[0],
          workspaceId,
        },
      });

      const { data, error } = await updateFolder(
        { inTrash: `Deleted by ${userEmail}` },
        pathId[0]
      );

      if (error) {
        toast.error("Error! Could not move the folder to trash", {
          description: "Please try again later",
        });
      }

      toast.success("Folder moved to trash");
    }

    if (listType === "file") {
      dispatch({
        type: "UPDATE_FILE",
        payload: {
          file: { inTrash: `Deleted by ${userEmail}` },
          folderId: pathId[0],
          workspaceId,
          fileId: pathId[1],
        },
      });

      const { data, error } = await updateFile(
        { inTrash: `Deleted by ${userEmail}` },
        pathId[1]
      );

      if (error) {
        toast.error("Error! Could not move the file to trash", {
          description: "Please try again later",
        });
      }

      toast.success("File moved to trash");
    }
  };

  return (
    <DropdownMenuContent
      align="start"
      className="min-w-[260px] font-medium"
      onCloseAutoFocus={(e) => e.preventDefault()}
    >
      {listType === "folder" && (
        <>
          {!inFavorite ? (
            <>
              <DropdownMenuItem
                className="flex items-center gap-2"
                onClick={handleMoveToFavorite}
              >
                <Star className="size-4" />
                Add to Favorites
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-muted-foreground/20" />
            </>
          ) : (
            <>
              <DropdownMenuItem
                className="flex items-center gap-2"
                onClick={handleRemoveFromFavorite}
              >
                <StarOff className="size-4" />
                Remove from Favorites
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-muted-foreground/20" />
            </>
          )}
        </>
      )}
      <DropdownMenuItem
        className="flex items-center gap-2"
        onClick={handleCopyLink}
      >
        <LinkIcon className="size-4" />
        Copy link
        <DropdownMenuShortcut>Ctrl + L</DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuItem
        className="flex items-center gap-2"
        onClick={handleMoveToTrash}
      >
        <TrashIcon className="size-4" />
        Delete
        <DropdownMenuShortcut>Ctrl + ⌫</DropdownMenuShortcut>
      </DropdownMenuItem>

      <DropdownMenuSeparator className="bg-muted-foreground/20" />
      <DropdownMenuItem
        className="flex items-center gap-2"
        onClick={() => {
          if (listType === "folder") {
            window.open(
              `${window.location.origin}/dashboard/${workspaceId}/${accordionId}`
            );
          }

          if (listType === "file") {
            window.open(
              `${window.location.origin}/dashboard/${workspaceId}/${folderId}/${accordionId}`
            );
          }
        }}
      >
        <ExternalLink className="size-4" />
        Open in new tab
        <DropdownMenuShortcut>Alt + Click</DropdownMenuShortcut>
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
};

export default FolderContextMenu;
