"use client";

import React from "react";

import { useAppState } from "@/hooks/use-app-state";

import SelectedWorkspace from "./selected-workspace.module";
import CustomDialog from "@/components/global/custom-dialog.global";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Workspace } from "@/types/supabase.types";
import WorkspaceCreator from "@/components/global/workspace-creator.global";
import { Plus } from "lucide-react";

interface WorkspaceDropdownProps {
  privateWorkspaces: Workspace[];
  sharedWorkspaces: Workspace[];
  collaboratingWorkspaces: Workspace[];
  defaultValue: Workspace | undefined;
}

const WorkspaceDropdown: React.FC<WorkspaceDropdownProps> = ({
  collaboratingWorkspaces,
  privateWorkspaces,
  sharedWorkspaces,
  defaultValue,
}) => {
  const { dispatch, state } = useAppState();
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [selectedOption, setSelectedOption] = React.useState<
    Workspace | undefined
  >(defaultValue);

  React.useEffect(() => {
    if (!state.workspaces.length) {
      dispatch({
        type: "SET_WORKSPACES",
        payload: {
          workspaces: [
            ...privateWorkspaces,
            ...sharedWorkspaces,
            ...collaboratingWorkspaces,
          ].map((workspace) => ({ ...workspace, folders: [] })),
        },
      });
    }
  }, [privateWorkspaces, collaboratingWorkspaces, sharedWorkspaces]);

  const handleSelect = (option: Workspace) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <DropdownMenu>
        <DropdownMenuTrigger className="justify-start text-left focus-visible:border-none select-none outline-none">
          {selectedOption ? (
            <SelectedWorkspace workspace={selectedOption} />
          ) : (
            "Select a workspace"
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent className="h-[190px] overflow-y-auto w-[228px]">
          <DropdownMenuLabel>Private</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-muted-foreground/20" />
          {!!privateWorkspaces.length ? (
            privateWorkspaces.map((option) => (
              <DropdownMenuItem
                className="p-0 hover:bg-none focus:bg-none"
                key={option.id}
              >
                <SelectedWorkspace
                  key={option.id}
                  workspace={option}
                  className="my-0"
                  onClick={handleSelect}
                />
              </DropdownMenuItem>
            ))
          ) : (
            <div className="w-full py-1.5 text-muted-foreground text-sm text-center">
              No workspaces.
            </div>
          )}

          <DropdownMenuLabel>Shared</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-muted-foreground/20" />
          {!!sharedWorkspaces.length ? (
            sharedWorkspaces.map((option) => (
              <DropdownMenuItem
                className="p-0 hover:bg-none focus:bg-none"
                key={option.id}
              >
                <SelectedWorkspace
                  key={option.id}
                  workspace={option}
                  className="my-0"
                  onClick={handleSelect}
                />
              </DropdownMenuItem>
            ))
          ) : (
            <div className="w-full py-1.5 text-muted-foreground text-sm text-center">
              No workspaces.
            </div>
          )}

          <DropdownMenuLabel>Collaborating</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-muted-foreground/20" />
          {!!collaboratingWorkspaces.length ? (
            collaboratingWorkspaces.map((option) => (
              <DropdownMenuItem
                className="p-0 hover:bg-none focus:bg-none"
                key={option.id}
              >
                <SelectedWorkspace
                  key={option.id}
                  workspace={option}
                  className="my-0"
                  onClick={handleSelect}
                />
              </DropdownMenuItem>
            ))
          ) : (
            <div className="w-full py-1.5 text-muted-foreground text-sm text-center">
              No workspaces.
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <CustomDialog
        trigger={
          <div className="flex transition-all text-sm font-medium hover:bg-muted justify-center items-center gap-2 p-2 w-full">
            <div className="text-muted-foreground rounded-full flex items-center justify-center">
              <Plus className="size-4" />
            </div>
            Create workspace
          </div>
        }
        header="Create a workspace"
        content={<WorkspaceCreator />}
        description="Workspace give you the power to collaborate with others. You 
        can change your workspace privacy settings after creating workspace too."
      />
    </div>
  );
};

export default WorkspaceDropdown;
