import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer;

export function setSocketIOInstance(ioInstance: SocketIOServer) {
  io = ioInstance;
}

export function getSocketIOInstance(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.IO instance not initialized');
  }
  return io;
}