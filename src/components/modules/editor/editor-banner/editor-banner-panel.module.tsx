import React from "react";
import { CircleXIcon, ImageIcon } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import { updateFile } from "@/queries/file";
import { updateFolder } from "@/queries/folder";
import { updateWorkspace } from "@/queries/workspace";

import BannerUpload from "../../banner/banner-upload.module";
import { Button } from "@/components/ui/button";

import { useAppState } from "@/hooks/use-app-state";
import { DirectionType } from "@/types/global.type";

interface EditorBannerPanel {
  bannerUrl: string | undefined | null;
  targetId: string;
  dirType: DirectionType;
}

const EditorBannerPanel: React.FC<EditorBannerPanel> = ({
  bannerUrl,
  dirType,
  targetId,
}) => {
  const supabaseClient = createClientComponentClient();
  const {
    state: appState,
    dispatch,
    fileId,
    folderId,
    workspaceId,
  } = useAppState();
  const [isDeletingBanner, setIsDeletingBanner] =
    React.useState<boolean>(false);

  const handleDeleteBanner = async () => {
    if (!targetId) return;

    setIsDeletingBanner(true);

    if (dirType === "file") {
      if (!folderId || !workspaceId) return;

      dispatch({
        type: "UPDATE_FILE",
        payload: {
          file: { bannerUrl: "" },
          fileId: targetId,
          folderId,
          workspaceId,
        },
      });

      await supabaseClient.storage
        .from("file-banners")
        .remove([`banner-${fileId}`]);

      await updateFile({ bannerUrl: "" }, targetId);
    }

    if (dirType === "folder") {
      if (!workspaceId) return;

      dispatch({
        type: "UPDATE_FOLDER",
        payload: { folder: { bannerUrl: "" }, folderId: targetId, workspaceId },
      });

      await supabaseClient.storage
        .from("file-banners")
        .remove([`banner-${fileId}`]);
      await updateFolder({ bannerUrl: "" }, targetId);
    }
    if (dirType === "workspace") {
      dispatch({
        type: "UPDATE_WORKSPACE",
        payload: {
          workspace: { bannerUrl: "" },
          workspaceId: targetId,
        },
      });

      await supabaseClient.storage
        .from("file-banners")
        .remove([`banner-${fileId}`]);
      await updateWorkspace({ bannerUrl: "" }, targetId);
    }

    setIsDeletingBanner(false);
  };

  return (
    <div className="flex items-center gap-1 mt-2">
      <BannerUpload
        targetId={targetId}
        dirType={dirType}
        className="flex items-center gap-1.5 text-muted-foreground"
      >
        <ImageIcon className="size-4" />
        {bannerUrl ? "Update cover" : "Add cover"}
      </BannerUpload>

      {bannerUrl && (
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1.5 h-6 px-2 text-muted-foreground hover:text-destructive"
          onClick={handleDeleteBanner}
        >
          <CircleXIcon className="size-4" />
          Delete cover
        </Button>
      )}
    </div>
  );
};

export default EditorBannerPanel;
