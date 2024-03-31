"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import { cn } from "@/lib/utils";
import { Workspace } from "@/types/supabase.types";

interface SelectedWorkspaceProps {
  workspace: Workspace;
  onClick?: (option: Workspace) => void;
  className?: string;
}

const SelectedWorkspace: React.FC<SelectedWorkspaceProps> = ({
  onClick,
  workspace,
  className,
}) => {
  const supabaseClient = createClientComponentClient();
  const [workspaceLogo, setWorkspaceLogo] =
    React.useState<string>("/cypresslogo.svg");

  React.useEffect(() => {
    if (workspace.logo) {
      const path = supabaseClient.storage
        .from("workspace-logos")
        .getPublicUrl(workspace.logo)?.data.publicUrl;

      setWorkspaceLogo(path);
    }
  }, [workspace]);

  return (
    <Link
      href={`/dashboard/${workspace.id}`}
      onClick={() => onClick && onClick(workspace)}
      className={cn(
        "flex rounded-md hover:bg-muted-foreground/10 transition-all flex-row p-1 text-sm font-medium gap-2 cursor-pointer items-center my-2",
        className
      )}
    >
      <Image
        src={workspaceLogo}
        alt="Workspace Logo"
        width={20}
        height={20}
        className="object-fit object-center"
      />
      <div className="flex flex-col">
        <p className="w-[170px] overflow-hidden overflow-ellipsis whitespace-nowrap">
          {workspace.title}
        </p>
      </div>
    </Link>
  );
};

export default SelectedWorkspace;
