import { SubscriptionModalProvider } from "@/lib/providers/subscription-modal.provider";
import React from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: any;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  params,
}) => {
  return (
    <main className="flex overflow-hidden h-screen">
      <SubscriptionModalProvider>{children}</SubscriptionModalProvider>
    </main>
  );
};

export default DashboardLayout;
