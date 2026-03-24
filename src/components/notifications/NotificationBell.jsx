import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

const NotificationItem = ({ notification, onMarkRead, onDelete }) => {
  const typeColors = {
    event_reminder: "border-l-[#ff6b35]",
    event_update: "border-l-[#ff6b35]",
    new_event: "border-l-[#6BCBFF]",
    challenge: "border-l-purple-500",
    badge: "border-l-[#FFD700]",
    general: "border-l-gray-300"
  };

  return (
    <div className={`p-3 border-l-4 ${typeColors[notification.type]} bg-[var(--cy-bg-card)] hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-orange-50/50' : ''}`}>
      <div className="flex items-start justify-between gap-2 mb-1">
        <h4 className="font-semibold text-sm text-[var(--cy-text)]">{notification.title}</h4>
        <div className="flex gap-1">
          {!notification.read && (
            <button
              onClick={() => onMarkRead(notification.id)}
              className="text-[#ff6b35] hover:text-[#ff4500] p-1"
              title="Mark as read"
            >
              <Check className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={() => onDelete(notification.id)}
            className="text-[var(--cy-text-muted)] hover:text-red-500 p-1"
            title="Delete"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
      <p className="text-xs text-[var(--cy-text-muted)] mb-2">{notification.message}</p>
      <span className="text-xs text-[var(--cy-text-muted)]">
        {new Date(notification.created_date).toLocaleString()}
      </span>
    </div>
  );
};

export default function NotificationBell({ user }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Notification.filter({ user_email: user.email }, '-created_date', 50);
    },
    enabled: !!user,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId) => 
      base44.entities.Notification.update(notificationId, { read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId) => 
      base44.entities.Notification.delete(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const markAllAsRead = () => {
    notifications
      .filter(n => !n.read)
      .forEach(n => markAsReadMutation.mutate(n.id));
  };

  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative text-[#ff6b35] hover:text-[#ff6b35]">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#ff4500] text-[var(--cy-text)] text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-[var(--cy-text)]">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              variant="ghost"
              size="sm"
              className="text-xs text-[#ff6b35] hover:text-[#ff4500]"
            >
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={markAsReadMutation.mutate}
                  onDelete={deleteNotificationMutation.mutate}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="w-12 h-12 text-[var(--cy-text-secondary)] mb-3" />
              <p className="text-[var(--cy-text-muted)] text-sm">No notifications yet</p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}