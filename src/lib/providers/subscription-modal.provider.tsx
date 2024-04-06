'use client';

import React from "react";
import { useSupabaseUser } from "@/hooks/user-supabase-user";
import SubscriptionModal from "@/components/global/subscription-modal.global";

type SubscriptionModalContextType = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const SubscriptionModalContext =
  React.createContext<SubscriptionModalContextType>({
    isOpen: false,
    setIsOpen: () => {},
  });

export const SubscriptionModalProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { user } = useSupabaseUser();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <SubscriptionModalContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
      <SubscriptionModal />
    </SubscriptionModalContext.Provider>
  );
};
