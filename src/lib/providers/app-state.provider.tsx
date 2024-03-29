"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Folder, Workspace } from "@/types/supabase.types";

export type AppFoldersType = Folder & {
  files: File[] | [];
};

export type AppWorkspacesType = Workspace & {
  folders: AppFoldersType[] | [];
};

interface AppState {
  workspaces: AppWorkspacesType[] | [];
}

export type Action =
  | { type: "ADD_WORKSPACE"; payload: AppWorkspacesType }
  | { type: "DELETE_WORKSPACE"; payload: string }
  | {
      type: "UPDATE_WORKSPACE";
      payload: { workspace: Partial<AppWorkspacesType>; workspaceId: string };
    }
  | {
      type: "SET_WORKSPACES";
      payload: { workspaces: AppWorkspacesType[] | [] };
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

    // const fetchFiles = async () => {
    //   const { error: filesError, data } = await getFiles(folderId);
    //   if (filesError) {
    //     console.log(filesError);
    //   }
    //   if (!data) return;
    //   dispatch({
    //     type: "SET_FILES",
    //     payload: { workspaceId, files: data, folderId },
    //   });
    // };
    // fetchFiles();
  }, [folderId, workspaceId]);

  React.useEffect(() => {
    console.log("App State Changed", state);
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
