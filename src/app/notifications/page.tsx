// src/app/notifications/page.tsx
"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useNotifications } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Mail, CheckCircle, Trash2, ExternalLink, CheckCheck, Clock, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const getNotificationIcon = (type: string) => {
    const iconClass = "h-4 w-4 sm:h-5 sm:w-5";
    switch (type) {
      case "email_received":
        return <Mail className={`${iconClass} text-blue-500`} />;
      case "action_item":
        return <CheckCircle className={`${iconClass} text-orange-500`} />;
      case "meeting_summary":
        return <Bell className={`${iconClass} text-green-500`} />;
      case "mention":
        return <AlertCircle className={`${iconClass} text-purple-500`} />;
      default:
        return <Bell className={`${iconClass} text-gray-500`} />;
    }
  };

  const getNotificationColor = (type: string, read: boolean) => {
    if (read) return "bg-white border-l-4 border-l-transparent";
    const colors = {
      email_received: "bg-blue-50 border-l-blue-500",
      action_item: "bg-orange-50 border-l-orange-500",
      meeting_summary: "bg-green-50 border-l-green-500",
      mention: "bg-purple-50 border-l-purple-500",
      default: "bg-gray-50 border-l-gray-400",
    };
    return `border-l-4 ${colors[type as keyof typeof colors] || colors.default}`;
  };

  const getNotificationKey = (n: any, i: number) => n.id || `${n.type}-${n.createdAt}-${i}`;

  const filteredNotifications = filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const groupedByDate = filteredNotifications.reduce((acc, n, i) => {
    const date = new Date(n.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let key: string;
    if (date.toDateString() === today.toDateString()) key = "Today";
    else if (date.toDateString() === yesterday.toDateString()) key = "Yesterday";
    else {
      key = date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }

    if (!acc[key]) acc[key] = [];
    acc[key].push({ ...n, _key: getNotificationKey(n, i) });
    return acc;
  }, {} as Record<string, Array<any & { _key: string }>>);

  return (
    <DashboardLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                <Bell className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600" />
                Notifications
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Stay updated with your meetings and action items</p>
            </div>

            {unreadCount > 0 && (
              <Button onClick={markAllAsRead} variant="outline" size="sm" className="gap-1.5">
                <CheckCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Mark all as read</span>
                <span className="sm:hidden">Mark all</span>
              </Button>
            )}
          </div>

          {/* Stats - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5">
            {[
              { icon: Bell, color: "blue", label: "Total", value: notifications.length },
              { icon: AlertCircle, color: "orange", label: "Unread", value: unreadCount },
              { icon: CheckCircle, color: "green", label: "Action Items", value: notifications.filter((n) => n.type === "action_item").length },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-lg p-3 sm:p-4 border shadow-sm">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                    <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 text-${stat.color}-600`} />
                  </div>
                  <div>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs sm:text-sm text-gray-600">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filter Tabs - Scrollable on Mobile */}
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
            <TabsList className="w-full h-auto p-1 flex justify-start overflow-x-auto scrollbar-hide bg-gray-100">
              <TabsTrigger value="all" className="flex-1 min-w-fit gap-1.5 px-3 py-1.5 text-xs sm:text-sm">
                All
                <Badge variant="secondary" className="text-xs">
                  {notifications.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex-1 min-w-fit gap-1.5 px-3 py-1.5 text-xs sm:text-sm">
                Unread
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg border p-8 sm:p-12 text-center">
            <Bell className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{filter === "unread" ? "All caught up!" : "No notifications yet"}</h3>
            <p className="text-sm text-gray-600">{filter === "unread" ? "You've read all your notifications." : "When you receive notifications, they'll appear here."}</p>
          </div>
        ) : (
          <div className="space-y-5 sm:space-y-6">
            {Object.entries(groupedByDate).map(([date, notifs]) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-700">{date}</h3>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <div className="space-y-3">
                  {notifs.map((n) => (
                    <div key={n._key} className={`rounded-lg border p-3 sm:p-4 transition-all hover:shadow-md ${getNotificationColor(n.type, n.read)}`}>
                      <div className="flex gap-3 sm:gap-4">
                        <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(n.type)}</div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-1.5">
                            <h4 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2">{n.title}</h4>
                            {!n.read && (
                              <Badge variant="destructive" className="text-xs h-5">
                                New
                              </Badge>
                            )}
                          </div>

                          <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">{n.message}</p>

                          {n.meetingName && (
                            <Badge variant="outline" className="text-xs mb-2 w-fit">
                              {n.meetingName}
                            </Badge>
                          )}

                          {n.actionItem && (
                            <div className="bg-orange-50 border border-orange-300 rounded-lg p-2.5 mb-2 text-xs">
                              <p className="font-medium text-gray-900 mb-0.5">Task: {n.actionItem.task}</p>
                              <p className="text-orange-700">Due: {n.actionItem.deadline}</p>
                            </div>
                          )}

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-gray-500">
                            <span>{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</span>

                            <div className="flex gap-1.5">
                              {n.meetingId && (
                                <Link href={`/meeting/${n.meetingId}/join`}>
                                  <Button variant="outline" size="sm" className="h-7 px-2 text-xs gap-1">
                                    <ExternalLink className="h-3 w-3" />
                                    <span className="hidden sm:inline">View</span>
                                  </Button>
                                </Link>
                              )}

                              {!n.read && (
                                <Button variant="ghost" size="sm" onClick={() => markAsRead(n.id)} className="h-7 px-2 text-xs gap-1">
                                  <CheckCheck className="h-3 w-3" />
                                  <span className="hidden sm:inline">Read</span>
                                </Button>
                              )}

                              <Button variant="ghost" size="sm" onClick={() => deleteNotification(n.id)} className="h-7 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="h-3 w-3" />
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
