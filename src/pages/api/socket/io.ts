import { NextApiResponseServerIO } from "@/types/global.type";
import { Server as NetServer } from "http";
import { Server as ServerIO } from "socket.io";
import { NextApiRequest } from "next";
import { SocketEditorEvent } from "@/types/editor.types";

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
      socket.on(SocketEditorEvent.CreateRoom, (fileId) => {
        socket.join(fileId);
      });

      socket.on(SocketEditorEvent.SendChanges, (deltas, fileId) => {
        socket
          .to(fileId)
          .emit(SocketEditorEvent.ReceiveChanges, deltas, fileId);
      });

      socket.on(SocketEditorEvent.SendCursorMove, (range, roomId, cursorId) => {
        socket
          .to(roomId)
          .emit(SocketEditorEvent.ReceiveCursorMove, range, roomId, cursorId);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
};

export default ioHandler;
