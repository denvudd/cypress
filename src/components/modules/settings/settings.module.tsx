"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import CypressSettingsIcon from "@/components/ui/icons/settings-icon";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useSupabaseUser } from "@/hooks/user-supabase-user";
import { useAppState } from "@/hooks/use-app-state";

import { PermissionsKey } from "@/types/global.type";
import { User, Workspace } from "@/types/supabase.types";
import { Plus, Trash } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { deleteWorkspace, updateWorkspace } from "@/queries/workspace";
import { v4 as uuidv4 } from "uuid";
import PermissionSelect from "@/components/global/permission-select.global";
import CollaboratorSearch from "@/components/global/collaborator-search.global";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { addCollaborators, removeCollaborator } from "@/queries/collaborator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface SettingsProps {}

const Settings: React.FC<SettingsProps> = ({}) => {
  const router = useRouter();
  const supabaseClient = createClientComponentClient();
  const { user } = useSupabaseUser();
  const { state: appState, workspaceId, dispatch } = useAppState();

  const [permission, setPermission] = React.useState<PermissionsKey>("private");
  const [collaborators, setCollaborators] = React.useState<User[]>([]);
  const [workspaceDetails, setWorkspaceDetails] = React.useState<Workspace>();

  const [isDeleting, setIsDeleting] = React.useState<boolean>(false);
  const [isOpenAlertMessage, setIsOpenAlertMessage] =
    React.useState<boolean>(false);
  const [isProfilePicLoading, setIsProfilePicLoading] =
    React.useState<boolean>(false);
  const [isLogoUploading, setIsLogoUploading] = React.useState<boolean>(false);

  const timerRef = React.useRef<ReturnType<typeof setTimeout>>();

  React.useEffect(() => {
    const currentWorkspace = appState.workspaces.find(
      (workspace) => workspace.id === workspaceId
    );

    if (currentWorkspace) {
      setWorkspaceDetails(currentWorkspace);
    }
  }, [workspaceId, appState]);

  if (!workspaceId) return undefined;

  const handleAddCollaborators = async (user: User) => {
    await addCollaborators(collaborators, workspaceId);
    setCollaborators([...collaborators, user]);

    router.refresh();
  };

  const handleRemoveCollaborator = async (user: User) => {
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

    console.log(data);

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

  const handleDeleteWorkspace = async () => {
    setIsDeleting(true);

    dispatch({ type: "DELETE_WORKSPACE", payload: workspaceId });
    await deleteWorkspace(workspaceId);

    toast.success("Workspace deleted successfully!");
    router.replace("/dashboard");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <li className="group/native flex items-center transition-all gap-2 cursor-pointer">
          <CypressSettingsIcon className="size-5" />
          <span className="text-sm font-medium">Settings</span>
        </li>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Workspace Settings</DialogTitle>
        </DialogHeader>
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
              className="text-sm text-muted-foreground"
            >
              Workspace logo
            </Label>
            <Input
              name="workspaceLogo"
              type="file"
              accept="image/*"
              placeholder="Workspace logo"
              onChange={handleChangeWorkspaceLogo}
              disabled={isLogoUploading}
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
                    collaborators.map((collaborator) => (
                      <div
                        key={collaborator.id}
                        className="p-4 flex justify-between items-center animate-in fade-in-5 zoom-in-95"
                      >
                        <div className="flex gap-4 items-center">
                          <Avatar>
                            <AvatarImage src="/avatars/7.png" />
                            <AvatarFallback>JD</AvatarFallback>
                          </Avatar>
                          <div className="text-sm gap-2 text-muted-foreground overflow-hidden overflow-ellipsis sm:w-[300px] w-[140px]">
                            {collaborator.email}
                          </div>
                        </div>
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => handleRemoveCollaborator(collaborator)}
                        >
                          <Trash className="size-4" />
                        </Button>
                      </div>
                    ))
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
              Warning! Deleting your workspace will permanently delete all data
              related to this workspace.
            </AlertDescription>
            <div className="flex justify-end">
              <Button
                type="submit"
                size="sm"
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
      </DialogContent>
    </Dialog>
  );
};

export default Settings;
