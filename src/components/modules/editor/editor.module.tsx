"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Loader } from "lucide-react";

import { deleteFile } from "@/queries/file";
import { deleteFolder, updateFolder } from "@/queries/folder";
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

import { setupDirectionData } from "@/lib/editor/setup-direction-data";
import { syncChangesWithDb } from "@/lib/editor/sync-changes-with-db";
import { useAppState } from "@/hooks/use-app-state";
import { useSocket } from "@/hooks/use-socket";
import { useSupabaseUser } from "@/hooks/user-supabase-user";

import { File, Folder, Workspace } from "@/types/supabase.types";
import { AppWorkspacesType } from "@/lib/providers/app-state.provider";
import { DirectionType } from "@/types/global.type";
import { EditorRange, SocketEditorEvent } from "@/types/editor.types";

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

  /** Function that initializes Editor and modules for React ref that accepts HTMLElement (actual ref). It appends editor div to it,
   * dynamically imports Quill and relatives modules and creates instances of Quill, Delta and QuillCursors.
   * Sets the configuration of the Quill such as toolbar and cursors. After initializing, it add to
   * Quill instance the default content with name of workspace/file/folder.
   */
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
    if (typeof window !== "undefined") {
      return undefined;
    }
  }, []);

  // Initialize editor data
  React.useEffect(() => {
    if (!targetId) return undefined;

    if (!workspaceId || !quill) {
      return undefined;
    }

    setupDirectionData({
      dirType,
      quill,
      router,
      targetId,
      workspaceId,
      dispatch,
    });
  }, [targetId, workspaceId, folderId, fileId, dirType, quill]);

  // Create room when user joins
  React.useEffect(() => {
    if (!socket || !quill || !targetId) {
      return undefined;
    }

    socket.emit(SocketEditorEvent.CreateRoom, targetId);
  }, [socket, quill, targetId]);

  // Update cursor position and synchronize data from editor with DB
  React.useEffect(() => {
    if (!quill || !socket || !targetId || !user) {
      return undefined;
    }

    /** Updates cursor position. */
    const handleChangeSelection = (cursorId: string) => {
      return (range: EditorRange, oldRange: EditorRange, source: string) => {
        if (source !== "user" && !cursorId) return undefined;
        console.log(range, oldRange);

        socket.emit(
          SocketEditorEvent.SendCursorMove,
          range,
          targetId,
          cursorId
        );
      };
    };

    /** Synchronizes data with DB on Quill changes */
    const handleQuill = (delta: any, oldDelta: any, source: any) => {
      if (source !== "user" || !workspaceId) {
        return undefined;
      }

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      setIsSaving(true);

      const contents: any = quill.getContents();
      const quillLength: number = quill.getLength();

      syncChangesWithDb({
        contents,
        dirType,
        folderId,
        quillLength,
        saveTimerRef,
        targetId,
        workspaceId,
        dispatch,
        setIsSaving,
      });

      socket.emit(SocketEditorEvent.SendChanges, delta, targetId);
    };

    quill.on(SocketEditorEvent.TextChange, handleQuill);
    quill.on(SocketEditorEvent.SelectionChange, handleChangeSelection(user.id));

    return () => {
      quill.off(SocketEditorEvent.TextChange, handleQuill);
      quill.off(SocketEditorEvent.SelectionChange, handleChangeSelection);

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [
    quill,
    socket,
    targetId,
    user,
    details,
    workspaceId,
    dirType,
    fileId,
    folderId,
  ]);

  // Receiving cursor position and moving cursor in editor
  React.useEffect(() => {
    if (!quill || !socket || !localCursors.length || !targetId) {
      return undefined;
    }

    const handleSocket = (
      range: EditorRange,
      roomId: string,
      cursorId: string
    ) => {
      if (roomId === targetId) {
        const cursorToMove = localCursors.find(
          (cursor) => cursor.cursors()?.[0].id === cursorId
        );

        if (cursorToMove) {
          cursorToMove.moveCursor(cursorId, range);
        }
      }
    };

    socket.on(SocketEditorEvent.ReceiveCursorMove, handleSocket);

    return () => {
      socket.off(SocketEditorEvent.ReceiveCursorMove, handleSocket);
    };
  }, [quill, socket, targetId, localCursors]);

  // Update content in editor in realtime
  React.useEffect(() => {
    if (!quill || !socket) return undefined;

    const handleSocket = (deltas: any, id: string) => {
      if (id === targetId) {
        quill.updateContents(deltas);
      }
    };

    socket.on(SocketEditorEvent.ReceiveChanges, handleSocket);

    return () => {
      socket.off(SocketEditorEvent.ReceiveChanges, handleSocket);
    };
  }, [quill, socket, targetId]);

  // Synchronizing realtime collaborators via Supabase Realtime feature
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

  // Restore file from Trash to workspace
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

  // Delete file permanently from Trash
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
