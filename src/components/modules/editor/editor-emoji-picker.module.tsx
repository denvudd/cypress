import React from "react";

import { updateFile } from "@/queries/file";
import { updateFolder } from "@/queries/folder";
import { updateWorkspace } from "@/queries/workspace";

import EmojiPicker from "@/components/global/emoji-picker.global";
import { useAppState } from "@/hooks/use-app-state";
import { DirectionType } from "@/types/global.type";

interface EditorEmojiPickerProps {
  targetId: string;
  dirType: DirectionType;
  iconId: string | undefined;
}

const EditorEmojiPicker: React.FC<EditorEmojiPickerProps> = ({
  iconId,
  dirType,
  targetId,
}) => {
  const { dispatch, folderId, workspaceId } = useAppState();
  const handleSelectEmoji = async (icon: string) => {
    if (!targetId) return undefined;

    switch (dirType) {
      case "workspace":
        dispatch({
          type: "UPDATE_WORKSPACE",
          payload: { workspace: { iconId: icon }, workspaceId: targetId },
        });

        await updateWorkspace({ iconId: icon }, targetId);
        break;
      case "folder":
        if (!workspaceId) return undefined;

        dispatch({
          type: "UPDATE_FOLDER",
          payload: {
            folder: { iconId: icon },
            workspaceId,
            folderId: targetId,
          },
        });
        await updateFolder({ iconId: icon }, targetId);
        break;
      case "file":
        if (!workspaceId || !folderId) return undefined;

        dispatch({
          type: "UPDATE_FILE",
          payload: {
            file: { iconId: icon },
            workspaceId,
            folderId,
            fileId: targetId,
          },
        });
        await updateFile({ iconId: icon }, targetId);

        break;
    }
  };

  return (
    <div className="text-[80px]">
      <EmojiPicker getValue={handleSelectEmoji}>
        <div className="size-[100px] cursor-pointer transition-colors flex justify-center items-center hover:bg-muted rounded-md">
          {iconId}
        </div>
      </EmojiPicker>
    </div>
  );
};

export default EditorEmojiPicker;
