import React from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: any;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  params,
}) => {
  return <main className="flex overflow-hidden h-screen">{children}</main>;
};

export default DashboardLayout;
