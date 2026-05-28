/**
 * Doctor Profile Page
 * 
 * Displays detailed information about a doctor including:
 * - Personal information and credentials
 * - Specialty and experience
 * - Availability schedule
 * - Reviews and ratings
 * - Booking functionality
 * 
 * @module app/patient/doctors/[id]/page
 */

"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Clock, 
  Calendar,
  Award,
  GraduationCap,
  Phone,
  MessageSquare,
  CheckCircle
} from "lucide-react";
import { doctors } from "@/lib/data";
import { useAuth } from "@/lib/auth-context";
import { useAppData } from "@/lib/app-data-context";
import { Button } from "@/components/ui/button";

/**
 * Generate available time slots for a given date
 */
function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = 9; hour <= 17; hour++) {
    const time = `${hour.toString().padStart(2, "0")}:00`;
    slots.push(time);
    if (hour < 17) {
      slots.push(`${hour.toString().padStart(2, "0")}:30`);
    }
  }
  return slots;
}

/**
 * Get next 7 days for booking
 */
function getNextDays(count: number): { date: string; dayName: string; dayNum: string }[] {
  const days = [];
  const today = new Date();
  
  for (let i = 0; i < count; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push({
      date: date.toISOString().split("T")[0],
      dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
      dayNum: date.getDate().toString(),
    });
  }
  
  return days;
}

/**
 * Doctor Profile Page Component
 */
export default function DoctorProfilePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { addAppointment, addNotification } = useAppData();
  
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [consultationType, setConsultationType] = useState<"video" | "chat">("video");
  const [reason, setReason] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Find doctor
  const doctor = doctors.find(d => d.id === resolvedParams.id);

  if (!doctor) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-foreground mb-4">Doctor Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The doctor you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/patient/search">
          <Button>Back to Search</Button>
        </Link>
      </div>
    );
  }

  const availableDays = getNextDays(7);
  const timeSlots = generateTimeSlots();

  /**
   * Handle appointment booking
   */
  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime || !user) return;

    setIsBooking(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create appointment
    const appointment = {
      id: `apt-${Date.now()}`,
      patientId: user.id,
      doctorId: doctor.id,
      date: selectedDate,
      time: selectedTime,
      type: consultationType,
      status: "confirmed" as const,
      reason: reason || "General Consultation",
      notes: "",
      createdAt: new Date().toISOString(),
    };

    addAppointment(appointment);

    // Add notification
    addNotification({
      id: `notif-${Date.now()}`,
      userId: user.id,
      type: "appointment",
      title: "Appointment Confirmed",
      message: `Your ${consultationType} consultation with ${doctor.name} is confirmed for ${selectedDate} at ${selectedTime}.`,
      read: false,
      createdAt: new Date().toISOString(),
    });

    setIsBooking(false);
    setBookingSuccess(true);
  };

  if (bookingSuccess) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-4">Booking Confirmed!</h1>
        <p className="text-muted-foreground mb-6">
          Your {consultationType} consultation with {doctor.name} has been scheduled for{" "}
          {new Date(selectedDate).toLocaleDateString("en-US", { 
            weekday: "long", 
            year: "numeric", 
            month: "long", 
            day: "numeric" 
          })} at {selectedTime}.
        </p>
        <div className="space-y-3">
          <Link href="/patient/calendar">
            <Button className="w-full">View My Appointments</Button>
          </Link>
          <Link href="/patient/dashboard">
            <Button variant="outline" className="w-full">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Search
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doctor Info Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex gap-6">
              <div className="w-32 h-32 rounded-xl bg-accent overflow-hidden flex-shrink-0">
                {doctor.avatar ? (
                  <img 
                    src={doctor.avatar} 
                    alt={doctor.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-4xl">
                    {doctor.name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{doctor.name}</h1>
                <p className="text-primary text-lg">{doctor.specialty}</p>
                
                <div className="flex items-center gap-1 mt-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-foreground">{doctor.rating}</span>
                  <span className="text-muted-foreground">
                    ({doctor.reviewCount} reviews)
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin size={16} />
                    {doctor.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    {doctor.experience} years experience
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-3">About</h2>
            <p className="text-muted-foreground">{doctor.bio}</p>
          </div>

          {/* Education & Credentials */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Education & Credentials</h2>
            <div className="space-y-4">
              {doctor.education.map((edu, index) => (
                <div key={index} className="flex items-start gap-3">
                  <GraduationCap className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">{edu.degree}</p>
                    <p className="text-sm text-muted-foreground">
                      {edu.institution}, {edu.year}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Languages & Specializations */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Specializations</h2>
            <div className="flex flex-wrap gap-2">
              {doctor.specializations.map((spec, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {spec}
                </span>
              ))}
            </div>

            <h2 className="text-lg font-semibold text-foreground mb-4 mt-6">Languages</h2>
            <div className="flex flex-wrap gap-2">
              {doctor.languages.map((lang, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Card */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl p-6 border border-border sticky top-4">
            <h2 className="text-lg font-semibold text-foreground mb-4">Book Appointment</h2>

            {/* Consultation Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Consultation Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setConsultationType("video")}
                  className={`p-3 rounded-lg border text-sm flex items-center justify-center gap-2 transition-colors ${
                    consultationType === "video"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border text-foreground hover:bg-muted"
                  }`}
                >
                  <Phone size={16} />
                  Video Call
                </button>
                <button
                  onClick={() => setConsultationType("chat")}
                  className={`p-3 rounded-lg border text-sm flex items-center justify-center gap-2 transition-colors ${
                    consultationType === "chat"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border text-foreground hover:bg-muted"
                  }`}
                >
                  <MessageSquare size={16} />
                  Chat
                </button>
              </div>
            </div>

            {/* Date Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Select Date
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {availableDays.map((day) => (
                  <button
                    key={day.date}
                    onClick={() => setSelectedDate(day.date)}
                    className={`flex-shrink-0 w-14 py-2 rounded-lg border text-center transition-colors ${
                      selectedDate === day.date
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    <div className="text-xs">{day.dayName}</div>
                    <div className="font-semibold">{day.dayNum}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Select Time
                </label>
                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-2 rounded-lg border text-sm transition-colors ${
                        selectedTime === time
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Reason for Visit */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Reason for Visit (Optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Briefly describe your symptoms or reason for consultation..."
                className="w-full p-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground resize-none h-20"
              />
            </div>

            {/* Price */}
            <div className="flex items-center justify-between py-3 border-t border-border mb-4">
              <span className="text-muted-foreground">Consultation Fee</span>
              <span className="text-xl font-bold text-foreground">
                ${doctor.consultationFee}
              </span>
            </div>

            {/* Book Button */}
            <Button
              onClick={handleBookAppointment}
              disabled={!selectedDate || !selectedTime || isBooking}
              className="w-full"
            >
              {isBooking ? "Booking..." : "Confirm Booking"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
