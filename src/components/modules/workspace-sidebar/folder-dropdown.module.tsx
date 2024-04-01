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
import { PlugIcon, Trash } from "lucide-react";
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

  const handleNavigateToType = (accordionId: string, type: typeof listType) => {
    if (type === "folder") {
      router.push(`/dashboard/${workspaceId}/${accordionId}`);
    }

    if (type === "file") {
      router.push(`/dashboard/${workspaceId}/${folderId}/${accordionId}`);
    }
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
          folder: { title },
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

  const handleDoubleClickInput = () => {
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
        handleNavigateToType(id, listType);
      }}
      className={cn("relative", {
        "border-none text-md": isFolder,
        "border-none ml-6 text-[16px] py-1": !isFolder,
      })}
    >
      <AccordionTrigger
        id={listType}
        className="p-2 text-muted-foreground text-sm"
        disabled={listType === "file"}
        
      >
        <div
          className={cn(
            "dark:text-white whitespace-nowrap flex justify-between items-center w-full relative",
            {
              "group/folder": isFolder,
              "group/file": !isFolder,
            }
          )}
        >
          <div className="flex gap-2 items-center justify-center overflow-hidden">
            <div className="relative">
              <EmojiPicker getValue={handleEmojiHandler}>{iconId}</EmojiPicker>
            </div>
            <input
              type="text"
              value={listType === "folder" ? folderTitle : fileTitle}
              className={cn(
                "outline-none overflow-hidden font-medium text-sm w-[140px] bg-transparent cursor-pointer",
                {
                  "bg-muted cursor-text": isEditing,
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

          <div className="h-full hidden group-hover/file:block rounded-md absolute right-0 items-center gap-2 justify-center">
            <Tooltip>
              <TooltipTrigger>
                <Trash className="size-4" />
              </TooltipTrigger>
              <TooltipContent>Delete folder</TooltipContent>
            </Tooltip>
            {listType === "folder" && !isEditing && (
              <Tooltip>
                <TooltipTrigger>
                  <PlugIcon className="size-4" />
                </TooltipTrigger>
                <TooltipContent>Add new file</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </AccordionTrigger>
    </AccordionItem>
  );
};

export default FolderDropdown;
