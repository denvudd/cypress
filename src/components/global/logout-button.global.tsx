"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import { Button, ButtonProps } from "../ui/button";
import { useAppState } from "@/hooks/use-app-state";
import { useSupabaseUser } from "@/hooks/user-supabase-user";

const LogoutButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => {
    const router = useRouter();
    const supabaseClient = createClientComponentClient();
    const { user } = useSupabaseUser();
    const { dispatch } = useAppState();

    const logout = async () => {
      await supabaseClient.auth.signOut();
      router.refresh();
      dispatch({ type: "SET_WORKSPACES", payload: { workspaces: [] } });
    };

    return (
      <Button
        variant="outline"
        size="icon"
        className="size-8"
        onClick={logout}
        {...props}
        ref={ref}
      >
        {children}
      </Button>
    );
  }
);

LogoutButton.displayName = "LogoutButton";

export default LogoutButton;
