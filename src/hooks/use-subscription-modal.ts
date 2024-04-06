import React from "react";
import { SubscriptionModalContext } from "@/lib/providers/subscription-modal.provider";

export const useSubscriptionModal = () => {
  const context = React.useContext(SubscriptionModalContext);

  if (!context) {
    throw new Error(
      "useSubscriptionModal must be used within an SubscriptionModalProvider"
    );
  }

  return context;
};
