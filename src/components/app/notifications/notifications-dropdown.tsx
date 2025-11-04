"use client";

import { useState, useRef, useEffect } from "react";
import { useNotifications } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bell, Mail, CheckCircle, Trash2, ExternalLink, CheckCheck, Loader2, AlertCircle, Calendar, MessageSquare, X, Settings } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NotificationDropdownProps {
  className?: string;
}

export function NotificationDropdown({ className }: NotificationDropdownProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, requestNotificationPermission, loading, error, clearError } = useNotifications();

  const [permissionRequested, setPermissionRequested] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [markingReadIds, setMarkingReadIds] = useState<Set<string>>(new Set());

  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Auto-close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Clear error when dropdown opens
  useEffect(() => {
    if (isOpen && error) {
      clearError();
    }
  }, [isOpen, error, clearError]);

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermissionRequested(true);
    if (granted) console.log("Browser notifications enabled!");
  };

  const handleMarkAsRead = async (notificationId: string, event?: React.MouseEvent) => {
    event?.stopPropagation();
    setMarkingReadIds((prev) => new Set(prev).add(notificationId));
    try {
      await markAsRead(notificationId);
    } finally {
      setMarkingReadIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const handleDeleteNotification = async (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setDeletingIds((prev) => new Set(prev).add(notificationId));
    try {
      await deleteNotification(notificationId);
    } finally {
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    setIsMarkingAll(true);
    try {
      await markAllAsRead();
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    setIsOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    const iconClass = "h-4 w-4 flex-shrink-0";
    switch (type) {
      case "email_received":
        return <Mail className={cn(iconClass, "text-blue-500")} />;
      case "action_item":
        return <CheckCircle className={cn(iconClass, "text-orange-500")} />;
      case "meeting_summary":
        return <Calendar className={cn(iconClass, "text-green-500")} />;
      case "mention":
        return <MessageSquare className={cn(iconClass, "text-purple-500")} />;
      default:
        return <Bell className={cn(iconClass, "text-gray-500")} />;
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case "email_received":
        return "Email";
      case "action_item":
        return "Action Item";
      case "meeting_summary":
        return "Meeting";
      case "mention":
        return "Mention";
      default:
        return "Notification";
    }
  };

  const getNotificationKey = (notification: any, index: number) => {
    return notification.id || `${notification.type}-${notification.createdAt}-${index}`;
  };

  const recentNotifications = notifications.slice(0, 8);

  return (
    <TooltipProvider>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button ref={triggerRef} variant="ghost" size="icon" className={cn("relative transition-all duration-200 hover:scale-105", isOpen && "bg-accent text-accent-foreground", loading && "opacity-70", className)} disabled={loading}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Bell className="h-5 w-5" />}

            {unreadCount > 0 && (
              <Badge variant="destructive" className={cn("absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs min-w-5 transition-all", unreadCount > 9 && "w-6 min-w-6")}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>

        {/* Dropdown Content (responsive fix) */}
        <DropdownMenuContent
          ref={dropdownRef}
          align="end"
          sideOffset={8}
          className="transition-all duration-200 ease-in-out transform origin-top w-[90vw] sm:w-96 max-w-sm sm:max-w-[24rem] max-h-[80vh] overflow-hidden shadow-xl border rounded-xl"
        >
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between p-3 sm:p-5 border-b gap-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Bell className="h-5 w-5 text-blue-600 shrink-0" />
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">Notifications</h3>
              {unreadCount > 0 && (
                <Badge variant="default" className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm shrink-0">
                  {unreadCount} new
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} disabled={isMarkingAll || loading} className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600">
                  {isMarkingAll ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCheck className="h-3.5 w-3.5" />}
                </Button>
              )}

              <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                <Link href="/notifications/settings">
                  <Settings className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="px-3 sm:px-4 py-2 bg-red-50 border-b border-red-200 flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-red-800 flex-1">{error}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={clearError} className="h-6 w-6 p-0 hover:bg-red-100">
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Notification List */}
          <ScrollArea className="h-[60vh] sm:h-[400px] px-2 sm:px-3">
            {recentNotifications.length === 0 && !loading ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Bell className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-900 mb-1">No notifications yet</p>
                <p className="text-xs text-gray-500 max-w-[200px]">When you receive notifications, they'll appear here</p>
              </div>
            ) : (
              <div className="p-1 sm:p-2">
                {recentNotifications.map((notification, index) => {
                  const isDeleting = deletingIds.has(notification.id);
                  const isMarkingRead = markingReadIds.has(notification.id);
                  const isProcessing = isDeleting || isMarkingRead;

                  return (
                    <div
                      key={getNotificationKey(notification, index)}
                      className={cn(
                        "group relative rounded-lg p-2 sm:p-3 transition-all duration-200 cursor-pointer mb-2 border",
                        !notification.read ? "bg-blue-50 border-blue-200 shadow-sm" : "bg-white border-gray-200 hover:bg-gray-50",
                        isProcessing && "opacity-60 pointer-events-none"
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      {isProcessing && (
                        <div className="absolute inset-0 bg-white bg-opacity-70 rounded-lg flex items-center justify-center z-10">
                          <Loader2 className="h-4 w-4 animate-spin text-cyan-600" />
                        </div>
                      )}

                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>

                        <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900 line-clamp-1">{notification.title}</p>
                              <Badge variant="outline" className="text-xs font-normal px-1.5 py-0 h-4">
                                {getNotificationTypeLabel(notification.type)}
                              </Badge>
                            </div>
                            {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />}
                          </div>

                          <p className="text-xs sm:text-sm text-gray-600 break-words line-clamp-2">{notification.message}</p>

                          {notification.actionItem && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2">
                              <p className="text-xs font-medium text-orange-800 mb-1">📋 {notification.actionItem.task}</p>
                              <p className="text-xs text-orange-600">⏰ Due: {notification.actionItem.deadline}</p>
                            </div>
                          )}

                          <div className="flex flex-wrap items-center justify-between gap-1 sm:gap-2 pt-1">
                            <span className="text-[10px] sm:text-xs text-gray-500">{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>

                            <div className="flex items-center gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {notification.meetingId && (
                                <Button variant="ghost" size="sm" asChild className="h-6 w-6 p-0 hover:bg-blue-100" onClick={(e) => e.stopPropagation()}>
                                  <Link href={`/meeting/${notification.meetingId}/join`}>
                                    <ExternalLink className="h-3 w-3" />
                                  </Link>
                                </Button>
                              )}

                              {!notification.read && (
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-green-100 hover:text-green-600" onClick={(e) => handleMarkAsRead(notification.id, e)} disabled={isMarkingRead}>
                                  <CheckCheck className="h-3 w-3" />
                                </Button>
                              )}

                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600" onClick={(e) => handleDeleteNotification(notification.id, e)} disabled={isDeleting}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          {recentNotifications.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <div className="p-2 sm:p-3">
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/notifications" className="w-full text-center py-2 text-sm text-cyan-600 hover:text-cyan-700 font-medium flex items-center justify-center gap-2" onClick={() => setIsOpen(false)}>
                    View all notifications
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </DropdownMenuItem>

                {notifications.length > recentNotifications.length && (
                  <p className="text-xs text-gray-500 text-center mt-1">
                    Showing {recentNotifications.length} of {notifications.length} notifications
                  </p>
                )}
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
}
