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
import { format } from "date-fns";

interface FolderContextMenuProps {
  workspaceId: string;
  accordionId: string;
  userEmail: string | undefined;
  listType: "folder" | "file";
  createdAt: string;
  inFavorite?: string | null;
}

const FolderContextMenu: React.FC<FolderContextMenuProps> = ({
  listType,
  inFavorite,
  userEmail,
  workspaceId,
  createdAt,
  accordionId,
}) => {
  const { dispatch, folderId, fileId } = useAppState();

  React.useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      const isCopyLink = event.ctrlKey && event.shiftKey && event.key === "l";
      const isMoveToTrash =
        event.ctrlKey && event.shiftKey && event.key === "Backspace";

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
        toast.error("Error! Could not remove the folder from favorite", {
          description: "Please try again later",
        });
      }

      toast.success("Folder removed from favorite");
    }
  };

  const handleMoveToTrash = async () => {
    if (!userEmail || !workspaceId) return undefined;

    if (listType === "folder") {
      if (!folderId) return undefined;

      dispatch({
        type: "UPDATE_FOLDER",
        payload: {
          folder: { inTrash: `Deleted by ${userEmail}` },
          folderId,
          workspaceId,
        },
      });

      const { data, error } = await updateFolder(
        { inTrash: `Deleted by ${userEmail}` },
        folderId
      );

      if (error) {
        toast.error("Error! Could not move the folder to trash", {
          description: "Please try again later",
        });
      }

      toast.success("Folder moved to trash");
    }

    if (listType === "file") {
      if (!fileId || !folderId) return undefined;

      dispatch({
        type: "UPDATE_FILE",
        payload: {
          file: { inTrash: `Deleted by ${userEmail}` },
          folderId,
          workspaceId,
          fileId,
        },
      });

      const { data, error } = await updateFile(
        { inTrash: `Deleted by ${userEmail}` },
        fileId
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
      className="max-w-[260px] w-full font-medium"
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
        <DropdownMenuShortcut>Ctrl + Shift + L</DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuItem
        className="flex items-center gap-2"
        onClick={handleMoveToTrash}
      >
        <TrashIcon className="size-4" />
        Delete
        <DropdownMenuShortcut>Ctrl + Shift + ⌫</DropdownMenuShortcut>
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
      <DropdownMenuSeparator className="bg-muted-foreground/20" />
      <DropdownMenuItem className="text-muted-foreground text-xs flex-col items-start pointer-events-none">
        <span>Created at {format(createdAt, "dd MMM yyyy hh:mm aa")}</span> 
        <span>by {userEmail}</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
};

export default FolderContextMenu;
