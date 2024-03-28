"use client";

import React from "react";

import { useAppState } from "@/hooks/use-app-state";

import SelectedWorkspace from "./selected-workspace.module";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Workspace } from "@/types/supabase.types";

interface WorkspaceDropdownProps {
  privateWorkspaces: Workspace[] | [];
  sharedWorkspaces: Workspace[] | [];
  collaboratingWorkspaces: Workspace[] | [];
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
        <DropdownMenuContent className="h-[190px] bg-popover/20 w-[228px] blured">
          <DropdownMenuLabel>Private</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-muted-foreground/20" />
          {privateWorkspaces.map((option: Workspace) => (
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
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default WorkspaceDropdown;
