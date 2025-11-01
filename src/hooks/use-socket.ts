// src/hooks/use-socket.ts
import { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";

interface UseSocketOptions {
  meetingId?: string;
  userName?: string;
  autoConnect?: boolean;
}

interface Transcript {
  name: string;
  transcript: string;
  createdAt: Date;
}

interface UserJoinedData {
  socketId: string;
  userName: string;
  timestamp: Date;
}

interface UserLeftData {
  socketId: string;
  userName: string;
  timestamp: Date;
}

interface StatusUpdateData {
  userName: string;
  status: string;
}

interface SocketEvents {
  "transcript-added": (transcript: Transcript) => void;
  "user-joined": (data: UserJoinedData) => void;
  "user-left": (data: UserLeftData) => void;
  "user-typing": (userName: string) => void;
  "status-update": (data: StatusUpdateData) => void;
}

export function useSocket(options: UseSocketOptions = {}) {
  const { meetingId, userName, autoConnect = true } = options;
  const socketRef = useRef<typeof Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    if (!autoConnect) return;

    // Initialize socket connection
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:9002";

    socketRef.current = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    const socket = socketRef.current;

    // Connection event handlers
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      setIsConnected(true);
      setIsReconnecting(false);

      // Auto-join meeting room if meetingId is provided
      if (meetingId && userName) {
        socket.emit("join-meeting", meetingId, userName);
      }
    });

    socket.on("disconnect", (reason: string) => {
      console.log("Socket disconnected:", reason);
      setIsConnected(false);
    });

    socket.on("reconnect_attempt", (attemptNumber: number) => {
      console.log(`Attempting to reconnect... (attempt ${attemptNumber})`);
      setIsReconnecting(true);
    });

    socket.on("reconnect", (attemptNumber: number) => {
      console.log(`Socket reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
      setIsReconnecting(false);

      // Rejoin meeting room after reconnection
      if (meetingId && userName) {
        socket.emit("join-meeting", meetingId, userName);
      }
    });

    socket.on("reconnect_error", (error: Error) => {
      console.error("Socket reconnection error:", error);
    });

    socket.on("connect_error", (error: Error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        if (meetingId && userName) {
          socketRef.current.emit("leave-meeting", meetingId, userName);
        }
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [meetingId, userName, autoConnect]);

  // Emit event
  const emit = <K extends keyof SocketEvents>(event: K, ...args: Parameters<SocketEvents[K]>) => {
    if (socketRef.current?.connected) {
      (socketRef.current.emit as any)(event, ...args);
    } else {
      console.warn("Socket not connected. Event not emitted:", event);
    }
  };

  // Listen to event
  const on = <K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]) => {
    if (socketRef.current) {
      (socketRef.current.on as any)(event, callback);

      // Return cleanup function
      return () => {
        socketRef.current?.off(event, callback as any);
      };
    }
    return () => {};
  };

  // Remove event listener
  const off = <K extends keyof SocketEvents>(event: K, callback?: SocketEvents[K]) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback as any);
    }
  };

  // Join a meeting room
  const joinMeeting = (meetingId: string, userName: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("join-meeting", meetingId, userName);
    }
  };

  // Leave a meeting room
  const leaveMeeting = (meetingId: string, userName: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("leave-meeting", meetingId, userName);
    }
  };

  // Send new transcript
  const sendTranscript = (meetingId: string, transcript: { name: string; transcript: string; createdAt: Date }) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("new-transcript", { meetingId, transcript });
    }
  };

  // Send typing indicator
  const sendTyping = (meetingId: string, userName: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("typing", { meetingId, userName });
    }
  };

  // Update participant status
  const updateStatus = (meetingId: string, userName: string, status: "online" | "recording" | "idle") => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("participant-status", { meetingId, userName, status });
    }
  };

  // Get socket ID
  const getSocketId = (): string | null => {
    return socketRef.current?.id || null;
  };

  // Manually disconnect
  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };

  // Manually connect
  const connect = () => {
    if (socketRef.current && !socketRef.current.connected) {
      socketRef.current.connect();
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    isReconnecting,
    emit,
    on,
    off,
    joinMeeting,
    leaveMeeting,
    sendTranscript,
    sendTyping,
    updateStatus,
    getSocketId,
    disconnect,
    connect,
  };
}

export type { Transcript, UserJoinedData, UserLeftData, StatusUpdateData };
