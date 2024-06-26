"use client";

import React from "react";

import { Progress } from "@/components/ui/progress";
import CypressDiamondIcon from "@/components/ui/icons/diamond-icon";

import { useAppState } from "@/hooks/use-app-state";
import { getUsagePercantage } from "@/lib/utils";
import { Subscription } from "@/types/supabase.types";

interface PlanUsageProps {
  foldersLength: number;
  subscription: Subscription | null;
}

const PlanUsage: React.FC<PlanUsageProps> = ({
  foldersLength,
  subscription,
}) => {
  const { workspaceId, state: appState } = useAppState();

  const [usagePercentage, setUsagePercentage] = React.useState<number>(
    getUsagePercantage(foldersLength)
  );

  React.useEffect(() => {
    const currentWorkspace = appState.workspaces.find(
      (workspace) => workspace.id === workspaceId
    );
    const currentFoldersLength = currentWorkspace?.folders.length;

    if (!currentFoldersLength) return undefined;

    setUsagePercentage(getUsagePercantage(currentFoldersLength));
  }, [appState, workspaceId]);

  return (
    subscription?.status !== "active" && (
      <article className="p-2">
        <div className="flex gap-2 text-muted-foreground mb-2 items-center">
          <div className="size-4">
            <CypressDiamondIcon />
          </div>
          <div className="flex justify-between w-full items-center">
            <div className="text-sm font-medium">Free Plan</div>
            <small>{usagePercentage.toFixed(0)}% / 100%</small>
          </div>
        </div>
        <Progress value={usagePercentage} className="h-1.5" />
      </article>
    )
  );
};

export default PlanUsage;
