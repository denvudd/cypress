"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ExternalLink, InfoIcon, LogOut, Plus, Trash } from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

import { deleteWorkspace, updateWorkspace } from "@/queries/workspace";
import { getAuthUser, updateUser } from "@/queries/auth";
import {
  addCollaborators,
  getCollaborators,
  removeCollaborator,
} from "@/queries/collaborator";

import PermissionSelect from "@/components/global/permission-select.global";
import CollaboratorSearch from "@/components/global/collaborator-search.global";
import CypressSettingsIcon from "@/components/ui/icons/settings-icon";
import SettingsPermissionAlert from "./settings-permission-alert.module";
import LogoutButton from "@/components/global/logout-button.global";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { useSupabaseUser } from "@/hooks/user-supabase-user";
import { useAppState } from "@/hooks/use-app-state";
import { useSubscriptionModal } from "@/hooks/use-subscription-modal";
import { cn, generateColorFromEmail } from "@/lib/utils";

import { PermissionsKey } from "@/types/global.type";
import { Subscription, User, Workspace } from "@/types/supabase.types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SettingsProps {
  subscription: Subscription | null;
}

const Settings: React.FC<SettingsProps> = ({ subscription }) => {
  const router = useRouter();
  const supabaseClient = createClientComponentClient();
  const { user } = useSupabaseUser();
  const { state: appState, workspaceId, dispatch } = useAppState();
  const { setIsOpen } = useSubscriptionModal();

  const [permission, setPermission] = React.useState<PermissionsKey>("private");
  const [collaborators, setCollaborators] = React.useState<User[]>([]);
  const [workspaceDetails, setWorkspaceDetails] = React.useState<Workspace>();
  const [userAvatar, setUserAvatar] = React.useState<string>("");

  const [isDeleting, setIsDeleting] = React.useState<boolean>(false);
  const [isOpenAlertMessage, setIsOpenAlertMessage] =
    React.useState<boolean>(false);
  const [isProfilePicLoading, setIsProfilePicLoading] =
    React.useState<boolean>(false);
  const [isLogoUploading, setIsLogoUploading] = React.useState<boolean>(false);

  const timerRef = React.useRef<ReturnType<typeof setTimeout>>();
  const userTruncatedEmail = React.useMemo(() => {
    return user?.email
      ? user.email.split("@")[0].substring(0, 2).toUpperCase()
      : "";
  }, [user]);

  React.useEffect(() => {
    const currentWorkspace = appState.workspaces.find(
      (workspace) => workspace.id === workspaceId
    );

    if (currentWorkspace) {
      setWorkspaceDetails(currentWorkspace);
    }
  }, [workspaceId, appState]);

  React.useEffect(() => {
    const fetchCollaborators = async () => {
      if (!workspaceId) return undefined;
      const response = await getCollaborators(workspaceId);

      if (response.length) {
        setPermission("shared");
        setCollaborators(response);
      }
    };

    fetchCollaborators();
  }, [workspaceId]);

  React.useEffect(() => {
    const fetchAuthUser = async () => {
      if (user) {
        const response = await getAuthUser(user.id);

        if (!response || !response?.avatarUrl) {
          setUserAvatar("");

          return undefined;
        }

        const avatarPath = supabaseClient.storage
          .from("avatars")
          .getPublicUrl(response.avatarUrl)?.data.publicUrl;

        setUserAvatar(avatarPath);
      }
    };

    fetchAuthUser();
  }, [user]);

  if (!workspaceId) return undefined;

  const handleAddCollaborators = async (user: User) => {
    await addCollaborators([user], workspaceId);
    setCollaborators([...collaborators, user]);

    router.refresh();
  };

  const handleRemoveCollaborator = async (user: User) => {
    if (!workspaceId) return undefined;
    if (collaborators.length === 1) {
      setPermission("private");
    }

    await removeCollaborator([user], workspaceId);
    setCollaborators(
      collaborators.filter((collaborator) => collaborator.id !== user.id)
    );

    router.refresh();
  };

  const handleWorkspaceNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.value) return undefined;

    dispatch({
      type: "UPDATE_WORKSPACE",
      payload: {
        workspace: { title: event.target.value },
        workspaceId,
      },
    });

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(async () => {
      await updateWorkspace({ title: event.target.value }, workspaceId);
    }, 500);
  };

  const handleChangeWorkspaceLogo = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files) return undefined;

    const file = event.target.files[0];
    const uuid = uuidv4();

    setIsLogoUploading(true);

    const { data, error } = await supabaseClient.storage
      .from("workspace-logos")
      .upload(`workspaceLogo.${uuid}`, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (!error) {
      dispatch({
        type: "UPDATE_WORKSPACE",
        payload: {
          workspace: { logo: data.path },
          workspaceId,
        },
      });

      await updateWorkspace({ logo: data.path }, workspaceId);
      setIsLogoUploading(false);
    }
  };

  const handleChangeProfilePicture = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files) return undefined;

    const file = event.target.files[0];
    const uuid = uuidv4();

    setIsProfilePicLoading(true);

    const { data, error } = await supabaseClient.storage
      .from("avatars")
      .upload(`avatars.${uuid}`, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (!error) {
      await updateUser({ avatarUrl: data.path }, user?.id as string);
      setIsLogoUploading(false);
      window.location.reload();
    }
  };

  const handleDeleteWorkspace = async () => {
    setIsDeleting(true);

    dispatch({ type: "DELETE_WORKSPACE", payload: workspaceId });
    await deleteWorkspace(workspaceId);

    toast.success("Workspace deleted successfully!");
    router.replace("/dashboard");
  };

  const handlePermissionChange = (value: PermissionsKey) => {
    if (value === "private") {
      setIsOpenAlertMessage(true);
    } else {
      setPermission(value);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <li className="group/native flex items-center transition-all gap-2 cursor-pointer">
          <CypressSettingsIcon className="size-5" />
          <span className="text-sm font-medium">Settings</span>
        </li>
      </DialogTrigger>
      <DialogContent className="max-h-[520px]">
        <DialogHeader>
          <DialogTitle>Workspace</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex gap-3 flex-col">
            <div className="space-y-1">
              <Label
                htmlFor="workspaceName"
                className="text-sm text-muted-foreground"
              >
                Name
              </Label>
              <Input
                name="workspaceName"
                value={workspaceDetails?.title}
                placeholder="Workspace name"
                onChange={handleWorkspaceNameChange}
              />
            </div>

            <div className="space-y-1">
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
                    <TooltipContent align="start">
                      You can change the workspace logo only with Pro plan.
                    </TooltipContent>
                  </Tooltip>
                )}
              </Label>
              <Input
                name="workspaceLogo"
                type="file"
                accept="image/*"
                placeholder="Workspace logo"
                onChange={handleChangeWorkspaceLogo}
                disabled={isLogoUploading || subscription?.status !== "active"}
              />
            </div>

            <div className="space-y-1">
              <Label
                htmlFor="permissions"
                className="text-sm text-muted-foreground"
              >
                Permissions
              </Label>
              <PermissionSelect
                defaultValue={permission}
                setPermission={setPermission}
                onValueChange={handlePermissionChange}
              />
            </div>

            {permission === "shared" && (
              <div>
                <CollaboratorSearch
                  existingCollaborators={collaborators}
                  getCollaborator={(collaborator) => {
                    handleAddCollaborators(collaborator);
                  }}
                >
                  <div className="flex justify-center">
                    <Button
                      variant="secondary"
                      type="button"
                      className="text-sm animate-in fade-in-5 zoom-in-95 flex items-center gap-2"
                    >
                      <Plus className="size-4" />
                      Add collaborators
                    </Button>
                  </div>
                </CollaboratorSearch>
                <div className="mt-4 space-y-1 animate-in fade-in-5 zoom-in-95">
                  <Label className="text-muted-foreground">
                    Collaborators{" "}
                    <span className="font-bold">
                      {collaborators.length || ""}
                    </span>
                  </Label>
                  <div className="max-h-[200px] w-full overflow-y-auto rounded-md border border-muted-foreground/20">
                    {collaborators.length ? (
                      collaborators.map((collaborator) => {
                        const userTruncatedEmail = collaborator.email
                          ?.split("#")[0]
                          .substring(0, 2)
                          .toUpperCase();
                        const avatarUrl = collaborator?.avatarUrl
                          ? supabaseClient.storage
                              .from("avatars")
                              .getPublicUrl(collaborator?.avatarUrl).data
                              .publicUrl
                          : "";

                        return (
                          <div
                            key={collaborator.id}
                            className="p-4 flex justify-between items-center animate-in fade-in-5 zoom-in-95"
                          >
                            <div className="flex gap-4 items-center">
                              <Avatar>
                                <AvatarImage src={avatarUrl || ""} />
                                <AvatarFallback
                                  className="text-white font-medium"
                                  style={{
                                    backgroundColor: generateColorFromEmail(
                                      userTruncatedEmail as string
                                    ),
                                  }}
                                >
                                  {userTruncatedEmail?.substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="text-sm gap-2 text-muted-foreground overflow-hidden overflow-ellipsis sm:w-[300px] w-[140px]">
                                {collaborator.email}
                              </div>
                            </div>
                            <Button
                              variant="secondary"
                              size="icon"
                              onClick={() =>
                                handleRemoveCollaborator(collaborator)
                              }
                            >
                              <Trash className="size-4" />
                            </Button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="w-full h-full flex items-center justify-center flex-col text-sm text-muted-foreground py-6">
                        No collaborators yet
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <Alert variant="destructive">
              <AlertDescription>
                Warning! Deleting your workspace will permanently delete all
                data related to this workspace.
              </AlertDescription>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="destructive"
                  className="mt-4"
                  isLoading={isDeleting}
                  onClick={handleDeleteWorkspace}
                >
                  Delete workspace
                </Button>
              </div>
            </Alert>
          </div>

          <div className="flex flex-col gap-3">
            <DialogHeader>
              <DialogTitle>Profile</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <Label
                  htmlFor="profilePicture"
                  className="text-sm text-muted-foreground"
                >
                  Email
                </Label>
                <Input value={user ? user.email : ""} disabled readOnly />
              </div>

              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14">
                  <AvatarImage src={userAvatar} />
                  <AvatarFallback
                    style={{
                      backgroundColor: generateColorFromEmail(
                        userTruncatedEmail as string
                      ),
                    }}
                  >
                    {userTruncatedEmail}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <Label
                    htmlFor="profilePicture"
                    className="text-sm text-muted-foreground"
                  >
                    Profile picture
                  </Label>
                  <Input
                    name="profilePicture"
                    type="file"
                    accept="image/*"
                    placeholder="Profile picture"
                    onChange={handleChangeProfilePicture}
                    disabled={isProfilePicLoading}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <LogoutButton
                  className="flex items-center gap-2"
                  size="default"
                >
                  Log out
                  <LogOut className="size-4" />
                </LogoutButton>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <DialogHeader>
              <DialogTitle>Billing & Plan</DialogTitle>
              <DialogDescription>
                You are currently on a{" "}
                {subscription?.status === "active" ? "Pro" : "Free"} plan.
              </DialogDescription>
            </DialogHeader>

            <div className="flex justify-end gap-2">
              <Link
                href="/#pricing"
                target="_blank"
                className={cn(
                  buttonVariants({ variant: "secondary" }),
                  "items-center gap-2 text-foreground"
                )}
              >
                View Plans <ExternalLink className="size-4" />
              </Link>
              {subscription?.status === "active" ? (
                <div>
                  <Button
                    type="button"
                    variant="secondary"
                    // disabled={isPortalLoading}
                    // onClick={handleRedirectToPortal}
                  >
                    Menage Subscription
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="default"
                  onClick={() => setIsOpen(true)}
                >
                  Upgrade ✨
                </Button>
              )}
            </div>
          </div>
        </div>

        <SettingsPermissionAlert
          collaborators={collaborators}
          isOpenAlertMessage={isOpenAlertMessage}
          setIsOpenAlertMessage={setIsOpenAlertMessage}
          setPermission={setPermission}
          workspaceId={workspaceId}
        />
      </DialogContent>
    </Dialog>
  );
};

export default Settings;
