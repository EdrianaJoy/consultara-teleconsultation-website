/**
 * Doctor Calendar Page
 * 
 * Calendar view for managing appointments from the doctor's perspective.
 * 
 * @module app/doctor/calendar/page
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Video, 
  MessageSquare,
  User,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useAppData } from "@/lib/app-data-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Get calendar days for a given month
 */
function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay();
  
  const days: (number | null)[] = [];
  
  // Add empty cells for days before the first of the month
  for (let i = 0; i < startingDay; i++) {
    days.push(null);
  }
  
  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  
  return days;
}

/**
 * Doctor Calendar Page Component
 */
export default function DoctorCalendarPage() {
  const { user } = useAuth();
  const { appointments, updateAppointmentStatus } = useAppData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const calendarDays = getCalendarDays(year, month);

  // Get doctor's appointments
  const doctorAppointments = appointments.filter(a => a.doctorId === user?.id);

  // Get appointments for selected date
  const selectedDateAppointments = selectedDate
    ? doctorAppointments.filter(a => a.date === selectedDate)
    : [];

  // Check if a day has appointments
  const getDayAppointments = (day: number | null) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return doctorAppointments.filter(a => a.date === dateStr);
  };

  /**
   * Navigate to previous month
   */
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  /**
   * Navigate to next month
   */
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  /**
   * Handle date selection
   */
  const handleDateClick = (day: number | null) => {
    if (!day) return;
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(dateStr === selectedDate ? null : dateStr);
  };

  /**
   * Handle appointment approval
   */
  const handleApprove = (appointmentId: string) => {
    updateAppointmentStatus(appointmentId, "confirmed");
  };

  /**
   * Handle appointment rejection
   */
  const handleReject = (appointmentId: string) => {
    updateAppointmentStatus(appointmentId, "cancelled");
  };

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Stats
  const todayAppointments = doctorAppointments.filter(a => a.date === todayStr);
  const pendingCount = doctorAppointments.filter(a => a.status === "pending").length;
  const confirmedCount = doctorAppointments.filter(a => a.status === "confirmed").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Calendar</h1>
        <p className="text-muted-foreground">
          Manage your consultation schedule and appointments.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{todayAppointments.length}</p>
              <p className="text-sm text-muted-foreground">Today</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{confirmedCount}</p>
              <p className="text-sm text-muted-foreground">Confirmed</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-lg font-semibold text-foreground">{monthName}</h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Next month"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const dayAppointments = getDayAppointments(day);
              const dateStr = day 
                ? `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                : null;
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;
              const hasAppointments = dayAppointments.length > 0;
              const hasPending = dayAppointments.some(a => a.status === "pending");

              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(day)}
                  disabled={!day}
                  className={cn(
                    "aspect-square p-1 rounded-lg text-sm transition-colors relative",
                    day ? "hover:bg-muted" : "cursor-default",
                    isToday && "bg-primary/10",
                    isSelected && "bg-primary text-primary-foreground",
                    !day && "text-transparent"
                  )}
                >
                  <span className={cn(
                    "block",
                    isToday && !isSelected && "font-bold text-primary"
                  )}>
                    {day || ""}
                  </span>
                  {hasAppointments && (
                    <div className={cn(
                      "absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5"
                    )}>
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        isSelected ? "bg-primary-foreground" : hasPending ? "bg-yellow-500" : "bg-primary"
                      )} />
                      {dayAppointments.length > 1 && (
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          isSelected ? "bg-primary-foreground" : "bg-muted-foreground"
                        )} />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Appointments Sidebar */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold text-foreground mb-4">
            {selectedDate 
              ? `Appointments on ${new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric" })}`
              : "Today's Appointments"
            }
          </h3>

          <div className="space-y-4">
            {(selectedDate ? selectedDateAppointments : todayAppointments).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {selectedDate ? "No appointments on this day." : "No appointments today."}
              </p>
            ) : (
              (selectedDate ? selectedDateAppointments : todayAppointments)
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((apt) => (
                  <div
                    key={apt.id}
                    className={cn(
                      "p-4 rounded-lg border",
                      apt.status === "confirmed" ? "border-green-200 bg-green-50" :
                      apt.status === "pending" ? "border-yellow-200 bg-yellow-50" :
                      apt.status === "cancelled" ? "border-red-200 bg-red-50" :
                      apt.status === "completed" ? "border-blue-200 bg-blue-50" :
                      "border-border bg-muted"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent overflow-hidden flex-shrink-0 flex items-center justify-center">
                        <User size={16} className="text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">
                          Patient {apt.patientId.slice(-4)}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Clock size={12} />
                          <span>{apt.time}</span>
                          {apt.type === "video" ? <Video size={12} /> : <MessageSquare size={12} />}
                          <span className="capitalize">{apt.type}</span>
                        </div>
                        {apt.reason && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {apt.reason}
                          </p>
                        )}
                      </div>
                    </div>

                    {apt.status === "pending" && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => handleApprove(apt.id)}
                        >
                          <CheckCircle size={14} className="mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs"
                          onClick={() => handleReject(apt.id)}
                        >
                          <XCircle size={14} className="mr-1" />
                          Decline
                        </Button>
                      </div>
                    )}

                    {apt.status === "confirmed" && (
                      <div className="mt-3">
                        <Link href={`/doctor/consultation/${apt.id}`}>
                          <Button size="sm" className="w-full text-xs">
                            <Video size={14} className="mr-1" />
                            Join Session
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
