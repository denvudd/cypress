"use client";

import React from "react";
import { useSupabaseUser } from "@/hooks/user-supabase-user";
import SubscriptionModal from "@/components/global/subscription-modal.global";
import { ProductWirhPrice } from "@/types/supabase.types";

type SubscriptionModalContextType = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const SubscriptionModalContext =
  React.createContext<SubscriptionModalContextType>({
    isOpen: false,
    setIsOpen: () => {},
  });

interface SubscriptionModalProviderProps {
  children: React.ReactNode;
  products: ProductWirhPrice[];
}

export const SubscriptionModalProvider: React.FC<
  SubscriptionModalProviderProps
> = ({ children, products }) => {
  const { user } = useSupabaseUser();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <SubscriptionModalContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
      <SubscriptionModal products={products} />
    </SubscriptionModalContext.Provider>
  );
};
