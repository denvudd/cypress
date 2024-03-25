import React from "react";
import { AppStateContext } from "@/lib/providers/app-state.provider";

export const useAppState = () => {
  const context = React.useContext(AppStateContext);

  if (!context) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }

  return context;
};
