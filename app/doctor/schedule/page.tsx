/**
 * Doctor Schedule Page
 * 
 * Allows doctors to manage their availability and view appointments.
 * 
 * @module app/doctor/schedule/page
 */

"use client";

import { useState } from "react";
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
const defaultSchedule: Record<string, TimeSlot[]> = {
  Monday: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "17:00" }],
  Tuesday: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "17:00" }],
  Wednesday: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "17:00" }],
  Thursday: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "17:00" }],
  Friday: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "17:00" }],
  Saturday: [],
  Sunday: [],
};

/**
 * Doctor Schedule Page Component
 */
export default function DoctorSchedulePage() {
  const { user } = useAuth();
  const { appointments, updateAppointmentStatus } = useAppData();
  const [schedule, setSchedule] = useState(defaultSchedule);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // Get doctor's appointments
  const doctorAppointments = appointments.filter(apt => apt.doctorId === user?.id);
  const pendingAppointments = doctorAppointments.filter(apt => apt.status === "pending");

  /**
   * Add time slot to a day
   */
  const addTimeSlot = (day: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: [...prev[day], { start: "09:00", end: "17:00" }],
    }));
  };

  /**
   * Remove time slot from a day
   */
  const removeTimeSlot = (day: string, index: number) => {
    setSchedule(prev => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index),
    }));
  };

  /**
   * Update time slot
   */
  const updateTimeSlot = (day: string, index: number, field: "start" | "end", value: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: prev[day].map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      ),
    }));
  };

  /**
   * Save schedule
   */
  const handleSaveSchedule = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
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
              {days.map((day) => (
                <div key={day} className="border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-foreground">{day}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addTimeSlot(day)}
                    >
                      <Plus size={16} className="mr-1" />
                      Add Slot
                    </Button>
                  </div>
                  
                  {schedule[day].length === 0 ? (
                    <p className="text-sm text-muted-foreground">Not available</p>
                  ) : (
                    <div className="space-y-2">
                      {schedule[day].map((slot, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="flex items-center gap-2 flex-1">
                            <Clock size={16} className="text-muted-foreground" />
                            <input
                              type="time"
                              value={slot.start}
                              onChange={(e) => updateTimeSlot(day, index, "start", e.target.value)}
                              className="px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-sm"
                            />
                            <span className="text-muted-foreground">to</span>
                            <input
                              type="time"
                              value={slot.end}
                              onChange={(e) => updateTimeSlot(day, index, "end", e.target.value)}
                              className="px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-sm"
                            />
                          </div>
                          <button
                            onClick={() => removeTimeSlot(day, index)}
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
