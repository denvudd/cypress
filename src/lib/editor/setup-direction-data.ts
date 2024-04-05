import { getFileDetails } from "@/queries/file";
import { getFolderDetails } from "@/queries/folder";
import { getWorkspaceDetails } from "@/queries/workspace";
import { DirectionType } from "@/types/global.type";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Action } from "../providers/app-state.provider";

/** Defines type of file and updates contents from editor to DB
 * @param {String} dirType - type of direction (file, folder, workspace). See types/global.type.ts DirectionType
 * @param {String} targetId - id of target file (folder, file, worskapce etc.)
 * @param {String} workspaceId - id of workspace
 * @param {NextRouter} router - insance of Next router
 * @param {Quill} quill - instance of Quill editor
 * @param {Function} dispatch - dispatch function from useAppState()
 */
export const setupDirectionData = async ({
  dirType,
  targetId,
  workspaceId,
  router,
  quill,
  dispatch,
}: {
  dirType: DirectionType;
  targetId: string;
  workspaceId: string;
  router: AppRouterInstance;
  quill: any;
  dispatch: (value: Action) => void;
}) => {
  switch (dirType) {
    case "file": {
      const { data: selectedDir, error } = await getFileDetails(targetId);

      if (!selectedDir || error) {
        router.replace(`/dashboard`);
        return undefined;
      }

      const file = selectedDir[0];

      if (!file) {
        router.replace(`/dashboard/${workspaceId}`);
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
      const { data: selectedDir, error } = await getWorkspaceDetails(targetId);

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
