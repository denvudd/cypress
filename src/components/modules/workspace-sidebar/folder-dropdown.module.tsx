"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import { useAppState } from "@/hooks/use-app-state";
import { AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import EmojiPicker from "@/components/global/emoji-picker.global";
import { updateFolder } from "@/queries/folder";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ExternalLink,
  LinkIcon,
  Pencil,
  PlusIcon,
  Star,
  Trash,
  TrashIcon,
} from "lucide-react";
import { DotsHorizontalIcon, Pencil2Icon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
interface FolderDropdownProps {
  id: string;
  title: string;
  listType: "folder" | "file";
  iconId: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

const FolderDropdown: React.FC<FolderDropdownProps> = ({
  iconId,
  id,
  listType,
  title,
  children,
  disabled,
}) => {
  const router = useRouter();
  const supabaseClient = createClientComponentClient();
  const { state: appState, dispatch, workspaceId, folderId } = useAppState();

  const [isEditing, setIsEditing] = React.useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState<boolean>(false);
  const isFolder = React.useMemo(() => listType === "folder", [listType]);

  const folderTitle: string | undefined = React.useMemo(() => {
    const workspace = appState.workspaces.find((ws) => ws.id === workspaceId);
    const folder = workspace?.folders.find((f) => f.id === id);

    return folder?.title ?? title;
  }, [appState, workspaceId, id, title]);

  const fileTitle: string | undefined = React.useMemo(() => {
    if (listType !== "file") return;

    const [folderId, fileId] = id.split("folder");
    const workspace = appState.workspaces.find((ws) => ws.id === workspaceId);
    const folder = workspace?.folders.find((f) => f.id === folderId);
    const file = folder?.files.find((f) => f.id === fileId);

    return file?.title ?? title;
  }, [appState, listType, workspaceId, id, title]);

  if (!workspaceId) return null;

  const handleNavigateToType = () => {
    if (listType === "folder") {
      router.push(`/dashboard/${workspaceId}/${id}`);
    }

    if (listType === "file") {
      router.push(`/dashboard/${workspaceId}/${folderId}/${id}`);
    }
  };

  const handleControlItemClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (event.altKey) {
      if (listType === "folder") {
        window.open(`${window.location.origin}/dashboard/${workspaceId}/${id}`);
      }

      if (listType === "file") {
        window.open(
          `${window.location.origin}/dashboard/${workspaceId}/${folderId}/${id}`
        );
      }

      return undefined;
    }

    handleNavigateToType();
  };

  const handleEmojiHandler = async (selectedEmoji: string) => {
    if (listType === "folder") {
      dispatch({
        type: "UPDATE_FOLDER",
        payload: {
          workspaceId,
          folderId: id,
          folder: { iconId: selectedEmoji },
        },
      });

      const { data, error } = await updateFolder({ iconId: selectedEmoji }, id);

      if (error) {
        toast.error("Error! Could not update your folder icon", {
          description: "Please try again later",
        });
      }

      toast.success("Folder icon updated successfully");
    }
  };

  const handleFolderTitleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const fId = id.split("folder");

    if (fId.length === 1) {
      dispatch({
        type: "UPDATE_FOLDER",
        payload: {
          folder: { title: event.target.value },
          folderId: fId[0],
          workspaceId,
        },
      });
    }
  };
  const handleFileTitleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const fId = id.split("folder");

    if (fId.length === 2 && fId[1]) {
      // dispatch()
    }
  };

  const handleDoubleClickInput = (
    event: React.MouseEvent<HTMLInputElement>
  ) => {
    event.stopPropagation();
    event.currentTarget.select();
    setIsEditing(true);
  };

  const handleBlurInput = async () => {
    setIsEditing(false);
    const fId = id.split("folder");

    if (fId?.length === 1) {
      if (!folderTitle) return undefined;

      await updateFolder({ title }, fId[0]);
    }

    if (fId.length === 2 && fId[1]) {
      if (!fileTitle) return undefined;

      // await updateTitle
    }
  };

  return (
    <AccordionItem
      value={id}
      onClick={(event) => {
        event.stopPropagation();
        handleControlItemClick(event);
      }}
      className={cn("relative", {
        "border-none text-md": isFolder,
        "border-none ml-6 text-[16px] py-1": !isFolder,
      })}
    >
      <DropdownMenu onOpenChange={(value) => setIsDropdownOpen(value)}>
        <AccordionTrigger
          id={listType}
          className="p-2 text-muted-foreground text-sm w-full"
          disabled={listType === "file"}
        >
          <div
            className={cn(
              "whitespace-nowrap flex justify-between items-center w-full relative",
              {
                "group/folder": isFolder,
                "group/file": !isFolder,
              }
            )}
          >
            <div className="flex items-center justify-center overflow-hidden">
              <div className="relative">
                <EmojiPicker getValue={handleEmojiHandler}>
                  {iconId}
                </EmojiPicker>
              </div>
              <input
                type="text"
                id={`${id}-${listType}-title`}
                value={listType === "folder" ? folderTitle : fileTitle}
                className={cn(
                  "outline-none flex overflow-ellipsis font-medium text-sm max-w-[140px] line-clamp-1 bg-transparent cursor-pointer rounded-md px-1",
                  {
                    "bg-muted cursor-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring":
                      isEditing,
                  }
                )}
                readOnly={!isEditing}
                onDoubleClick={handleDoubleClickInput}
                onBlur={handleBlurInput}
                onChange={
                  listType === "folder"
                    ? handleFolderTitleChange
                    : handleFileTitleChange
                }
              />
            </div>

            <div
              className={cn(
                "h-full text-muted-foreground flex rounded-sm opacity-0 transition-opacity items-center justify-center gap-1",
                {
                  "group-hover/file:opacity-100": listType === "file",
                  "group-hover/folder:opacity-100": listType === "folder",
                  "opacity-100": isDropdownOpen,
                }
              )}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-5 w-5">
                      <DotsHorizontalIcon className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>Delete, duplicate and more...</TooltipContent>
              </Tooltip>
              {listType === "folder" && !isEditing && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-5 w-5">
                      <PlusIcon className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add a new file inside</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </AccordionTrigger>
        <DropdownMenuContent
          align="start"
          className="min-w-[260px] font-medium"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DropdownMenuItem className="flex items-center gap-2">
            <Star className="size-4" />
            Add to favorites
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-muted-foreground/20" />
          <DropdownMenuItem
            className="flex items-center gap-2"
            onClick={() => {
              if (listType === "folder") {
                navigator.clipboard.writeText(
                  `${window.location.origin}/dashboard/${workspaceId}/${id}`
                );
              }

              if (listType === "file") {
                navigator.clipboard.writeText(
                  `${window.location.origin}/dashboard/${workspaceId}/${folderId}/${id}`
                );
              }

              toast.success("Link copied to clipboard!");
            }}
          >
            <LinkIcon className="size-4" />
            Copy link
            <DropdownMenuShortcut>Ctrl + L</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2">
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
                  `${window.location.origin}/dashboard/${workspaceId}/${id}`
                );
              }

              if (listType === "file") {
                window.open(
                  `${window.location.origin}/dashboard/${workspaceId}/${folderId}/${id}`
                );
              }
            }}
          >
            <ExternalLink className="size-4" />
            Open in new tab
            <DropdownMenuShortcut>Alt + Click</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </AccordionItem>
  );
};

export default FolderDropdown;
