import React from "react";

const AuthLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <div className="h-screen p-6 flex justify-center">{children}</div>;
};

export default AuthLayout;
