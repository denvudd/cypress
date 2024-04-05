import { NextApiResponseServerIO } from "@/types/global.type";
import { Server as NetServer } from "http";
import { Server as ServerIO } from "socket.io";
import { NextApiRequest } from "next";

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    const path = "/api/socket/io";
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path,
      addTrailingSlash: false,
    });

    io.on("connection", (socket) => {
      socket.on("create-room", (fileId) => {
        socket.join(fileId);
      });

      socket.on("send-changes", (deltas, fileId) => {
        console.log("Socket: Change");
        socket.to(fileId).emit("receive-changes", deltas, fileId);
      });

      socket.on("send-cursor-move", (range, roomId, cursorId) => {
        socket.to(roomId).emit("receive-cursor-move", range, roomId, cursorId);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
};

export default ioHandler;
