"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Loader } from "lucide-react";

import { deleteFile, getFileDetails, updateFile } from "@/queries/file";
import { deleteFolder, getFolderDetails, updateFolder } from "@/queries/folder";
import { getWorkspaceDetails, updateWorkspace } from "@/queries/workspace";
import { getAuthUser } from "@/queries/auth";

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
import { useSocket } from "@/hooks/use-socket";
import { useSupabaseUser } from "@/hooks/user-supabase-user";

import { File, Folder, Workspace } from "@/types/supabase.types";
import { AppWorkspacesType } from "@/lib/providers/app-state.provider";
import { DirectionType } from "@/types/global.type";

import { TOOLBAR_OPTIONS } from "../../../lib/config/editor/modules";
import { cn, generateColorFromEmail } from "@/lib/utils";
import "quill/dist/quill.snow.css";
interface EditorProps {
  targetId: string;
  dirDetails: File | Folder | Workspace;
  dirType: DirectionType;
}

interface EditorCollaborator {
  id: string;
  email: string;
  avatarUrl: string;
  presence_ref: string;
}

const Editor: React.FC<EditorProps> = ({ dirDetails, dirType, targetId }) => {
  const router = useRouter();
  const supabaseClient = createClientComponentClient();
  const { user } = useSupabaseUser();
  const { socket } = useSocket();

  const {
    state: appState,
    folderId,
    workspaceId,
    fileId,
    dispatch,
  } = useAppState();
  // You can set to Quill instance type for development purpose and typesafety but
  // you should remove it in production because Quill is not tree-shakeable and imports dynamically
  const [quill, setQuill] = React.useState<any>(null);
  const [collaborators, setCollaborators] = React.useState<
    EditorCollaborator[]
  >([]);
  const [localCursors, setLocalCursors] = React.useState<any[]>([]);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);

  const saveTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

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

  React.useEffect(() => {
    if (!targetId) return undefined;

    if (!workspaceId || !quill) {
      return undefined;
    }

    const updateDirectionData = async () => {
      switch (dirType) {
        case "file": {
          const { data: selectedDir, error } = await getFileDetails(targetId);

          if (!selectedDir || error) {
            router.replace(`/dashboard`);
            return undefined;
          }

          const file = selectedDir[0];

          if (!file) {
            router.replace(`/dashboard/${workspaceId}/${folderId}`);
            return undefined;
          }

          if (!file.data) {
            return undefined;
          }

          quill.setContents(JSON.parse(file.data || ""));

          dispatch({
            type: "UPDATE_FILE",
            payload: {
              file: { data: file.data },
              fileId: targetId,
              folderId: selectedDir[0].folderId,
              workspaceId,
            },
          });

          break;
        }
        case "folder": {
          const { data: selectedDir, error } = await getFolderDetails(targetId);

          if (!selectedDir || error) {
            router.replace(`/dashboard`);
            return undefined;
          }

          const folder = selectedDir[0];

          if (!folder) {
            router.replace(`/dashboard/${workspaceId}`);
          }

          if (!folder.data) {
            return undefined;
          }

          quill.setContents(JSON.parse(folder.data) || "");

          dispatch({
            type: "UPDATE_FOLDER",
            payload: {
              folder: { data: folder.data },
              folderId: targetId,
              workspaceId,
            },
          });

          break;
        }
        case "workspace": {
          const { data: selectedDir, error } = await getWorkspaceDetails(
            targetId
          );

          if (!selectedDir || error) {
            router.replace(`/dashboard`);
            return undefined;
          }

          const workspace = selectedDir[0];

          if (!workspace) {
            router.replace(`/dashboard/`);
          }

          if (!workspace.data) {
            return undefined;
          }

          quill.setContents(JSON.parse(workspace.data) || "");

          dispatch({
            type: "UPDATE_WORKSPACE",
            payload: {
              workspace: { data: workspace.data },
              workspaceId: targetId,
            },
          });

          break;
        }
        default: {
          return undefined;
        }
      }
    };

    updateDirectionData();
  }, [targetId, workspaceId, folderId, fileId, dirType, quill]);

  React.useEffect(() => {
    if (!socket || !quill || !targetId) {
      return undefined;
    }

    socket.emit("create-room", targetId);
  }, [socket, quill, targetId]);

  React.useEffect(() => {
    if (!quill || !socket || !targetId || !user) {
      return undefined;
    }

    const handleChangeSelection = (cursorId: string) => {
      return (range: any, oldRange: any, source: string) => {
        if (source !== "user" && !cursorId) return undefined;

        socket.emit("send-cursor-move", range, targetId, cursorId);
      };
    };

    const handleQuill = (delta: any, oldDelta: any, source: any) => {
      if (source !== "user") {
        return undefined;
      }

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      setIsSaving(true);

      const contents = quill.getContents();
      const quillLength = quill.getLength();

      saveTimerRef.current = setTimeout(async () => {
        if (contents && !!quillLength && targetId) {
          switch (dirType) {
            case "file": {
              if (!workspaceId || !folderId) return undefined;

              dispatch({
                type: "UPDATE_FILE",
                payload: {
                  file: { data: JSON.stringify(contents) },
                  fileId: targetId,
                  folderId,
                  workspaceId,
                },
              });

              updateFile({ data: JSON.stringify(contents) }, targetId);
            }
            case "folder": {
              if (!workspaceId) return undefined;

              dispatch({
                type: "UPDATE_FOLDER",
                payload: {
                  folder: { data: JSON.stringify(contents) },
                  workspaceId,
                  folderId: targetId,
                },
              });

              await updateFolder({ data: JSON.stringify(contents) }, targetId);
            }
            case "workspace": {
              dispatch({
                type: "UPDATE_WORKSPACE",
                payload: {
                  workspace: { data: JSON.stringify(contents) },
                  workspaceId: targetId,
                },
              });

              updateWorkspace({ data: JSON.stringify(contents) }, targetId);
            }
          }
        }

        setIsSaving(false);
      }, 850);

      socket.emit("send-changes", delta, targetId);
    };

    quill.on("text-change", handleQuill);
    quill.on("selection-change", handleChangeSelection(user.id));

    return () => {
      quill.off("text-change", handleQuill);
      quill.off("selection-change", handleChangeSelection);

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [quill, socket, targetId, user, details, workspaceId, dirType, fileId, folderId]);

  React.useEffect(() => {
    if (!quill || !socket || !localCursors.length || !targetId) {
      return undefined;
    }

    const handleSocket = (range: any, roomId: string, cursorId: string) => {
      if (roomId === targetId) {
        const cursorToMove = localCursors.find(
          (cursor) => cursor.cursors()?.[0].id === cursorId
        );

        if (cursorToMove) {
          cursorToMove.moveCursor(cursorId, range);
        }
      }
    };

    socket.on("receive-cursor-move", handleSocket);

    return () => {
      socket.off("receive-cursor-move", handleSocket);
    };
  }, [quill, socket, targetId, localCursors]);

  React.useEffect(() => {
    if (!quill || !socket) return undefined;

    const handleSocket = (deltas: any, id: string) => {
      if (id === targetId) {
        quill.updateContents(deltas);
      }
    };

    socket.on("receive-changes", handleSocket);

    return () => {
      socket.off("receive-changes", handleSocket);
    };
  }, [quill, socket, targetId]);

  const wrapperRef = React.useCallback(async (wrapper: HTMLElement | null) => {
    if (wrapper) {
      const editor = document.createElement("div");
      wrapper.append(editor);

      const Quill = (await import("quill")).default;
      const Delta = await Quill.import("delta");

      const QuillCursors = (await import("quill-cursors")).default;
      Quill.register("modules/cursors", QuillCursors);

      const quillInstance = new Quill(editor, {
        theme: "snow",
        modules: {
          toolbar: TOOLBAR_OPTIONS,
          cursors: {
            transformOnTextChange: true,
          },
        },
      });

      quillInstance.setContents(
        new Delta().insert(details?.title, { size: "huge", bold: true })
      );

      setQuill(quillInstance);
    }
  }, []);

  React.useEffect(() => {
    if (!targetId || !quill) return undefined;

    const room = supabaseClient.channel(targetId);

    const subscription = room.on("presence", { event: "sync" }, () => {
      const newState = room.presenceState();
      const newCollaborators = Object.values(
        newState
      ).flat() as unknown as EditorCollaborator[];
      setCollaborators(newCollaborators);

      if (user) {
        const allCursors: any[] = [];

        newCollaborators.forEach((collaborator) => {
          if (collaborator.id !== user.id) {
            const userCursor = quill.getModule("cursors");

            userCursor.createCursor(
              collaborator.id,
              collaborator.email.split("@")[0],
              generateColorFromEmail(collaborator.email)
            );

            allCursors.push(userCursor);
          }
        });

        setLocalCursors(allCursors);
      }
    });

    subscription.subscribe(async (status) => {
      if (status !== "SUBSCRIBED" || !user) return undefined;

      const response = await getAuthUser(user.id);

      if (!response) return undefined;

      const avatarUrl =
        response.avatarUrl &&
        supabaseClient.storage.from("avatars").getPublicUrl(response.avatarUrl)
          .data.publicUrl;

      room.track({
        id: user.id,
        email: user.email?.split("@")[0],
        avatarUrl: avatarUrl || "",
      });
    });

    return () => {
      supabaseClient.removeChannel(room);
    };
  }, [targetId, quill, supabaseClient, user]);

  console.log(localCursors);

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
                    <Avatar
                      className="-ml-3 flex border-none items-center justify-center size-8 rounded-full animate-in 
                    fade-in-0 slide-in-from-right-[50%] zoom-in-95"
                    >
                      <AvatarImage
                        src={collaborator.avatarUrl || ""}
                        className="rounded-full"
                      />
                      <AvatarFallback
                        className="text-white font-medium"
                        style={{
                          backgroundColor: generateColorFromEmail(
                            collaborator.email
                          ),
                        }}
                      >
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
