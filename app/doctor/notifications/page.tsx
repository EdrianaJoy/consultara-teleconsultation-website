/**
 * Doctor Notifications Page
 * 
 * Displays all notifications for the doctor.
 * 
 * @module app/doctor/notifications/page
 */

"use client";

import { Bell, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useAppData } from "@/lib/app-data-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function DoctorNotificationsPage() {
  const { user } = useAuth();
  const { notifications, markAllNotificationsAsRead, markNotificationAsRead } = useAppData();

  const userNotifications = notifications.filter(notification => notification.userId === user?.id);
  const unreadCount = userNotifications.filter(notification => !notification.isRead && !notification.read).length;

  const handleMarkAllRead = () => {
    if (!user?.id) return;
    markAllNotificationsAsRead(user.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Notifications</h1>
          <p className="text-muted-foreground">Review updates about your patients and schedule.</p>
        </div>
        <Button
          variant="outline"
          onClick={handleMarkAllRead}
          disabled={userNotifications.length === 0 || unreadCount === 0}
        >
          Mark all as read
        </Button>
      </div>

      {userNotifications.length === 0 ? (
        <div className="bg-card rounded-xl p-10 border border-border text-center">
          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No notifications yet</h3>
          <p className="text-muted-foreground">We will notify you when something needs your attention.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {userNotifications.map(notification => (
            <button
              key={notification.id}
              onClick={() => markNotificationAsRead(notification.id)}
              className={cn(
                "w-full text-left rounded-xl border border-border p-4 transition-colors",
                notification.isRead || notification.read ? "bg-card" : "bg-primary/5"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-foreground">{notification.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(notification.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                {(notification.isRead || notification.read) && (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
