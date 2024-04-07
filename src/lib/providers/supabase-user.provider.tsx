"use client";

import React from "react";
import { AuthUser } from "@supabase/supabase-js";
import { Subscription } from "@/types/supabase.types";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { getUserSubscriptionStatus } from "@/queries/subscription";
import { toast } from "sonner";

interface ISupabaseUserContext {
  user: AuthUser | null;
  subscription: Subscription | null;
}

export const SupabaseUserContext = React.createContext<ISupabaseUserContext>({
  user: null,
  subscription: null,
});

export const SupabaseUserProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const supabaseClient = createClientComponentClient();

  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [subscription, setSubscription] = React.useState<Subscription | null>(
    null
  );

  React.useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();

      if (user) {
        setUser(user);

        const { data, error } = await getUserSubscriptionStatus(user.id);

        if (error) {
          toast.error("Unexpected error", {
            description:
              "An unexpected error occurred. Please try again later.",
          });

          return undefined;
        }

        if (data) {
          setSubscription(data);
        }
      }
    };

    getUser();
  }, [supabaseClient]);

  return (
    <SupabaseUserContext.Provider value={{ user, subscription }}>
      {children}
    </SupabaseUserContext.Provider>
  );
};
