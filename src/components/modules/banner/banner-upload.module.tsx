"use client";

import React from "react";

import { DirectionType } from "@/types/global.type";
import { File, Folder, Workspace } from "@/types/supabase.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useAppState } from "@/hooks/use-app-state";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  BannerUploadValidatorSchema,
} from "@/lib/validators/banner-upload.validator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { updateFile } from "@/queries/file";
import { updateFolder } from "@/queries/folder";
import { updateWorkspace } from "@/queries/workspace";

interface BannerUploadProps {
  targetId: string;
  children: React.ReactNode;
  className: string;
  dirType: DirectionType;
}

const BannerUpload: React.FC<BannerUploadProps> = ({
  children,
  className,
  dirType,
  targetId,
}) => {
  const supabaseClient = createClientComponentClient();
  const { dispatch, folderId, workspaceId } = useAppState();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting: isUploading, errors },
  } = useForm<BannerUploadValidatorSchema>({
    mode: "onChange",
    defaultValues: {
      banner: "",
    },
  });

  const onSubmit: SubmitHandler<BannerUploadValidatorSchema> = async (
    values
  ) => {
    const file = values.banner?.[0];

    if (!file || !targetId) return undefined;

    try {
      let filePath = null;

      const uploadBanner = async () => {
        const { data, error } = await supabaseClient.storage
          .from("file-banners")
          .upload(`banner-${targetId}`, file, {
            cacheControl: "5",
            upsert: true,
          });

        if (error) throw new Error(error.message);

        filePath = data.path;
      };

      switch (dirType) {
        case "file": {
          if (!workspaceId || !folderId) return undefined;
          await uploadBanner();

          dispatch({
            type: "UPDATE_FILE",
            payload: {
              file: {
                bannerUrl: filePath,
              },
              fileId: targetId,
              folderId,
              workspaceId,
            },
          });

          await updateFile({ bannerUrl: filePath }, targetId);
        }
        case "folder": {
          if (!workspaceId || !folderId) return undefined;
          await uploadBanner();

          dispatch({
            type: "UPDATE_FOLDER",
            payload: {
              folderId: targetId,
              folder: { bannerUrl: filePath },
              workspaceId,
            },
          });

          await updateFolder({ bannerUrl: filePath }, targetId);
        }
        case "workspace": {
          if (!workspaceId) return;
          await uploadBanner();

          dispatch({
            type: "UPDATE_WORKSPACE",
            payload: {
              workspace: { bannerUrl: filePath },
              workspaceId,
            },
          });

          await updateWorkspace({ bannerUrl: filePath }, targetId);
        }
      }
    } catch (error) {}
  };

  console.log(errors);

  return (
    <Dialog>
      <DialogTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "h-6 px-2",
          className
        )}
      >
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload cover</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground" htmlFor="banner">
              Cover image
            </Label>
            <Input
              id="banner"
              type="file"
              accept="image/*"
              disabled={isUploading}
              {...register("banner", { required: "Cover image is required" })}
            />
            {errors.banner?.message?.toString() && (
              <small className="text-destructive animate-in fade-in-0 zoom-in-95">
                {errors.banner?.message?.toString()}
              </small>
            )}
          </div>
          <div className="flex justify-end">
            <Button
              disabled={isUploading}
              isLoading={isUploading}
              type="submit"
              className="px-6"
            >
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BannerUpload;
