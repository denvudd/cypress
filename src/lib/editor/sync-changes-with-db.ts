import { DirectionType } from "@/types/global.type";
import React from "react";
import { Action } from "../providers/app-state.provider";
import { updateFile } from "@/queries/file";
import { updateFolder } from "@/queries/folder";
import { updateWorkspace } from "@/queries/workspace";

/** Sync updates and changes in the editor with DB with delay of 850ms using
 * optimistic updates through global App State
 * @param {Object} saveTimerRef - Reference to save timer
 * @param {Object} contents - Contents of the editor
 * @param {Number} quillLength - Length of the content of editor
 * @param {String} dirType - type of direction (file, folder, workspace). See types/global.type.ts DirectionType
 * @param {String} targetId - id of target file (folder, file, worskapce etc.)
 * @param {String} folderId - id of folder
 * @param {String} workspaceId - id of workspace
 * @param {Function} setIsSaving - function for changing loading state
 * @param {Function} dispatch - dispatch function from useAppState()
 */
export const syncChangesWithDb = ({
  saveTimerRef,
  contents,
  quillLength,
  targetId,
  dirType,
  folderId,
  workspaceId,
  setIsSaving,
  dispatch,
}: {
  saveTimerRef: React.MutableRefObject<NodeJS.Timeout | null>;
  quillLength: number;
  contents: any;
  targetId: string;
  dirType: DirectionType;
  workspaceId: string;
  folderId: string | undefined;
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
  dispatch: (action: Action) => void;
}) => {
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
};
