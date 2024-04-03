"use client";

import React from "react";
import { File, Folder, Workspace } from "@/types/supabase.types";
import { useAppState } from "@/hooks/use-app-state";
import { TOOLBAR_OPTIONS } from "./config";

import "quill/dist/quill.snow.css";
import { AppWorkspacesType } from "@/lib/providers/app-state.provider";
import { Button } from "@/components/ui/button";
import { deleteFile, updateFile } from "@/queries/file";
import { deleteFolder, updateFolder } from "@/queries/folder";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface EditorProps {
  targetId: string;
  dirDetails: File | Folder | Workspace;
  dirType: "workspace" | "folder" | "file";
}

const Editor: React.FC<EditorProps> = ({ dirDetails, dirType, targetId }) => {
  const router = useRouter();
  const { state: appState, folderId, workspaceId, dispatch } = useAppState();
  const [quill, setQuill] = React.useState<any>();

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

    return {
      title: dirDetails.title,
      iconId: dirDetails.iconId,
      createdId: dirDetails.createdAt,
      inTrash: dirDetails.inTrash,
      data: dirDetails.data,
      bannerUrl: dirDetails.bannerUrl,
    };
  }, [appState, workspaceId, folderId, targetId]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      return undefined;
    }
  }, []);

  const wrapperRef = React.useCallback(async (wrapper: HTMLElement | null) => {
    if (wrapper) {
      wrapper.innerHTML = "";

      const editor = document.createElement("div");
      wrapper.append(editor);

      const Quill = (await import("quill")).default;
      const quillInstance = new Quill(editor, {
        theme: "snow",
        modules: {
          toolbar: TOOLBAR_OPTIONS,
        },
      });

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
            <div className="flex flex-col md:flex-row gap-2 justify-between w-full px-4 items-center">
              <span className="text-white text-sm font-medium">
                This {dirType} in the trash.
              </span>
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
      </div>
      <div>
        <div className="flex jusitfy-center items-center flex-col mt-2 relative">
          {/* @ts-expect-error We create a Quill instance for wrapper HTMLElement manually */}
          <div id="container" ref={wrapperRef} className="max-w-[800px]"></div>
        </div>
      </div>
    </>
  );
};

export default Editor;
