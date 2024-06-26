"use client";

import React from "react";
import { MOBILE_SIDEBAR_NAVIGATION } from "./config";
import { cn } from "@/lib/utils";

interface WorkspaceMobileSidebarProps {
  children: React.ReactNode;
}

const WorkspaceMobileSidebar: React.FC<WorkspaceMobileSidebarProps> = ({
  children,
}) => {
  const [selectedNav, setSelectedNav] = React.useState<string>("");

  return (
    <>
      {selectedNav === "sidebar" && <>{children}</>}
      <nav className="bg-popover/20 blured-light dark:blured border border-popover-foreground/10 sm:hidden fixed z-50 bottom-0 right-0 left-0">
        <ul className="flex justify-between items-center px-4 py-2">
          {MOBILE_SIDEBAR_NAVIGATION.map((navItem) => (
            <li
              className="flex items-center flex-col justify-center"
              key={navItem.id}
              onClick={() => setSelectedNav(navItem.id)}
            >
              <navItem.Icon />
              <small
                className={cn("font-medium", {
                  "text-muted-foreground": selectedNav !== navItem.id,
                })}
              >
                {navItem.title}
              </small>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default WorkspaceMobileSidebar;
