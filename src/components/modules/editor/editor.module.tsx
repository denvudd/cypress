"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Loader } from "lucide-react";

import { deleteFile } from "@/queries/file";
import { deleteFolder, updateFolder } from "@/queries/folder";

import EditorBreadcrumbs from "./editor-breadcrumbs.module";
import EditorEmojiPicker from "./editor-emoji-picker.module";
import EditorBanner from "./editor-banner/editor-banner.module";
import EditorBannerPanel from "./editor-banner/editor-banner-panel.module";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useAppState } from "@/hooks/use-app-state";
import { File, Folder, Workspace } from "@/types/supabase.types";
import { AppWorkspacesType } from "@/lib/providers/app-state.provider";
import { DirectionType } from "@/types/global.type";

import { TOOLBAR_OPTIONS } from "./config";
import "quill/dist/quill.snow.css";
import { cn } from "@/lib/utils";

interface EditorProps {
  targetId: string;
  dirDetails: File | Folder | Workspace;
  dirType: DirectionType;
}

interface Collaborator {
  id: string;
  email: string;
  avatarUrl: string;
}

const Editor: React.FC<EditorProps> = ({ dirDetails, dirType, targetId }) => {
  const router = useRouter();
  const pathname = usePathname();
  const supabaseClient = createClientComponentClient();

  const { state: appState, folderId, workspaceId, dispatch } = useAppState();
  const [quill, setQuill] = React.useState<any>();
  const [collaborators, setCollaborators] = React.useState<Collaborator[]>([
    {
      id: "4124141",
      email: "bCqjV@example.com",
      avatarUrl: "4214141",
    },
  ]);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);

  const details = React.useMemo(() => {
    let selectedDir: File | Folder | AppWorkspacesType | undefined;
    const workspace = appState.workspaces.find((w) => w.id === workspaceId);

    switch (dirType) {
      case "file": {
        const folder = workspace?.folders.find((f) => f.id === folderId);
        selectedDir = folder?.files.find((f) => f.id === targetId);

        break;
      }
      case "folder": {
        const folder = workspace?.folders.find((f) => f.id === targetId);
        selectedDir = folder;

        break;
      }
      case "workspace": {
        selectedDir = workspace;
        break;
      }
      default: {
        return undefined;
      }
    }

    if (selectedDir) {
      return selectedDir;
    }

    return dirDetails;
  }, [appState, workspaceId, folderId, targetId]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      return undefined;
    }
  }, []);

  const wrapperRef = React.useCallback(async (wrapper: HTMLElement | null) => {
    if (wrapper) {
      const editor = document.createElement("div");
      wrapper.append(editor);

      const Quill = (await import("quill")).default;
      const Delta = await Quill.import("delta");

      const quillInstance = new Quill(editor, {
        theme: "snow",
        modules: {
          toolbar: TOOLBAR_OPTIONS,
        },
      });

      quillInstance.setContents(
        new Delta().insert(details?.title, { size: "huge", bold: true })
      );

      setQuill(quillInstance);
    }
  }, []);

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

      await updateFolder({ inTrash: "" }, targetId);
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
    }
  };

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
    <>
      <div className="relative">
        {details?.inTrash && (
          <article
            className="py-2 z-40 bg-destructive flex md:flex-row flex-col justify-center items-center gap-4 flex-wrap 
          slide-in-from-top-[48%] animate-in fade-in-0 zoom-in-95"
          >
            <div className="flex flex-col sm:flex-row gap-2 justify-between w-full px-4 items-center">
              <div className="flex flex-col text-center sm:text-left">
                <span className="text-white text-sm font-medium">
                  This {dirType} in the trash.
                </span>
                <span className="text-white text-xs font-medium">
                  {details.inTrash}
                </span>
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
        )}

        <div className="flex flex-col-reverse text-sm sm:flex-row sm:justify-between justify-center sm:items-center sm:p-3 p-8">
          <EditorBreadcrumbs />

          <div className="flex items-center gap-4">
            <Badge
              variant="secondary"
              className="top-4 right-4 z-50 flex items-center gap-1 transitiona-all"
            >
              {isSaving && <Loader className="size-3 animate-spin" />}
              {isSaving ? "Saving..." : "Saved"}
            </Badge>

            <div className="flex items-center justify-center h-10">
              {collaborators.map((collaborator) => (
                <Tooltip key={collaborator.id}>
                  <TooltipTrigger asChild>
                    <Avatar className="-ml-3 bg-background border border-muted-foreground/50 flex items-center justify-center size-8 rounded-full">
                      <AvatarImage
                        src={collaborator.avatarUrl || ""}
                        className="rounded-full"
                      />
                      <AvatarFallback>
                        {collaborator.email.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>{collaborator.email}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>
      </div>

      <EditorBanner bannerUrl={details?.bannerUrl} />

      <div className="flex justify-center items-center flex-col mt-2 relative">
        <div
          className={cn(
            "w-full self-center max-w-[800px] flex flex-col px-7 lg:mt-4",
            {
              "lg:-mt-16": details?.bannerUrl,
            }
          )}
        >
          <EditorEmojiPicker
            iconId={details?.iconId}
            dirType={dirType}
            targetId={targetId}
          />

          <EditorBannerPanel
            bannerUrl={details?.bannerUrl}
            dirType={dirType}
            targetId={targetId}
          />
        </div>
        {/* @ts-expect-error We create a Quill instance for wrapper HTMLElement manually */}
        <div id="container" ref={wrapperRef} className="max-w-[800px]"></div>
      </div>
    </>
  );
};

export default Editor;
