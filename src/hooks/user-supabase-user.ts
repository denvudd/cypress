import React from "react";
import { SupabaseUserContext } from "@/lib/providers/supabase-user.provider";

export const useSupabaseUser = () => {
  const context = React.useContext(SupabaseUserContext);

  if (!context) {
    throw new Error(
      "useSupabaseUser must be used within an SupabaseUserProvider"
    );
  }

  return context;
};
