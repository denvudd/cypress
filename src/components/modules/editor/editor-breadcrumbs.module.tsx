"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useAppState } from "@/hooks/use-app-state";

interface EditorBreadcrumbsProps {}

const EditorBreadcrumbs: React.FC<EditorBreadcrumbsProps> = ({}) => {
  const pathname = usePathname();
  const {state: appState, workspaceId} = useAppState();

  const breadcrumbs = React.useMemo(() => {
    if (!pathname || !appState.workspaces.length || !workspaceId)
      return undefined;

    const segments = pathname
      .split("/")
      .filter((value) => value && value !== "dashboard");
    const workspaceDetails = appState.workspaces.find(
      (workspace) => workspace.id === workspaceId
    );
    const workspaceBreadcrumb = workspaceDetails
      ? `${workspaceDetails.iconId} ${workspaceDetails.title}`
      : "";

    if (segments.length === 1) {
      // if workspace
      return workspaceBreadcrumb;
    }

    const folderSegment = segments[1];
    const folderDetails = workspaceDetails?.folders.find(
      (folder) => folder.id === folderSegment
    );
    const folderBreadcrumb = folderDetails
      ? `/ ${folderDetails.iconId} ${folderDetails.title}`
      : "";

    if (segments.length === 2) {
      // if folder
      return `${workspaceBreadcrumb} ${folderBreadcrumb}`;
    }

    const fileSegment = segments[2];
    const fileDetails = folderDetails?.files.find(
      (file) => file.id === fileSegment
    );
    const fileBreadcrumb = fileDetails
      ? `/ ${fileDetails.iconId} ${fileDetails.title}`
      : "";

    // if file
    return `${workspaceBreadcrumb} ${folderBreadcrumb} ${fileBreadcrumb}`;
  }, [appState, pathname, workspaceId]);

  return <span>{breadcrumbs}</span>;
};

export default EditorBreadcrumbs;
