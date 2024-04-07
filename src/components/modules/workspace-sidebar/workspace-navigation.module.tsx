import React from "react";
import Link from "next/link";
import { twMerge } from "tailwind-merge";

import CypressHomeIcon from "@/components/ui/icons/home-icon";
import CypressTrashIcon from "@/components/ui/icons/trash-icon";
import Settings from "../settings/settings.module";
import { Subscription } from "@/types/supabase.types";
import Trash from "../trash/trash.module";

interface WorkspaceNavigationProps {
  workspaceId: string;
  subscription: Subscription | null;
  className?: string;
}

const WorkspaceNavigation: React.FC<WorkspaceNavigationProps> = ({
  workspaceId,
  subscription,
  className,
}) => {
  return (
    <nav className={twMerge("my-2", className)}>
      <ul className="flex flex-col gap-2">
        <li>
          <Link
            className="group/native flex items-center transition-all gap-2"
            href={`/dashboard/${workspaceId}`}
          >
            <CypressHomeIcon className="size-5" />
            <span className="text-sm font-medium">My Workspace</span>
          </Link>
        </li>

        <Settings subscription={subscription} />

        <Trash />
      </ul>
    </nav>
  );
};

export default WorkspaceNavigation;
