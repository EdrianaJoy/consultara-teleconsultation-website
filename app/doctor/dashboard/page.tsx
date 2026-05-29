/**
 * Doctor Dashboard Page
 * 
 * Main dashboard for doctors featuring:
 * - Today's appointments overview
 * - Patient statistics
 * - Quick actions
 * - Recent activity
 * 
 * @module app/doctor/dashboard/page
 */

"use client";

import Link from "next/link";
import { 
  Users, 
  Calendar, 
  Clock, 
  Video,
  MessageSquare,
  TrendingUp,
  ChevronRight,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useAppData } from "@/lib/app-data-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Doctor Dashboard Component
 */
export default function DoctorDashboard() {
  const { user } = useAuth();
  const { appointments } = useAppData();

  // Get doctor's name
  const doctorName = user?.role === "doctor" 
    ? `Dr. ${(user as any).lastName || "User"}`
    : "Doctor";

  // Get today's date
  const today = new Date().toISOString().split("T")[0];

  // Filter appointments for this doctor
  const doctorAppointments = appointments.filter(apt => apt.doctorId === user?.id);
  
  // Today's appointments
  const todayAppointments = doctorAppointments.filter(apt => apt.date === today);
  const upcomingTodayAppointments = todayAppointments.filter(apt => apt.status === "confirmed");
  const completedTodayAppointments = todayAppointments.filter(apt => apt.status === "completed");

  // This week stats
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekAppointments = doctorAppointments.filter(apt => {
    const aptDate = new Date(apt.date);
    return aptDate >= weekStart;
  });

  // Stats
  const stats = [
    {
      label: "Today's Appointments",
      value: todayAppointments.length,
      icon: <Calendar className="w-5 h-5" />,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Patients This Week",
      value: weekAppointments.length,
      icon: <Users className="w-5 h-5" />,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Completed Today",
      value: completedTodayAppointments.length,
      icon: <CheckCircle className="w-5 h-5" />,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "Pending Review",
      value: doctorAppointments.filter(a => a.status === "pending").length,
      icon: <AlertCircle className="w-5 h-5" />,
      color: "bg-yellow-100 text-yellow-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground mb-1">Doctor Portal</p>
        <h1 className="text-2xl font-bold text-foreground">Welcome, {doctorName}!</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Review today&apos;s appointments, update your schedule, and manage patient care.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-card rounded-xl p-4 border border-border"
          >
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", stat.color)}>
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Today&apos;s Schedule</h2>
            <Link href="/doctor/schedule" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>

          {upcomingTodayAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No appointments scheduled for today.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingTodayAppointments.slice(0, 5).map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center gap-4 p-4 bg-muted rounded-xl"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    {apt.type === "video" ? (
                      <Video className="w-5 h-5 text-primary" />
                    ) : (
                      <MessageSquare className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">Patient Consultation</p>
                    <p className="text-sm text-muted-foreground">
                      {apt.time} • {apt.type === "video" ? "Video Call" : "Chat"} • {apt.reason || "General Consultation"}
                    </p>
                  </div>
                  <Link href={`/doctor/consultation/${apt.id}`}>
                    <Button size="sm">
                      {apt.type === "video" ? "Join Call" : "Open Chat"}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/doctor/schedule"
              className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">Manage Schedule</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Link>

            <Link
              href="/doctor/patients"
              className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">View Patients</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Link>

            <Link
              href="/doctor/messages"
              className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">Messages</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Link>

            <Link
              href="/doctor/consultations"
              className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">Consultation History</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Link>
          </div>
        </div>
      </div>

      {/* Weekly Overview */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">This Week&apos;s Overview</h2>
        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + index);
            const dateStr = date.toISOString().split("T")[0];
            const dayAppointments = doctorAppointments.filter(a => a.date === dateStr);
            const isToday = dateStr === today;

            return (
              <div
                key={day}
                className={cn(
                  "p-3 rounded-lg text-center",
                  isToday ? "bg-primary text-primary-foreground" : "bg-muted"
                )}
              >
                <p className={cn("text-xs", isToday ? "text-primary-foreground/70" : "text-muted-foreground")}>
                  {day}
                </p>
                <p className={cn("text-lg font-bold", isToday ? "text-primary-foreground" : "text-foreground")}>
                  {date.getDate()}
                </p>
                <p className={cn("text-xs", isToday ? "text-primary-foreground/70" : "text-muted-foreground")}>
                  {dayAppointments.length} apt
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
