/**
 * Patient Calendar Page
 * 
 * Calendar view for managing appointments.
 * 
 * @module app/patient/calendar/page
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Video, 
  MessageSquare,
  MapPin,
  Stethoscope,
  Plus
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useAppData } from "@/lib/app-data-context";
import { doctors } from "@/lib/data";
import type { DoctorProfile } from "@/lib/types";
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
 * Patient Calendar Page Component
 */
export default function CalendarPage() {
  const { user } = useAuth();
  const { appointments, cancelAppointment } = useAppData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [doctorCatalog, setDoctorCatalog] = useState<DoctorProfile[]>(doctors);

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const response = await fetch("/api/doctors", { cache: "no-store" });
        if (!response.ok) return;
        const payload = await response.json() as { doctors?: DoctorProfile[] };
        if (payload.doctors && payload.doctors.length > 0) {
          setDoctorCatalog(payload.doctors);
        }
      } catch (error) {
        console.error("Failed to load doctors:", error);
      }
    };

    void loadDoctors();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const calendarDays = getCalendarDays(year, month);

  // Get patient appointments
  const patientAppointments = appointments.filter(a => a.patientId === user?.id);

  // Get appointments for selected date
  const selectedDateAppointments = selectedDate
    ? patientAppointments.filter(a => a.date === selectedDate)
    : [];

  // Check if a day has appointments
  const getDayAppointments = (day: number | null) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return patientAppointments.filter(a => a.date === dateStr);
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
   * Handle appointment cancellation
   */
  const handleCancel = (appointmentId: string) => {
    if (confirm("Are you sure you want to cancel this appointment?")) {
      cancelAppointment(appointmentId);
    }
  };

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Calendar</h1>
          <p className="text-muted-foreground">
            View and manage your upcoming appointments.
          </p>
        </div>
        <Link href="/patient/search">
          <Button>
            <Plus size={18} className="mr-2" />
            Book Appointment
          </Button>
        </Link>
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
                      "absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full",
                      isSelected ? "bg-primary-foreground" : "bg-primary"
                    )} />
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
              : "Upcoming Appointments"
            }
          </h3>

          <div className="space-y-4">
            {(selectedDate ? selectedDateAppointments : patientAppointments.filter(a => a.status !== "cancelled").slice(0, 5)).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {selectedDate ? "No appointments on this day." : "No upcoming appointments."}
              </p>
            ) : (
              (selectedDate ? selectedDateAppointments : patientAppointments.filter(a => a.status !== "cancelled").slice(0, 5)).map((apt) => {
                const doctor = doctorCatalog.find(d => d.id === apt.doctorId);
                const doctorName = doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : "Doctor";
                return (
                  <div
                    key={apt.id}
                    className={cn(
                      "p-4 rounded-lg border",
                      apt.status === "confirmed" ? "border-green-200 bg-green-50" :
                      apt.status === "pending" ? "border-yellow-200 bg-yellow-50" :
                      apt.status === "cancelled" ? "border-red-200 bg-red-50" :
                      "border-border bg-muted"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent overflow-hidden shrink-0">
                        {doctor?.avatar ? (
                          <img 
                            src={doctor.avatar} 
                            alt={doctorName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Stethoscope size={16} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">
                          {doctorName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {doctor?.specialization}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Clock size={12} />
                          <span>{apt.date} at {apt.timeSlot?.startTime || "TBD"}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          {apt.consultationType === "video" ? <Video size={12} /> : <MessageSquare size={12} />}
                          <span className="capitalize">{apt.consultationType} Consultation</span>
                        </div>
                      </div>
                    </div>
                    {apt.status === "confirmed" && (
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        <Link href={`/patient/consultation/${apt.id}`} className="col-span-1">
                          <Button size="sm" className="w-full text-xs">
                            Join
                          </Button>
                        </Link>
                        <Link href={`/patient/doctors/${apt.doctorId}`} className="col-span-1">
                          <Button size="sm" variant="outline" className="w-full text-xs">
                            Reschedule
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => handleCancel(apt.id)}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
