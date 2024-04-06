import React from "react";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { LogOut } from "lucide-react";

import { getAuthUser } from "@/queries/auth";

import LogoutButton from "@/components/global/logout-button.global";
import ModeToggle from "@/components/global/mode-toggle.global";
import CypressProfileIcon from "@/components/ui/icons/profile-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Subscription } from "@/types/supabase.types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { generateColorFromEmail } from "@/lib/utils";

interface UserPanelProps {
  subscription: Subscription | null;
}

const UserPanel: React.FC<UserPanelProps> = async ({ subscription }) => {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const response = await getAuthUser(user.id);

  let avatarPath;

  if (!response) return;

  if (!response.avatarUrl) {
    avatarPath = "";
  } else {
    avatarPath = supabase.storage
      .from("avatars")
      .getPublicUrl(response.avatarUrl)?.data.publicUrl;
  }

  const profile = {
    ...response,
    avatarUrl: avatarPath,
  };

  const userTruncatedEmail = user.email
    ?.split("#")[0]
    .substring(0, 2)
    .toUpperCase();

  return (
    <article className="hidden sm:flex border border-muted/50 bg-sidebar/80 blured-light dark:blured justify-between items-center p-2 rounded-lg">
      <aside className="flex justify-center items-center gap-2">
        <Avatar>
          <AvatarImage src={profile.avatarUrl} />
          <AvatarFallback
            className="text-white font-medium"
            style={{
              backgroundColor: generateColorFromEmail(
                userTruncatedEmail as string
              ),
            }}
          >
            {userTruncatedEmail?.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-muted-foreground text-sm font-medium">
            {subscription?.status === "active" ? "Pro Plan" : "Free Plan"}
          </span>
          <small className="w-[100px] overflow-hidden overflow-ellipsis">
            {profile.email}
          </small>
        </div>
      </aside>
      <div className="flex items-center justify-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <LogoutButton>
              <LogOut className="size-4" />
            </LogoutButton>
          </TooltipTrigger>
          <TooltipContent>Log out</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <ModeToggle />
          </TooltipTrigger>
          <TooltipContent>Switch theme</TooltipContent>
        </Tooltip>
      </div>
    </article>
  );
};

export default UserPanel;
