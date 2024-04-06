"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { type AuthUser } from "@supabase/supabase-js";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { v4 as uuidv4 } from "uuid";
import { InfoIcon } from "lucide-react";

import { createWorkspace } from "@/queries/workspace";

import EmojiPicker from "@/components/global/emoji-picker.global";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

import { useAppState } from "@/hooks/use-app-state";
import {
  DashboardSetupValidator,
  DashboardSetupValidatorScheme,
} from "@/lib/validators/dashboard-setup.validator";
import { Workspace } from "@/types/supabase.types";
import { Subscription } from "@/types/supabase.types";

interface DashboardSetupProps {
  user: AuthUser;
  subscription: Subscription | null;
}

const DashboardSetup: React.FC<DashboardSetupProps> = ({
  user,
  subscription,
}) => {
  const router = useRouter();
  const supabaseClient = createClientComponentClient();
  const { dispatch } = useAppState();

  const [selectedEmoji, setSelectedEmoji] = React.useState<string>("💼");

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, isLoading: isFormLoading, errors },
  } = useForm<DashboardSetupValidatorScheme>({
    mode: "onChange",
    resolver: zodResolver(DashboardSetupValidator),
    defaultValues: {
      logo: "",
      workspaceName: "",
    },
  });

  const isLoading = isSubmitting || isFormLoading;

  const onSubmit: SubmitHandler<DashboardSetupValidatorScheme> = async (
    values
  ) => {
    const file = values.logo?.[0];
    let filePath = null;
    const workspaceUUID = uuidv4();

    if (file) {
      try {
        const { data, error } = await supabaseClient.storage
          .from("workspace-logos")
          .upload(`workspaceLogo.${workspaceUUID}`, file, {
            cacheControl: "3600",
            upsert: true,
          });

        if (error) throw new Error("");

        filePath = data.path;
      } catch (error) {
        toast.error("Error! Could not upload your workspace logo");
      }
    }

    try {
      const newWorkspace: Workspace = {
        data: null,
        createdAt: new Date().toISOString(),
        iconId: selectedEmoji,
        id: workspaceUUID,
        inTrash: "",
        title: values.workspaceName,
        workspaceOwner: user.id,
        logo: filePath || null,
        bannerUrl: "",
      };

      const { error: createError } = await createWorkspace(newWorkspace);

      if (createError) {
        throw new Error();
      }

      dispatch({
        type: "ADD_WORKSPACE",
        payload: { ...newWorkspace, folders: [] },
      });

      toast.success("Workspace Created", {
        description: `${newWorkspace.title} has been created successfully.`,
      });

      router.replace(`/dashboard/${newWorkspace.id}`);
    } catch (error) {
      console.log(error, "Error");
      toast.error("Could not create your workspace", {
        description:
          "Oops! Something went wrong, and we couldn't create your workspace. Try again or come back later.",
      });
    } finally {
      reset();
    }
  };

  return (
    <Card className="w-[800px] h-screen sm:h-auto blured-light dark:blured bg-card/80">
      <CardHeader>
        <CardTitle>Create a workspace</CardTitle>
        <CardDescription>
          Let&apos;s create a private workspace to get you started. You can add
          collaborators later from the workspace settings tab.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="text-5xl">
                <EmojiPicker getValue={(emoji) => setSelectedEmoji(emoji)}>
                  {selectedEmoji}
                </EmojiPicker>
              </div>
              <div className="w-full space-y-1">
                <Label
                  htmlFor="workspaceName"
                  className="text-sm text-muted-foreground"
                >
                  Name
                </Label>
                <Input
                  id="workspaceName"
                  type="text"
                  placeholder="Workspace name"
                  disabled={isLoading}
                  {...register("workspaceName")}
                />
                <small className="text-red-600">
                  {errors?.workspaceName?.message?.toString()}
                </small>
              </div>
            </div>

            <div className="w-full space-y-1">
              <Label
                htmlFor="workspaceLogo"
                className="text-sm text-muted-foreground flex items-center gap-1.5"
              >
                Workspace logo
                {subscription?.status !== "active" && (
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="size-3.5" />
                    </TooltipTrigger>
                    <TooltipContent>
                      You can change the workspace logo only with Pro plan.
                    </TooltipContent>
                  </Tooltip>
                )}
              </Label>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                placeholder="Workspace name"
                disabled={isLoading || subscription?.status !== "active"}
                {...register("logo")}
              />
              <small className="text-red-600">
                {errors?.logo?.message?.toString()}
              </small>
            </div>
            <div className="self-end">
              <Button disabled={isLoading} isLoading={isLoading} type="submit">
                Create workspace
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DashboardSetup;
