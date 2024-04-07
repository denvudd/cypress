import { SubscriptionModalProvider } from "@/lib/providers/subscription-modal.provider";
import { getProductsWithPrice } from "@/queries/product";
import React from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: any;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = async ({
  children,
  params,
}) => {
  const { data: products, error } = await getProductsWithPrice();

  return (
    <main className="flex overflow-hidden h-screen">
      <SubscriptionModalProvider products={products}>
        {children}
      </SubscriptionModalProvider>
    </main>
  );
};

export default DashboardLayout;
