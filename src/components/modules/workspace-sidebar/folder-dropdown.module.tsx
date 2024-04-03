"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { PlusIcon } from "lucide-react";

import { updateFolder } from "@/queries/folder";
import { createFile, updateFile } from "@/queries/file";

import EmojiPicker from "@/components/global/emoji-picker.global";
import FolderContextMenu from "./folder-context-menu.module";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useSupabaseUser } from "@/hooks/user-supabase-user";
import { useAppState } from "@/hooks/use-app-state";
import { cn } from "@/lib/utils";
import { File } from "@/types/supabase.types";
interface FolderDropdownProps {
  id: string;
  title: string;
  listType: "folder" | "file";
  iconId: string;
  inFavorite?: string | null;
  disabled?: boolean;
}

const FolderDropdown: React.FC<FolderDropdownProps> = ({
  iconId,
  id,
  listType,
  title,
  inFavorite,
  disabled,
}) => {
  const router = useRouter();
  const { user } = useSupabaseUser();
  const { state: appState, dispatch, workspaceId, folderId } = useAppState();

  const [isEditing, setIsEditing] = React.useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState<boolean>(false);

  const isFolder = React.useMemo(() => listType === "folder", [listType]);

  const currentWorkspace = React.useMemo(() => {
    return appState.workspaces.find(
      (workspace) => workspace.id === workspaceId
    );
  }, [workspaceId, appState.workspaces]);

  const currentFolder = React.useMemo(() => {
    return currentWorkspace?.folders.find((folder) => folder.id === id);
  }, [currentWorkspace, id]);

  const currentFiles = React.useMemo(() => {
    return currentFolder?.files.filter((file) => !file.inTrash);
  }, [currentFolder]);

  const folderTitle: string | undefined = React.useMemo(() => {
    const workspace = appState.workspaces.find((ws) => ws.id === workspaceId);
    const folder = workspace?.folders.find((f) => f.id === id);

    return folder?.title ?? title;
  }, [appState, workspaceId, id, title]);

  const fileTitle: string | undefined = React.useMemo(() => {
    if (listType !== "file") return undefined;

    const [folderId, fileId] = id.split("folder");
    const folder = currentWorkspace?.folders.find((f) => f.id === folderId);
    const file = folder?.files.find((f) => f.id === fileId);

    return file?.title ?? title;
  }, [appState, listType, workspaceId, currentWorkspace, id, title]);

  if (!workspaceId) return null;

  const handleNavigateToType = () => {
    const fileId = id.split("folder")[1];
    console.log(listType);

    if (listType === "folder") {
      router.push(`/dashboard/${workspaceId}/${id}`);
    }

    if (listType === "file") {
      console.log(`/dashboard/${workspaceId}/${folderId}/${fileId}`);
      router.push(`/dashboard/${workspaceId}/${folderId}/${fileId}`);
    }
  };

  const handleControlItemClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.stopPropagation();

    if (event.altKey) {
      event.preventDefault();
      const fileId = id.split("folder")[1];

      if (listType === "folder") {
        window.open(`${window.location.origin}/dashboard/${workspaceId}/${id}`);
      }

      if (listType === "file") {
        window.open(
          `${window.location.origin}/dashboard/${workspaceId}/${folderId}/${fileId}`
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
    }
  };

  const handleAddNewFile = async () => {
    if (!workspaceId) return;

    const newFile: File = {
      folderId: id,
      data: null,
      createdAt: new Date().toISOString(),
      inTrash: null,
      title: "Untitled File",
      iconId: "📄",
      id: uuidv4(),
      workspaceId,
      bannerUrl: "",
    };

    dispatch({
      type: "ADD_FILE",
      payload: { file: newFile, folderId: id, workspaceId },
    });

    const { data, error } = await createFile(newFile);

    if (error) {
      toast.error("Error! Could not create your file", {
        description: "Please try again later",
      });
    }

    toast.success("File created successfully!");
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
    if (!workspaceId || !folderId) return;

    const fId = id.split("folder");

    if (fId.length === 2 && fId[1]) {
      dispatch({
        type: "UPDATE_FILE",
        payload: {
          file: { title: event.target.value },
          folderId,
          workspaceId,
          fileId: fId[1],
        },
      });
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

      const { data, error } = await updateFolder({ title }, fId[0]);

      if (error) {
        toast.error("Error! Could not update your file title", {
          description: "Please try again later",
        });
      }
    }

    if (fId.length === 2 && fId[1]) {
      if (!fileTitle) return undefined;

      const { data, error } = await updateFile({ title }, fId[1]);

      if (error) {
        toast.error("Error! Could not update your file title", {
          description: "Please try again later",
        });
      }
    }
  };

  return (
    <AccordionItem
      value={id}
      className={cn("relative my-1 border-b-0 border-white animate-in fade-in-0 zoom-in-95", {
        "border-none text-md": isFolder,
        "ml-6 pl-2 text-[16px] border-solid border-l border-l-muted-foreground/30":
          !isFolder,
      })}
      onClick={(event) => {
        handleControlItemClick(event);
      }}
    >
      <DropdownMenu onOpenChange={(value) => setIsDropdownOpen(value)}>
        <AccordionTrigger
          id={listType}
          className="p-2 text-muted-foreground text-sm w-full"
          disabled={listType === "file" || disabled}
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
                value={isFolder ? folderTitle : fileTitle}
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
                  isFolder ? handleFolderTitleChange : handleFileTitleChange
                }
              />
            </div>

            <div
              className={cn(
                "h-full text-muted-foreground flex rounded-sm opacity-0 transition-opacity items-center justify-center gap-1",
                {
                  "group-hover/file:opacity-100": !isFolder,
                  "group-hover/folder:opacity-100": isFolder,
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
                <TooltipContent>Delete, copy and more...</TooltipContent>
              </Tooltip>
              {isFolder && !isEditing && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={handleAddNewFile}
                    >
                      <PlusIcon className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add a new file inside</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </AccordionTrigger>
        <FolderContextMenu
          accordionId={id}
          listType={listType}
          userEmail={user?.email}
          workspaceId={workspaceId}
          inFavorite={inFavorite}
        />
      </DropdownMenu>
      <AccordionContent className="pb-0">
        {currentFiles?.map((file) => {
          const customFileId = `${id}folder${file.id}`;

          return (
            <FolderDropdown
              key={file.id}
              title={file.title}
              listType="file"
              id={customFileId}
              iconId={file.iconId}
            />
          );
        })}
      </AccordionContent>
    </AccordionItem>
  );
};

export default FolderDropdown;
