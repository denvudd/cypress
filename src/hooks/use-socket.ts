import React from "react";
import { SocketContext } from "@/lib/providers/socket.provider";

export const useSocket = () => {
  const context = React.useContext(SocketContext);

  if (!context) {
    throw new Error("useSocket must be used within an SocketProvider");
  }

  return context;
};
