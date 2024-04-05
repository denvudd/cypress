import React from "react";

import { removeCollaborator } from "@/queries/collaborator";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import { User } from "@/types/supabase.types";

interface SettingsPermissionAlertProps {
  workspaceId: string | undefined;
  isOpenAlertMessage: boolean;
  collaborators: User[];
  setPermission: React.Dispatch<React.SetStateAction<"private" | "shared">>;
  setIsOpenAlertMessage: React.Dispatch<React.SetStateAction<boolean>>;
}

const SettingsPermissionAlert: React.FC<SettingsPermissionAlertProps> = ({
  isOpenAlertMessage,
  collaborators,
  workspaceId,
  setPermission,
  setIsOpenAlertMessage,
}) => {
  const [isPermissionChanging, setIsPermissionChanging] =
    React.useState<boolean>(false);

  const handleAlertConfirm = async () => {
    if (!workspaceId) return undefined;
    if (!collaborators.length) return undefined;

    setIsPermissionChanging(true);
    await removeCollaborator(collaborators, workspaceId);
    setIsPermissionChanging(false);

    setPermission("private");
    setIsOpenAlertMessage(false);
  };

  return (
    <AlertDialog open={isOpenAlertMessage} onOpenChange={setIsOpenAlertMessage}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            Changing a Public workspace to Private workspace will remove all
            collaborators permanently.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              onClick={handleAlertConfirm}
              isLoading={isPermissionChanging}
            >
              Cancel
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SettingsPermissionAlert;
