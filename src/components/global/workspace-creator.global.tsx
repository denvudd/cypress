"use client";

import React from "react";
import { User } from "@/types/supabase.types";

interface WorkspaceCreatorProps {}

const WorkspaceCreator: React.FC<WorkspaceCreatorProps> = ({}) => {
  const [permissions, setPermissions] = React.useState<string>("private");
  const [title, setTitle] = React.useState<string>("");
  const [collaborators, setCollaborators] = React.useState<User[]>([]);

  return <div>WorkspaceCreator</div>;
};

export default WorkspaceCreator;
