/**
 * Header Component
 * 
 * Top navigation header for authenticated users.
 * Features:
 * - Welcome message with user name
 * - Notification bell with badge count
 * - User profile avatar with dropdown
 * - Responsive design
 * 
 * @module components/header
 */

"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, User, Settings, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useAppData } from "@/lib/app-data-context";
import { cn } from "@/lib/utils";

/**
 * Header Props
 */
interface HeaderProps {
  title?: string;
}

/**
 * Main Header Component
 * 
 * Displays user information, notifications, and profile dropdown.
 */
export function Header({ title }: HeaderProps) {
  const { user, logout } = useAuth();
  const { notifications } = useAppData();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
  };

  // Get display name
  const displayName = user?.role === "patient" 
    ? (user as any).firstName || "User"
    : user?.role === "doctor" 
      ? `Dr. ${(user as any).lastName || "User"}`
      : "User";

  const profilePath = user?.role === "patient" ? "/patient/profile" : "/doctor/profile";

  return (
    <header className="h-16 bg-background border-b border-border px-4 lg:px-8 flex items-center justify-between">
      {/* Title / Welcome Message */}
      <div className="pl-12 lg:pl-0">
        <h1 className="text-xl lg:text-2xl font-bold text-foreground">
          {title || `Welcome, ${displayName}!`}
        </h1>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div ref={notificationsRef} className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 rounded-full hover:bg-muted transition-colors"
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
          >
            <Bell size={24} className="text-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-card rounded-lg shadow-lg border border-border z-50">
              <div className="p-3 border-b border-border">
                <h3 className="font-semibold text-foreground">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground text-center">
                    No notifications
                  </p>
                ) : (
                  notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-3 border-b border-border last:border-0 hover:bg-muted transition-colors",
                        !notification.read && "bg-primary/5"
                      )}
                    >
                      <p className="text-sm font-medium text-foreground">
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <Link
                href={`/${user?.role}/notifications`}
                className="block p-3 text-center text-sm text-primary hover:bg-muted transition-colors"
                onClick={() => setIsNotificationsOpen(false)}
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-muted transition-colors"
            aria-label="User menu"
          >
            <div className="w-10 h-10 rounded-full bg-accent overflow-hidden flex items-center justify-center">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={20} className="text-muted-foreground" />
              )}
            </div>
            <ChevronDown size={16} className="text-muted-foreground hidden sm:block" />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-card rounded-lg shadow-lg border border-border z-50">
              <div className="p-3 border-b border-border">
                <p className="font-medium text-foreground text-sm">{displayName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <div className="p-1">
                <Link
                  href={profilePath}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <User size={16} />
                  My Profile
                </Link>
                <Link
                  href={`/${user?.role}/settings`}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <Settings size={16} />
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  <LogOut size={16} />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
