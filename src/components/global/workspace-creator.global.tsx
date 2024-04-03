"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

import { createWorkspace } from "@/queries/workspace";
import { addCollaborators } from "@/queries/collaborator";

import CollaboratorSearch from "./collaborator-search.global";
import PermissionSelect from "./permission-select.global";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

import { useSupabaseUser } from "@/hooks/user-supabase-user";
import { Subscription, User, Workspace } from "@/types/supabase.types";
import { PermissionsKey } from "@/types/global.type";

interface WorkspaceCreatorProps {}

const WorkspaceCreator: React.FC<WorkspaceCreatorProps> = ({}) => {
  const router = useRouter();
  const { user } = useSupabaseUser();

  const [permissions, setPermissions] =
    React.useState<PermissionsKey>("private");
  const [title, setTitle] = React.useState<string>("");
  const [collaborators, setCollaborators] = React.useState<User[]>([]);
  const [isWorkspaceLoading, setIsWorkspaceLoading] =
    React.useState<boolean>(false);

  const addCollaborator = (user: User) => {
    setCollaborators([...collaborators, user]);
  };

  const removeCollaborator = (user: User) => {
    setCollaborators(
      collaborators.filter((collaborator) => collaborator.id !== user.id)
    );
  };

  const handleCreateWorkshop = async () => {
    setIsWorkspaceLoading(true);
    const uniqueId = uuidv4();

    if (user?.id) {
      const payload: Workspace = {
        id: uniqueId,
        createdAt: new Date().toISOString(),
        title,
        data: null,
        logo: null,
        iconId: "💼",
        inTrash: "",
        workspaceOwner: user.id,
        bannerUrl: "",
      };

      if (permissions === "private") {
        await createWorkspace(payload);
        router.refresh();
      }

      if (permissions === "shared") {
        await createWorkspace(payload);
        const res = await addCollaborators(collaborators, uniqueId);
        console.log(res);
        router.refresh();
      }

      toast.success(`Workspace "${title}" created successfully!`);
      setIsWorkspaceLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <Label htmlFor="name" className="text-sm text-muted-foreground">
          Name
        </Label>
        <div className="flex justify-center items-center gap-2">
          <Input
            name="name"
            value={title}
            placeholder="Workspace name"
            disabled={isWorkspaceLoading}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="permissions" className="text-sm text-muted-foreground">
          Permission
        </Label>
        <PermissionSelect
          defaultValue={permissions}
          setPermission={setPermissions}
        />
      </div>

      {permissions === "shared" && (
        <div>
          <CollaboratorSearch
            existingCollaborators={collaborators}
            getCollaborator={(collaborator) => {
              addCollaborator(collaborator);
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
              <span className="font-bold">{collaborators.length || ""}</span>
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
                      onClick={() => removeCollaborator(collaborator)}
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

      <Button
        type="button"
        variant="secondary"
        onClick={() => handleCreateWorkshop()}
        className="self-end px-6"
        isLoading={isWorkspaceLoading}
        disabled={
          !title || (permissions === "shared" && collaborators.length === 0)
        }
      >
        Create
      </Button>
    </div>
  );
};

export default WorkspaceCreator;
