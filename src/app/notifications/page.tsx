// src/app/notifications/page.tsx
"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useNotifications } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Mail, CheckCircle, Trash2, ExternalLink, CheckCheck, Filter, Clock, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  const [filter, setFilter] = useState<"all" | "unread">("all");

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "email_received":
        return <Mail className="h-5 w-5 text-blue-500" />;
      case "action_item":
        return <CheckCircle className="h-5 w-5 text-orange-500" />;
      case "meeting_summary":
        return <Bell className="h-5 w-5 text-green-500" />;
      case "mention":
        return <AlertCircle className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string, read: boolean) => {
    if (read) return "bg-white";

    switch (type) {
      case "email_received":
        return "bg-blue-50 border-l-4 border-l-blue-500";
      case "action_item":
        return "bg-orange-50 border-l-4 border-l-orange-500";
      case "meeting_summary":
        return "bg-green-50 border-l-4 border-l-green-500";
      case "mention":
        return "bg-purple-50 border-l-4 border-l-purple-500";
      default:
        return "bg-gray-50";
    }
  };

  // FIX: Generate stable keys for notifications
  const getNotificationKey = (notification: any, index: number) => {
    return notification.id || `${notification.type}-${notification.createdAt}-${index}`;
  };

  const filteredNotifications = filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const groupedByDate = filteredNotifications.reduce((acc, notification, index) => {
    const date = new Date(notification.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let key: string;
    if (date.toDateString() === today.toDateString()) {
      key = "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      key = "Yesterday";
    } else {
      key = date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }

    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push({ ...notification, _key: getNotificationKey(notification, index) });
    return acc;
  }, {} as Record<string, Array<any & { _key: string }>>);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Bell className="h-8 w-8 text-blue-600" />
                Notifications
              </h1>
              <p className="text-gray-600 mt-1">Stay updated with your meetings and action items</p>
            </div>

            {unreadCount > 0 && (
              <Button onClick={markAllAsRead} variant="outline" className="gap-2">
                <CheckCheck className="h-4 w-4" />
                Mark all as read
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Bell className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
                  <p className="text-sm text-gray-600">Total Notifications</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
                  <p className="text-sm text-gray-600">Unread</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{notifications.filter((n) => n.type === "action_item").length}</p>
                  <p className="text-sm text-gray-600">Action Items</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
            <TabsList className="w-full justify-start">
              <TabsTrigger value="all" className="gap-2">
                All
                <Badge variant="secondary">{notifications.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="unread" className="gap-2">
                Unread
                {unreadCount > 0 && <Badge variant="destructive">{unreadCount}</Badge>}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg border p-12 text-center">
            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{filter === "unread" ? "All caught up!" : "No notifications yet"}</h3>
            <p className="text-gray-600">{filter === "unread" ? "You've read all your notifications." : "When you receive notifications, they'll appear here."}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByDate).map(([date, dateNotifications]) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-700">{date}</h3>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <div className="space-y-3">
                  {dateNotifications.map((notification) => (
                    // FIX: Use the generated _key instead of notification.id
                    <div key={notification._key} className={`rounded-lg border p-4 transition-all hover:shadow-md ${getNotificationColor(notification.type, notification.read)}`}>
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-1">{notification.title}</h4>
                              <p className="text-sm text-gray-600">{notification.message}</p>
                            </div>
                            {!notification.read && (
                              <Badge variant="destructive" className="flex-shrink-0">
                                New
                              </Badge>
                            )}
                          </div>

                          {notification.meetingName && (
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {notification.meetingName}
                              </Badge>
                            </div>
                          )}

                          {notification.actionItem && (
                            <div className="bg-white border border-orange-200 rounded-lg p-3 mb-3">
                              <p className="text-sm font-medium text-gray-900 mb-1">📋 {notification.actionItem.task}</p>
                              <p className="text-xs text-orange-600">⏰ Due: {notification.actionItem.deadline}</p>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-2">
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                              })}
                            </span>

                            <div className="flex items-center gap-2">
                              {notification.meetingId && (
                                <Link href={`/meeting/${notification.meetingId}/join`}>
                                  <Button variant="outline" size="sm" className="gap-2">
                                    <ExternalLink className="h-4 w-4" />
                                    View Meeting
                                  </Button>
                                </Link>
                              )}

                              {!notification.read && (
                                <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)} className="gap-2">
                                  <CheckCheck className="h-4 w-4" />
                                  Mark as read
                                </Button>
                              )}

                              <Button variant="ghost" size="sm" onClick={() => deleteNotification(notification.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
