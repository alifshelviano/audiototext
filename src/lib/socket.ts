// src/lib/socket.ts
import { Server as SocketIOServer } from "socket.io";

let io: SocketIOServer | null = null;

export function setSocketIOInstance(ioInstance: SocketIOServer) {
  io = ioInstance;
  console.log("✅ Socket.IO instance set successfully");
}

export function getSocketIOInstance(): SocketIOServer {
  if (!io) {
    throw new Error("Socket.IO instance not initialized. Make sure server is running.");
  }
  return io;
}

// ✅ NEW: Safe getter that returns null instead of throwing
export function getSocketIOInstanceSafe(): SocketIOServer | null {
  return io;
}

// ✅ NEW: Check if Socket.IO is initialized
export function isSocketIOInitialized(): boolean {
  return io !== null;
}
