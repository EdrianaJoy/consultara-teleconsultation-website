/**
 * Doctor Schedule Page
 * 
 * Allows doctors to manage their availability and view appointments.
 * 
 * @module app/doctor/schedule/page
 */

"use client";

import { useEffect, useState } from "react";
import { 
  Clock, 
  Plus, 
  Trash2, 
  Save,
  Calendar,
  Video,
  MessageSquare,
  CheckCircle
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useAppData } from "@/lib/app-data-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WeeklySchedule } from "@/lib/types";

/**
 * Time slot type
 */
interface TimeSlot {
  start: string;
  end: string;
}

/**
 * Default schedule template
 */
const defaultSchedule: WeeklySchedule = {
  monday: { isWorkingDay: true, slots: [{ startTime: "09:00", endTime: "17:00", isAvailable: true }] },
  tuesday: { isWorkingDay: true, slots: [{ startTime: "09:00", endTime: "17:00", isAvailable: true }] },
  wednesday: { isWorkingDay: true, slots: [{ startTime: "09:00", endTime: "17:00", isAvailable: true }] },
  thursday: { isWorkingDay: true, slots: [{ startTime: "09:00", endTime: "17:00", isAvailable: true }] },
  friday: { isWorkingDay: true, slots: [{ startTime: "09:00", endTime: "17:00", isAvailable: true }] },
  saturday: { isWorkingDay: false, slots: [] },
  sunday: { isWorkingDay: false, slots: [] },
};

/**
 * Doctor Schedule Page Component
 */
export default function DoctorSchedulePage() {
  const { user, doctorProfile, updateDoctorProfile } = useAuth();
  const { appointments, updateAppointmentStatus } = useAppData();
  const [schedule, setSchedule] = useState<WeeklySchedule>(doctorProfile?.availability || defaultSchedule);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    setSchedule(doctorProfile?.availability || defaultSchedule);
  }, [doctorProfile]);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // Get doctor's appointments
  const doctorAppointments = appointments.filter(apt => apt.doctorId === user?.id);
  const pendingAppointments = doctorAppointments.filter(apt => apt.status === "pending");

  const dayConfig: Array<{ key: keyof WeeklySchedule; label: string }> = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ];

  const toWeeklySchedule = (value: WeeklySchedule): WeeklySchedule => value;

  /**
   * Add time slot to a day
   */
  const addTimeSlot = (day: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day as keyof WeeklySchedule],
        isWorkingDay: true,
        slots: [
          ...prev[day as keyof WeeklySchedule].slots,
          { startTime: "09:00", endTime: "17:00", isAvailable: true },
        ],
      },
    }));
  };

  /**
   * Remove time slot from a day
   */
  const removeTimeSlot = (day: string, index: number) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day as keyof WeeklySchedule],
        slots: prev[day as keyof WeeklySchedule].slots.filter((_, i) => i !== index),
        isWorkingDay: prev[day as keyof WeeklySchedule].slots.length > 1 ? prev[day as keyof WeeklySchedule].isWorkingDay : false,
      },
    }));
  };

  /**
   * Update time slot
   */
  const updateTimeSlot = (day: string, index: number, field: "start" | "end", value: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day as keyof WeeklySchedule],
        slots: prev[day as keyof WeeklySchedule].slots.map((slot, i) =>
          i === index
            ? { ...slot, [field === "start" ? "startTime" : "endTime"]: value }
            : slot
        ),
      },
    }));
  };

  /**
   * Save schedule
   */
  const handleSaveSchedule = async () => {
    setIsSaving(true);

    try {
      if (updateDoctorProfile) {
        await updateDoctorProfile({ availability: schedule });
      }

      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    } finally {
      setIsSaving(false);
    }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">My Schedule</h1>
          <p className="text-muted-foreground">
            Set your availability and manage appointment requests.
          </p>
        </div>
        <Button onClick={handleSaveSchedule} disabled={isSaving}>
          {isSaving ? (
            "Saving..."
          ) : savedMessage ? (
            <>
              <CheckCircle size={18} className="mr-2" />
              Saved!
            </>
          ) : (
            <>
              <Save size={18} className="mr-2" />
              Save Schedule
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Schedule */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Weekly Availability</h2>
            
            <div className="space-y-4">
              {dayConfig.map(({ key, label }) => (
                <div key={key} className="border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-foreground">{label}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addTimeSlot(key)}
                    >
                      <Plus size={16} className="mr-1" />
                      Add Slot
                    </Button>
                  </div>
                  
                  {!schedule[key].isWorkingDay || schedule[key].slots.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Not available</p>
                  ) : (
                    <div className="space-y-2">
                      {schedule[key].slots.map((slot, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="flex items-center gap-2 flex-1">
                            <Clock size={16} className="text-muted-foreground" />
                            <input
                              type="time"
                              value={slot.startTime}
                              onChange={(e) => updateTimeSlot(key, index, "start", e.target.value)}
                              className="px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-sm"
                            />
                            <span className="text-muted-foreground">to</span>
                            <input
                              type="time"
                              value={slot.endTime}
                              onChange={(e) => updateTimeSlot(key, index, "end", e.target.value)}
                              className="px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-sm"
                            />
                          </div>
                          <button
                            onClick={() => removeTimeSlot(key, index)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label="Remove time slot"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pending Appointments */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Pending Requests
            {pendingAppointments.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                {pendingAppointments.length}
              </span>
            )}
          </h2>

          {pendingAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No pending appointment requests.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 bg-muted rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {apt.type === "video" ? (
                        <Video className="w-5 h-5 text-primary" />
                      ) : (
                        <MessageSquare className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm">
                        New {apt.type === "video" ? "Video" : "Chat"} Request
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {apt.date} at {apt.time}
                      </p>
                      {apt.reason && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Reason: {apt.reason}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => handleApprove(apt.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => handleReject(apt.id)}
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
