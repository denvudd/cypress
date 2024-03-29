"use client";

import React from "react";

import { useAppState } from "@/hooks/use-app-state";

import SelectedWorkspace from "./selected-workspace.module";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Workspace } from "@/types/supabase.types";
import { CaretSortIcon } from "@radix-ui/react-icons";
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
  };

  return (
    <div className="relative inline-block text-left w-full">
      <DropdownMenu>
        <DropdownMenuTrigger className="text-left focus-visible:border-none select-none outline-none w-full flex items-center justify-between pr-1.5">
          {selectedOption && <SelectedWorkspace workspace={selectedOption} />}
          <CaretSortIcon className="size-4 text-muted-foreground flex-shrink-0" />
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
    </div>
  );
};

export default WorkspaceDropdown;
