"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Folder, Workspace, File } from "@/types/supabase.types";
import { getFiles } from "@/queries/file";
import { toast } from "sonner";

export type AppFoldersType = Folder & {
  files: File[];
};

export type AppWorkspacesType = Workspace & {
  folders: AppFoldersType[];
};

export interface AppState {
  workspaces: AppWorkspacesType[];
}

export type Action =
  | { type: "DELETE_WORKSPACE"; payload: string }
  | {
      type: "DELETE_FILE";
      payload: { workspaceId: string; folderId: string; fileId: string };
    }
  | {
      type: "DELETE_FOLDER";
      payload: { workspaceId: string; folderId: string };
    }
  | {
      type: "SET_WORKSPACES";
      payload: { workspaces: AppWorkspacesType[] };
    }
  | {
      type: "SET_FILES";
      payload: { workspaceId: string; files: File[]; folderId: string };
    }
  | {
      type: "SET_FOLDERS";
      payload: { workspaceId: string; folders: AppFoldersType[] };
    }
  | { type: "ADD_WORKSPACE"; payload: AppWorkspacesType }
  | {
      type: "ADD_FOLDER";
      payload: { workspaceId: string; folder: AppFoldersType };
    }
  | {
      type: "ADD_FILE";
      payload: { workspaceId: string; file: File; folderId: string };
    }
  | {
      type: "UPDATE_WORKSPACE";
      payload: {
        workspace: Omit<Partial<Workspace>, "id">;
        workspaceId: string;
      };
    }
  | {
      type: "UPDATE_FOLDER";
      payload: {
        folder: Omit<Partial<AppFoldersType>, "id">;
        workspaceId: string;
        folderId: string;
      };
    }
  | {
      type: "UPDATE_FILE";
      payload: {
        file: Omit<Partial<File>, "id">;
        folderId: string;
        workspaceId: string;
        fileId: string;
      };
    };

const initialState: AppState = { workspaces: [] };

const appReducer = (
  state: AppState = initialState,
  action: Action
): AppState => {
  switch (action.type) {
    case "ADD_WORKSPACE":
      return {
        ...state,
        workspaces: [...state.workspaces, action.payload],
      };
    case "DELETE_WORKSPACE":
      return {
        ...state,
        workspaces: state.workspaces.filter(
          (workspace) => workspace.id !== action.payload
        ),
      };
    case "DELETE_FOLDER":
      return {
        ...state,
        workspaces: state.workspaces.map((workspace) => {
          if (workspace.id === action.payload.workspaceId) {
            return {
              ...workspace,
              folders: workspace.folders.filter(
                (folder) => folder.id !== action.payload.folderId
              ),
            };
          }
          return workspace;
        }),
      };
    case "DELETE_FILE":
      return {
        ...state,
        workspaces: state.workspaces.map((workspace) => {
          if (workspace.id === action.payload.workspaceId) {
            return {
              ...workspace,
              folder: workspace.folders.map((folder) => {
                if (folder.id === action.payload.folderId) {
                  return {
                    ...folder,
                    files: folder.files.filter(
                      (file) => file.id !== action.payload.fileId
                    ),
                  };
                }
                return folder;
              }),
            };
          }
          return workspace;
        }),
      };
    case "UPDATE_WORKSPACE":
      return {
        ...state,
        workspaces: state.workspaces.map((workspace) => {
          if (workspace.id === action.payload.workspaceId) {
            return {
              ...workspace,
              ...action.payload.workspace,
            };
          }
          return workspace;
        }),
      };
    case "SET_WORKSPACES":
      return {
        ...state,
        workspaces: action.payload.workspaces,
      };
    case "SET_FOLDERS":
      return {
        ...state,
        workspaces: state.workspaces.map((workspace) => {
          if (workspace.id === action.payload.workspaceId) {
            return {
              ...workspace,
              folders: action.payload.folders.sort(
                (a, b) =>
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime()
              ),
            };
          }

          return workspace;
        }),
      };
    case "SET_FILES":
      return {
        ...state,
        workspaces: state.workspaces.map((workspace) => {
          if (workspace.id === action.payload.workspaceId) {
            return {
              ...workspace,
              folders: workspace.folders.map((folder) => {
                if (folder.id === action.payload.folderId) {
                  return {
                    ...folder,
                    files: action.payload.files,
                  };
                }
                return folder;
              }),
            };
          }
          return workspace;
        }),
      };
    case "ADD_FOLDER":
      return {
        ...state,
        workspaces: state.workspaces.map((workspace) => {
          return {
            ...workspace,
            folders: [...workspace.folders, action.payload.folder].sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            ),
          };
        }),
      };
    case "UPDATE_FOLDER":
      return {
        ...state,
        workspaces: state.workspaces.map((workspace) => {
          if (workspace.id === action.payload.workspaceId) {
            return {
              ...workspace,
              folders: workspace.folders.map((folder) => {
                if (folder.id === action.payload.folderId) {
                  return { ...folder, ...action.payload.folder };
                }

                return folder;
              }),
            };
          }
          return workspace;
        }),
      };
    case "ADD_FILE":
      return {
        ...state,
        workspaces: state.workspaces.map((workspace) => {
          if (workspace.id === action.payload.workspaceId) {
            return {
              ...workspace,
              folders: workspace.folders.map((folder) => {
                if (folder.id === action.payload.folderId) {
                  return {
                    ...folder,
                    files: [...folder.files, action.payload.file].sort(
                      (a, b) =>
                        new Date(a.createdAt).getTime() -
                        new Date(b.createdAt).getTime()
                    ),
                  };
                }
                return folder;
              }),
            };
          }
          return workspace;
        }),
      };
    case "UPDATE_FILE":
      return {
        ...state,
        workspaces: state.workspaces.map((workspace) => {
          if (workspace.id === action.payload.workspaceId) {
            return {
              ...workspace,
              folders: workspace.folders.map((folder) => {
                if (folder.id === action.payload.folderId) {
                  return {
                    ...folder,
                    files: folder.files.map((file) => {
                      if (file.id === action.payload.fileId) {
                        return {
                          ...file,
                          ...action.payload.file,
                        };
                      }
                      return file;
                    }),
                  };
                }
                return folder;
              }),
            };
          }
          return workspace;
        }),
      };
    default:
      return initialState;
  }
};

export const AppStateContext = React.createContext<
  | {
      state: AppState;
      dispatch: React.Dispatch<Action>;
      workspaceId: string | undefined;
      folderId: string | undefined;
      fileId: string | undefined;
    }
  | undefined
>(undefined);

const AppStateProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = React.useReducer(appReducer, initialState);
  const pathname = usePathname();

  const workspaceId = React.useMemo(() => {
    const urlSegments = pathname?.split("/").filter(Boolean);

    if (urlSegments)
      if (urlSegments.length > 1) {
        return urlSegments[1];
      }
  }, [pathname]);

  const folderId = React.useMemo(() => {
    const urlSegments = pathname?.split("/").filter(Boolean);

    if (urlSegments)
      if (urlSegments?.length > 2) {
        return urlSegments[2];
      }
  }, [pathname]);

  const fileId = React.useMemo(() => {
    const urlSegments = pathname?.split("/").filter(Boolean);

    if (urlSegments)
      if (urlSegments?.length > 3) {
        return urlSegments[3];
      }
  }, [pathname]);

  React.useEffect(() => {
    if (!folderId || !workspaceId) return;

    const fetchFiles = async () => {
      const { error: filesError, data } = await getFiles(folderId);

      if (filesError) {
        toast.error("Error! Could not fetch your files", {
          description: "Please try again later",
        });
      }

      if (!data) return undefined;

      dispatch({
        type: "SET_FILES",
        payload: { workspaceId, files: data, folderId },
      });
    };

    fetchFiles();
  }, [folderId, workspaceId]);

  React.useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("App State Changed", state);
    }
  }, [state]);

  return (
    <AppStateContext.Provider
      value={{ state, dispatch, workspaceId, folderId, fileId }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export default AppStateProvider;
