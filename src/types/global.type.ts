import { Socket, Server as NetServer } from "net";
import { Server as SocketIOServer } from "socket.io";
import { NextApiResponse } from "next";

export enum Permissions {
  private = "Private",
  shared = "Shared",
}

export type PermissionsKey = keyof typeof Permissions;

export type DirectionType = "workspace" | "folder" | "file";

export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};
