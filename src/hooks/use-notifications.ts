// src/hooks/use-notifications.ts
import { useEffect, useState, useCallback, useRef } from "react";
import { useSocket } from "./use-socket";
import { useAuth } from "@/app/providers/AuthProvider";

interface Notification {
  id: string;
  type: "email_received" | "action_item" | "meeting_summary" | "mention";
  title: string;
  message: string;
  meetingId?: string;
  meetingName?: string;
  actionItem?: {
    task: string;
    deadline: string;
  };
  read: boolean;
  createdAt: Date;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  requestNotificationPermission: () => Promise<boolean>;
  refreshNotifications: () => Promise<void>;
  clearError: () => void;
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const { socket, isConnected } = useSocket({ autoConnect: true });
  const isFetchingRef = useRef(false);
  const pageSize = 20;

  // Memoized fetch function with pagination support
  const fetchNotifications = useCallback(
    async (pageNum: number = 1, append: boolean = false) => {
      // ✅ FIX: Skip fetching if user is not authenticated
      if (!user?.userId) {
        console.log("Skipping notification fetch - user not authenticated");
        return;
      }

      if (isFetchingRef.current) return;

      try {
        isFetchingRef.current = true;
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams({
          page: pageNum.toString(),
          limit: pageSize.toString(),
        });

        const response = await fetch(`/api/notifications?${queryParams}`);

        if (!response.ok) {
          // ✅ FIX: Handle 401 gracefully
          if (response.status === 401) {
            console.log("User not authenticated for notifications");
            return;
          }
          throw new Error(`Failed to fetch notifications: ${response.status}`);
        }

        const data = await response.json();

        if (append) {
          setNotifications((prev) => [...prev, ...data.notifications]);
        } else {
          setNotifications(data.notifications);
        }

        setUnreadCount(data.unreadCount);
        setHasMore(data.notifications.length === pageSize);
        setPage(pageNum);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
        // ✅ FIX: Only set error for authenticated users
        if (user?.userId) {
          setError(err instanceof Error ? err.message : "Failed to fetch notifications");
        }
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    },
    [user?.userId]
  ); // ✅ FIX: Add user?.userId as dependency

  // Load more notifications for pagination
  const loadMore = useCallback(async () => {
    if (hasMore && !loading && user?.userId) {
      // ✅ FIX: Check authentication
      await fetchNotifications(page + 1, true);
    }
  }, [hasMore, loading, page, fetchNotifications, user?.userId]);

  // Initial fetch and socket authentication
  useEffect(() => {
    if (user?.userId) {
      fetchNotifications(1, false);
    } else {
      // ✅ FIX: Clear notifications when user logs out
      setNotifications([]);
      setUnreadCount(0);
      setError(null);
    }
  }, [user?.userId, fetchNotifications]);

  // Authenticate user for real-time notifications when connected
  useEffect(() => {
    if (isConnected && socket && user?.userId) {
      socket.emit("authenticate-user", user.userId);
    }
  }, [isConnected, socket, user?.userId]);

  // Enhanced real-time notification handling
  useEffect(() => {
    if (!socket || !user?.userId) return; // ✅ FIX: Check authentication

    const handleNewNotification = (notification: Notification) => {
      const notificationWithId = {
        ...notification,
        id: notification.id || generateTempId(),
        createdAt: new Date(notification.createdAt),
        read: false,
      };

      setNotifications((prev) => [notificationWithId, ...prev]);
      setUnreadCount((prev) => prev + 1);
      showBrowserNotification(notificationWithId);
      playNotificationSound();
    };

    const handleNotificationRead = (data: { notificationId: string }) => {
      setNotifications((prev) => prev.map((n) => (n.id === data.notificationId ? { ...n, read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    };

    const handleNotificationDeleted = (data: { notificationId: string }) => {
      const deletedNotification = notifications.find((n) => n.id === data.notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== data.notificationId));

      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    };

    const handleAllNotificationsRead = (data: { userId: string }) => {
      if (data.userId === user?.userId) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    };

    socket.on("new-notification", handleNewNotification);
    socket.on("notification-read", handleNotificationRead);
    socket.on("notification-deleted", handleNotificationDeleted);
    socket.on("all-notifications-read", handleAllNotificationsRead);

    return () => {
      socket.off("new-notification", handleNewNotification);
      socket.off("notification-read", handleNotificationRead);
      socket.off("notification-deleted", handleNotificationDeleted);
      socket.off("all-notifications-read", handleAllNotificationsRead);
    };
  }, [socket, notifications, user?.userId]);

  const generateTempId = (): string => {
    return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const markAsRead = async (notificationId: string): Promise<void> => {
    if (!notificationId || !user?.userId) return; // ✅ FIX: Check authentication

    if (notificationId.startsWith("temp-")) {
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      return;
    }

    try {
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));

      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Failed to mark as read: ${response.status}`);
      }

      if (socket) {
        socket.emit("mark-notification-read", { notificationId });
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      setError("Failed to mark notification as read");
      await fetchNotifications(1, false);
    }
  };

  const markAllAsRead = async (): Promise<void> => {
    if (notifications.length === 0 || unreadCount === 0 || !user?.userId) return; // ✅ FIX

    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);

      const response = await fetch("/api/notifications/read-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Failed to mark all as read: ${response.status}`);
      }

      if (socket && user?.userId) {
        socket.emit("mark-all-notifications-read", { userId: user.userId });
      }
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      setError("Failed to mark all notifications as read");
      await fetchNotifications(1, false);
    }
  };

  const deleteNotification = async (notificationId: string): Promise<void> => {
    if (!notificationId || !user?.userId) return; // ✅ FIX

    if (notificationId.startsWith("temp-")) {
      const deletedNotification = notifications.find((n) => n.id === notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      return;
    }

    try {
      const deletedNotification = notifications.find((n) => n.id === notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok && response.status !== 404) {
        throw new Error(`Failed to delete: ${response.status}`);
      }

      if (socket) {
        socket.emit("delete-notification", { notificationId });
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
      setError("Failed to delete notification");
      await fetchNotifications(1, false);
    }
  };

  const showBrowserNotification = (notification: Notification): void => {
    if (!("Notification" in window) || !user?.userId) return; // ✅ FIX

    if (Notification.permission === "granted") {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: "/logo.png",
        badge: "/logo.png",
        tag: notification.id,
        requireInteraction: notification.type === "action_item",
        data: { notificationId: notification.id, meetingId: notification.meetingId },
      });

      const autoCloseTime = notification.type === "action_item" ? 10000 : 5000;
      setTimeout(() => browserNotification.close(), autoCloseTime);

      browserNotification.onclick = () => {
        window.focus();
        browserNotification.close();
        if (!notification.read) markAsRead(notification.id);
        if (notification.meetingId) {
          window.location.href = `/meeting/${notification.meetingId}/join`;
        }
      };
    }
  };

  const playNotificationSound = (): void => {
    if (!user?.userId) return; // ✅ FIX

    try {
      const audio = new Audio("/notification-sound.mp3");
      audio.volume = 0.3;
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.log("Sound play prevented:", err);
          fallbackBeep();
        });
      }
    } catch (error) {
      console.log("Could not play notification sound, using fallback");
      fallbackBeep();
    }
  };

  const fallbackBeep = (): void => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 800;
      oscillator.type = "sine";
      gainNode.gain.value = 0.1;

      oscillator.start();
      setTimeout(() => oscillator.stop(), 100);
    } catch (error) {
      console.log("Could not play fallback sound");
    }
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      setError("Browser does not support notifications");
      return false;
    }

    try {
      if (Notification.permission === "default") {
        const permission = await Notification.requestPermission();
        return permission === "granted";
      }
      return Notification.permission === "granted";
    } catch (err) {
      console.error("Error requesting notification permission:", err);
      setError("Failed to request notification permission");
      return false;
    }
  };

  const clearError = (): void => setError(null);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    requestNotificationPermission,
    refreshNotifications: () => fetchNotifications(1, false),
    clearError,
    hasMore,
    loadMore,
  };
}
