// server.ts
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { setSocketIOInstance } from "@/lib/socket"; // Import the setter function

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "9002", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Remove the local ioInstance and use the lib/socket module instead
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

  // ✅ FIX: Store the io instance in the lib/socket module
  setSocketIOInstance(io);

  // Socket.IO connection handling
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Handle user joining their personal notification room
    socket.on("join-user-room", (userId: string) => {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined their notification room`);
    });

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

    // Handle notification acknowledgement
    socket.on("notification-ack", (data: { notificationId: string; userId: string }) => {
      console.log(`Notification ${data.notificationId} acknowledged by user ${data.userId}`);
      // You can update the notification status in your database here
    });

    // Handle notification read status
    socket.on("mark-notification-read", (data: { notificationId: string; userId: string }) => {
      console.log(`Notification ${data.notificationId} marked as read by user ${data.userId}`);
      // Update the notification as read in your database
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
    console.log(`> Socket.IO instance properly initialized for service use`);
  });
});
