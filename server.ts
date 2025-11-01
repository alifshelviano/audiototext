// server.ts
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "9002", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  // Initialize Socket.IO
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:9002",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  // Socket.IO connection handling
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Join meeting room
    socket.on("join-meeting", (meetingId: string, userName: string) => {
      socket.join(`meeting-${meetingId}`);
      console.log(`${userName} joined meeting ${meetingId}`);

      // Notify others in the room
      socket.to(`meeting-${meetingId}`).emit("user-joined", {
        socketId: socket.id,
        userName,
        timestamp: new Date(),
      });
    });

    // Handle new transcript
    socket.on(
      "new-transcript",
      (data: {
        meetingId: string;
        transcript: {
          name: string;
          transcript: string;
          createdAt: Date;
        };
      }) => {
        // Broadcast to all users in the meeting room
        io.to(`meeting-${data.meetingId}`).emit("transcript-added", data.transcript);
      }
    );

    // Handle typing indicator
    socket.on("typing", (data: { meetingId: string; userName: string }) => {
      socket.to(`meeting-${data.meetingId}`).emit("user-typing", data.userName);
    });

    // Handle participant status
    socket.on("participant-status", (data: { meetingId: string; userName: string; status: "online" | "recording" | "idle" }) => {
      io.to(`meeting-${data.meetingId}`).emit("status-update", data);
    });

    // Leave meeting room
    socket.on("leave-meeting", (meetingId: string, userName: string) => {
      socket.leave(`meeting-${meetingId}`);
      socket.to(`meeting-${meetingId}`).emit("user-left", {
        socketId: socket.id,
        userName,
        timestamp: new Date(),
      });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Socket.IO server running`);
  });
});
