import React from "react";

const LandingLayout: React.FC<React.PropsWithChildren> = ({children}) => {
  return <main className="h-full">{children}</main>;
};

export default LandingLayout;
