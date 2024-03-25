import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

import { getWorkspaceByUserId } from "@/queries/workspace";

import DashboardSetup from "@/components/modules/dashboard-setup.module";
import { getUserSubscriptionStatus } from "@/queries/subscription";

interface DashboardPageProps {}

const DashboardPage: React.FC<DashboardPageProps> = async ({}) => {
  const supabaseClient = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (!user) return null;

  const workspace = await getWorkspaceByUserId(user.id);

  const { data: subscription, error: subscriptionError } =
    await getUserSubscriptionStatus(user.id);

  if (subscriptionError) return null;

  if (!workspace) {
    return (
      <div className="bg-background h-screen w-screen flex justify-center items-center">
        <DashboardSetup user={user} subscription={subscription} />
      </div>
    );
  }

  redirect(`/dashboard/${workspace.id}`);

  return <div>DashboardPage</div>;
};

export default DashboardPage;
