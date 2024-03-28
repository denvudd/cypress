import LandingHeader from "@/components/modules/landing/landing-header.module";
import React from "react";

const LandingLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <main className="h-full layout-scrollbar-obtrusive">
      <LandingHeader />
      {children}
    </main>
  );
};

export default LandingLayout;
