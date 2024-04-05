import React from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useAppState } from "./use-app-state";
import { File } from "@/types/supabase.types";
import { AppFoldersType } from "@/lib/providers/app-state.provider";

export const useSupabaseRealtime = () => {
  const router = useRouter();
  const supabaseClient = createClientComponentClient();
  const {
    state: appState,
    dispatch,
    workspaceId: selectedWorkspaceId,
  } = useAppState();

  React.useEffect(() => {
    const channel = supabaseClient.channel("db.changes");

    const dbChanges = channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "*" },
      async (payload) => {
        const { table, eventType, new: newData, old: oldData } = payload;

        switch (table) {
          case "files": {
            handleFileEvents(eventType, newData, oldData);
            break;
          }
          case "folders": {
            handleFolderEvents(eventType, newData, oldData);
            break;
          }
        }
      }
    );

    const handleFileEvents = (
      eventType: "INSERT" | "UPDATE" | "DELETE",
      newData: {
        [key: string]: any;
      },
      oldData: {
        [key: string]: any;
      }
    ) => {
      switch (eventType) {
        case "INSERT": {
          console.log("Supabase Realtime: Received INSERT event");

          const {
            folder_id: folderId,
            workspace_id: workspaceId,
            id: fileId,
          } = newData;

          const currentWorkspace = appState.workspaces.find(
            (workspace) => workspace.id === workspaceId
          );
          const currentFolder = currentWorkspace?.folders.find(
            (folder) => folder.id === folderId
          );
          const currentFile = currentFolder?.files.find(
            (file) => file.id === fileId
          );

          if (!currentFile) {
            const newFile: File = {
              id: newData.id,
              workspaceId: newData.workspace_id,
              folderId: newData.folder_id,
              createdAt: newData.created_at,
              title: newData.title,
              iconId: newData.icon_id,
              data: newData.data,
              inTrash: newData.in_trash,
              bannerUrl: newData.banner_url,
            };

            dispatch({
              type: "ADD_FILE",
              payload: { file: newFile, folderId, workspaceId },
            });
          }

          break;
        }
        case "DELETE": {
          const oldId = oldData as { id: string };
          let workspaceId = "";
          let folderId = "";

          const fileExists = appState.workspaces.some((workspace) =>
            workspace.folders.some((folder) =>
              folder.files.some((file) => {
                if (file.id === oldId.id) {
                  workspaceId = workspace.id;
                  folderId = folder.id;

                  return true;
                }
              })
            )
          );

          if (fileExists && workspaceId && folderId) {
            router.replace(`/dashboard/${workspaceId}`);

            dispatch({
              type: "DELETE_FILE",
              payload: { fileId: oldId.id, folderId, workspaceId },
            });
          }

          break;
        }
        case "UPDATE": {
          const {
            folder_id: folderId,
            workspace_id: workspaceId,
            icon_id,
            id,
            in_trash,
            title,
          } = newData as {
            folder_id: string;
            workspace_id: string;
            id: string;
            title: string;
            icon_id: string;
            in_trash: string;
          };

          appState.workspaces.some((workspace) =>
            workspace.folders.some((folder) =>
              folder.files.some((file) => {
                if (file.id === id) {
                  dispatch({
                    type: "UPDATE_FILE",
                    payload: {
                      workspaceId,
                      folderId,
                      fileId: id,
                      file: {
                        title: title,
                        iconId: icon_id,
                        inTrash: in_trash,
                      },
                    },
                  });

                  return true;
                }
              })
            )
          );

          break;
        }
        default:
          break;
      }
    };

    const handleFolderEvents = (
      eventType: "INSERT" | "UPDATE" | "DELETE",
      newData: {
        [key: string]: any;
      },
      oldData: {
        [key: string]: any;
      }
    ) => {
      switch (eventType) {
        case "INSERT": {
          console.log("Supabase Realtime: Received INSERT event");
          console.log(newData);

          const { workspace_id: workspaceId, id: folderId } = newData;

          const currentWorkspace = appState.workspaces.find(
            (workspace) => workspace.id === workspaceId
          );
          const currentFolder = currentWorkspace?.folders.find(
            (folder) => folder.id === folderId
          );

          if (!currentFolder) {
            const newFolder: AppFoldersType = {
              id: newData.id,
              files: [],
              workspaceId: newData.workspace_id,
              inFavorite: newData.in_favorite,
              createdAt: newData.created_at,
              title: newData.title,
              iconId: newData.icon_id,
              data: newData.data,
              inTrash: newData.in_trash,
              bannerUrl: newData.banner_url,
            };

            dispatch({
              type: "ADD_FOLDER",
              payload: { folder: newFolder, workspaceId },
            });
          }

          break;
        }
        case "DELETE": {
          const oldId = oldData as { id: string };
          let workspaceId = "";
          let folderId = "";

          const folderExists = appState.workspaces.some((workspace) =>
            workspace.folders.some((folder) =>
              folder.files.some((file) => {
                if (file.id === oldId.id) {
                  workspaceId = workspace.id;
                  folderId = folder.id;
                  return true;
                }
              })
            )
          );

          if (folderExists && workspaceId && folderId) {
            router.replace(`/dashboard/${workspaceId}`);

            dispatch({
              type: "DELETE_FOLDER",
              payload: { folderId, workspaceId },
            });
          }

          break;
        }
        case "UPDATE": {
          const {
            folder_id: folderId,
            workspace_id: workspaceId,
            icon_id,
            id,
            in_trash,
            title,
            banner_url,
            in_favorite,
          } = newData as {
            folder_id: string;
            workspace_id: string;
            id: string;
            title: string;
            icon_id: string;
            in_trash: string;
            in_favorite: string;
            banner_url: string;
          };

          appState.workspaces.some((workspace) =>
            workspace.folders.some((folder) =>
              folder.files.some((file) => {
                if (file.id === id) {
                  dispatch({
                    type: "UPDATE_FOLDER",
                    payload: {
                      workspaceId,
                      folderId,
                      folder: {
                        title,
                        iconId: icon_id,
                        inTrash: in_trash,
                        bannerUrl: banner_url,
                        inFavorite: in_favorite,
                      },
                    },
                  });

                  return true;
                }
              })
            )
          );

          break;
        }
        default:
          break;
      }
    };

    const subscribe = dbChanges.subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [supabaseClient, selectedWorkspaceId, appState]);

  return null;
};
