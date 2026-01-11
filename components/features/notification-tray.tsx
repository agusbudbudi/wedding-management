"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Info,
  Sparkles,
  Receipt,
  CheckCheck,
  Trash2,
  Clock,
  ExternalLink,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { supabaseNotificationService } from "@/lib/services/notification-service";
import { Notification, NotificationType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { createClient } from "@/lib/supabase/client";

export function NotificationTray() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const data = await supabaseNotificationService.getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    let channel: any;

    const setupSubscription = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      channel = supabase
        .channel(`notifications-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchNotifications();
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            console.log("Successfully subscribed to notifications");
          }
        });
    };

    setupSubscription();

    return () => {
      if (channel) createClient().removeChannel(channel);
    };
  }, []);

  const handleMarkAsRead = async (id: string, link?: string) => {
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      await supabaseNotificationService.markAsRead(id);

      if (link) {
        router.push(link);
      }
    } catch (error) {
      console.error("Failed to mark as read", error);
      fetchNotifications(); // Rollback
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Optimistic update
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);

      await supabaseNotificationService.markAllAsRead();
    } catch (error) {
      console.error("Failed to mark all as read", error);
      fetchNotifications(); // Rollback
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      // Optimistic update
      setNotifications((prev) => {
        const item = prev.find((n) => n.id === id);
        if (item && !item.is_read) setUnreadCount((c) => Math.max(0, c - 1));
        return prev.filter((n) => n.id !== id);
      });

      await supabaseNotificationService.deleteNotification(id);
    } catch (error) {
      console.error("Failed to delete notification", error);
      fetchNotifications(); // Rollback
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "info":
        return <Info className="w-3.5 h-3.5 text-blue-500" />;
      case "promo":
        return <Sparkles className="w-3.5 h-3.5 text-amber-500" />;
      case "transaction":
        return <Receipt className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  const getTypeStyle = (type: NotificationType) => {
    switch (type) {
      case "info":
        return "bg-blue-50 border-blue-100";
      case "promo":
        return "bg-amber-50 border-amber-100";
      case "transaction":
        return "bg-emerald-50 border-emerald-100";
      default:
        return "bg-gray-50 border-gray-100";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-primary relative"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 sm:w-96 p-0 rounded-2xl shadow-xl shadow-gray-200/50 border-gray-100 overflow-hidden"
      >
        <div className="p-4 bg-white border-b border-gray-50 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900">Notifications</h3>
            <p className="text-xs text-gray-500">
              You have {unreadCount} unread messages
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-primary hover:text-primary/80 hover:bg-primary/5 h-8 gap-1.5 text-xs font-semibold"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-sm text-gray-500">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-10 h-10 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">
                No notifications yet
              </h4>
              <p className="text-sm text-gray-500 max-w-[200px] mx-auto">
                We'll notify you when something important happens.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 transition-colors group relative cursor-pointer",
                    !notification.is_read
                      ? "bg-blue-50/30"
                      : "hover:bg-gray-50/50"
                  )}
                  onClick={() =>
                    handleMarkAsRead(
                      notification.id,
                      notification.link || undefined
                    )
                  }
                >
                  <div className="flex gap-3">
                    <div
                      className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center border shrink-0",
                        getTypeStyle(notification.type)
                      )}
                    >
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <h4
                          className={cn(
                            "text-sm font-bold truncate",
                            !notification.is_read
                              ? "text-gray-900"
                              : "text-gray-700"
                          )}
                        >
                          {notification.title}
                        </h4>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap pt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(
                            new Date(notification.created_at),
                            { addSuffix: true }
                          )}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <p
                          className={cn(
                            "text-xs leading-relaxed line-clamp-2 flex-1",
                            !notification.is_read
                              ? "text-gray-700"
                              : "text-gray-500"
                          )}
                        >
                          {notification.message}
                          {notification.link && (
                            <ExternalLink className="inline-block w-3 h-3 ml-1.5 opacity-50 text-primary group-hover:opacity-100 transition-opacity mb-0.5" />
                          )}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDelete(e, notification.id)}
                          className="w-7 h-7 text-gray-300 hover:text-red-500 hover:bg-red-50 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
