"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Workspace } from "@/types/supabase.types";

export type AppFoldersType = Workspace & {
  folders: AppFoldersType[] | [];
};

interface AppState {
  workspaces: AppFoldersType[] | [];
}

export type Action = { type: "ADD_WORKSPACE"; payload: AppFoldersType };
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

interface AppStateProviderProps {
  children: React.ReactNode;
}

const AppStateProvider: React.FC<AppStateProviderProps> = ({ children }) => {
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
