/**
 * Doctor Profile Page
 * 
 * Displays detailed information about a doctor including:
 * - Personal information and credentials
 * - Specialty and experience
 * - Availability schedule
 * - Reviews and ratings
 * - Booking functionality with payment options
 * 
 * @module app/patient/doctors/[id]/page
 */

"use client";

import { useEffect, useState, use } from "react";
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
  CheckCircle,
  Shield,
  CreditCard,
  Wallet,
  Building2,
  Languages
} from "lucide-react";
import { doctors, departments } from "@/lib/data";
import { useAuth } from "@/lib/auth-context";
import { useAppData } from "@/lib/app-data-context";
import { Button } from "@/components/ui/button";
import { DoctorProfile, WeeklySchedule } from "@/lib/types";

type AvailabilitySlot = { time: string; endTime: string; isDisabled: boolean };

const weekdayKeys = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

/**
 * Get next 7 days for booking
 */
function getNextDays(count: number, schedule: WeeklySchedule): { date: string; dayName: string; dayNum: string; isToday: boolean; isWorkingDay: boolean }[] {
  const days: { date: string; dayName: string; dayNum: string; isToday: boolean; isWorkingDay: boolean }[] = [];
  const today = new Date();
  
  for (let i = 0; i < count; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayKey = weekdayKeys[date.getDay()];
    const isWorkingDay = schedule[dayKey]?.isWorkingDay ?? false;
    days.push({
      date: date.toISOString().split("T")[0],
      dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
      dayNum: date.getDate().toString(),
      isToday: i === 0,
      isWorkingDay,
    });
  }
  
  return days;
}

function getScheduleForDate(date: string, schedule: WeeklySchedule) {
  const dayIndex = new Date(`${date}T00:00:00`).getDay();
  const dayKey = weekdayKeys[dayIndex];
  return schedule[dayKey];
}

function parseTimeToMinutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function getAvailableSlots(date: string, schedule: WeeklySchedule): AvailabilitySlot[] {
  const daySchedule = getScheduleForDate(date, schedule);
  if (!daySchedule?.isWorkingDay) return [];

  const todayStr = new Date().toISOString().split("T")[0];
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  const isToday = date === todayStr;

  return daySchedule.slots.map(slot => {
    const slotMinutes = parseTimeToMinutes(slot.startTime);
    const isPast = isToday && slotMinutes <= nowMinutes;
    return {
      time: slot.startTime,
      endTime: slot.endTime,
      isDisabled: !slot.isAvailable || isPast,
    };
  });
}

function getConsultationFee(doctor: DoctorProfile) {
  return Math.max(500, doctor.yearsOfExperience * 100);
}

/**
 * Get department name from ID
 */
function getDeptNameFromId(deptId: string): string {
  const dept = departments.find(d => d.id === deptId);
  return dept?.name || deptId;
}

/**
 * Payment methods
 */
const paymentMethods = [
  { id: "gcash", name: "GCash", icon: Wallet, description: "Pay via GCash e-wallet" },
  { id: "maya", name: "Maya", icon: Wallet, description: "Pay via Maya e-wallet" },
  { id: "card", name: "Credit/Debit Card", icon: CreditCard, description: "Visa, Mastercard, etc." },
  { id: "bank", name: "Bank Transfer", icon: Building2, description: "BDO, BPI, Metrobank, etc." },
  { id: "insurance", name: "Health Insurance", icon: Shield, description: "HMO, PhilHealth" },
];

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
  const { user, patientProfile } = useAuth();
  const { createAppointment, addMedicalRecord, addNotification, getOrCreateConversation, addMessage } = useAppData();
  
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [consultationType, setConsultationType] = useState<"video" | "chat">("video");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [reason, setReason] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

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

  // Find doctor
  const doctor = doctorCatalog.find(d => d.id === resolvedParams.id) as DoctorProfile | undefined;

  useEffect(() => {
    setSelectedTime("");
    setPaymentMethod("");
  }, [selectedDate]);

  if (!doctor) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-foreground mb-4">Doctor Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The doctor you are looking for does not exist.
        </p>
        <Link href="/patient/search">
          <Button>Back to Search</Button>
        </Link>
      </div>
    );
  }

  const fullName = `Dr. ${doctor.firstName} ${doctor.lastName}`;
  const availableDays = getNextDays(7, doctor.availability);
  const availableSlots = selectedDate ? getAvailableSlots(selectedDate, doctor.availability) : [];
  const selectedSlot = availableSlots.find(slot => slot.time === selectedTime) || null;
  const consultationFee = getConsultationFee(doctor);

  // Check if doctor accepts insurance
  const availablePaymentMethods = doctor.acceptsInsurance 
    ? paymentMethods 
    : paymentMethods.filter(p => p.id !== "insurance");

  /**
   * Handle appointment booking
   */
  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime || !user || !paymentMethod || !selectedSlot) return;

    setIsBooking(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create appointment
    const appointment = createAppointment({
      patientId: user.id,
      doctorId: doctor.id,
      date: selectedDate,
      timeSlot: { startTime: selectedTime, endTime: selectedSlot.endTime, isAvailable: false },
      consultationType: consultationType,
      status: "confirmed",
      symptoms: reason || "General Consultation",
    });

    addMedicalRecord({
      patientId: user.id,
      consultationId: appointment.id,
      doctorId: doctor.id,
      doctorName: fullName,
      date: selectedDate,
      title: "Scheduled Consultation",
      type: "consultation",
      diagnosis: "Pending consultation",
      symptoms: [reason || "General Consultation"],
      treatment: "To be determined",
      notes: "Consultation scheduled. Records will be updated after the session.",
      followUpRequired: false,
    });

    const conversation = getOrCreateConversation(user.id, doctor.id);
    addMessage({
      id: `msg-${Date.now()}`,
      conversationId: conversation.id,
      senderId: doctor.id,
      senderRole: "doctor",
      senderType: "doctor",
      content: `Hello${patientProfile?.firstName ? ` ${patientProfile.firstName}` : ""}! Your ${consultationType} consultation with ${fullName} is scheduled for ${new Date(selectedDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} at ${selectedTime}. Please upload any past prescriptions or lab results here so we can review them before your appointment.`,
      isRead: false,
      read: false,
      createdAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
    });

    // Add notification for the patient
    addNotification({
      userId: user.id,
      type: "appointment-confirmed",
      title: "Appointment Confirmed",
      message: `Your ${consultationType} consultation with ${fullName} is confirmed for ${new Date(selectedDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} at ${selectedTime}. Payment method: ${paymentMethods.find(p => p.id === paymentMethod)?.name}.`,
      isRead: false,
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
          Your {consultationType} consultation with {fullName} has been scheduled for{" "}
          {new Date(selectedDate).toLocaleDateString("en-US", { 
            weekday: "long", 
            year: "numeric", 
            month: "long", 
            day: "numeric" 
          })} at {selectedTime}.
        </p>
        <div className="bg-card rounded-xl p-4 border border-border mb-6 text-left">
          <h3 className="font-medium text-foreground mb-2">Booking Details</h3>
          <div className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Doctor:</span> {fullName}</p>
            <p><span className="text-muted-foreground">Specialty:</span> {doctor.specialization}</p>
            <p><span className="text-muted-foreground">Fee:</span> ₱{consultationFee.toLocaleString()}</p>
            <p><span className="text-muted-foreground">Payment:</span> {paymentMethods.find(p => p.id === paymentMethod)?.name}</p>
          </div>
        </div>
        <div className="space-y-2">
          <Link href="/patient/calendar">
            <Button className="w-full bg-[#6F8D7E] hover:bg-[#5E7E6D] text-white">
              View My Appointments
            </Button>
          </Link>
          <Link href="/patient/messages">
            <Button className="w-full bg-[#E9D9B5] hover:bg-[#D9C89E] text-[#2D3B35]">
              Open Messages
            </Button>
          </Link>
          <Link href="/patient/dashboard">
            <Button className="w-full bg-[#3E5C52] hover:bg-[#2F4C44] text-white">
              Back to Dashboard
            </Button>
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
              <div className="w-32 h-32 rounded-xl bg-accent overflow-hidden shrink-0">
                {doctor.avatar ? (
                  <img 
                    src={doctor.avatar} 
                    alt={fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-4xl">
                    {doctor.firstName.charAt(0)}{doctor.lastName.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{fullName}</h1>
                <p className="text-primary text-lg font-medium">{doctor.specialization}</p>
                <p className="text-sm text-muted-foreground">{getDeptNameFromId(doctor.department)}</p>
                
                <div className="flex items-center gap-1 mt-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-foreground">{doctor.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">
                    ({doctor.totalReviews} reviews)
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin size={16} />
                    {doctor.location || 'Metro Manila'}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    {doctor.yearsOfExperience} years experience
                  </div>
                </div>

                {/* Insurance badge */}
                {doctor.acceptsInsurance && (
                  <div className="flex items-center gap-2 mt-3">
                    <Shield size={16} className="text-green-600" />
                    <span className="text-sm text-green-600 font-medium">Accepts Health Insurance</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* About */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-3">About</h2>
            <p className="text-muted-foreground">{doctor.bio || "No bio available."}</p>
          </div>

          {/* Education & Credentials */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Education & Credentials</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <GraduationCap className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Education</p>
                  <p className="text-sm text-muted-foreground">
                    {doctor.education || "Education details not provided"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">License Number</p>
                  <p className="text-sm text-muted-foreground">{doctor.licenseNumber}</p>
                </div>
              </div>
              {doctor.contactNumber && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Contact</p>
                    <p className="text-sm text-muted-foreground">{doctor.contactNumber}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Languages */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Languages size={20} />
              Languages Spoken
            </h2>
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

          {/* Reviews */}
          {doctor.reviews && doctor.reviews.length > 0 && (
            <div className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-lg font-semibold text-foreground mb-4">Patient Reviews</h2>
              <div className="space-y-4">
                {doctor.reviews.slice(0, 5).map((review, index) => (
                  <div key={index} className="border-b border-border last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            size={14} 
                            className={star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted"}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      - {review.isAnonymous ? "Anonymous Patient" : "Verified Patient"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
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
                    disabled={!day.isWorkingDay}
                    className={`shrink-0 w-14 py-2 rounded-lg border text-center transition-colors ${
                      selectedDate === day.date
                        ? "bg-primary text-primary-foreground border-primary"
                        : day.isWorkingDay
                          ? "bg-background border-border text-foreground hover:bg-muted"
                          : "bg-muted text-muted-foreground border-border cursor-not-allowed"
                    }`}
                  >
                    <div className="text-xs">{day.dayName}</div>
                    <div className="font-semibold">{day.dayNum}</div>
                    {day.isToday && <div className="text-[10px]">Today</div>}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Only available days can be booked.
              </p>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Select Time
                </label>
                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                  {availableSlots.length === 0 ? (
                    <p className="text-sm text-muted-foreground col-span-3">No available slots for this day.</p>
                  ) : availableSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => setSelectedTime(slot.time)}
                      disabled={slot.isDisabled}
                      className={`py-2 rounded-lg border text-sm transition-colors ${
                        selectedTime === slot.time
                          ? "bg-primary text-primary-foreground border-primary"
                          : slot.isDisabled
                            ? "bg-muted text-muted-foreground border-border cursor-not-allowed"
                            : "bg-background border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Method */}
            {selectedTime && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Payment Method
                </label>
                <div className="space-y-2">
                  {availablePaymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`w-full p-3 rounded-lg border text-left flex items-center gap-3 transition-colors ${
                        paymentMethod === method.id
                          ? "bg-primary/10 border-primary"
                          : "bg-background border-border hover:bg-muted"
                      }`}
                    >
                      <method.icon size={20} className={paymentMethod === method.id ? "text-primary" : "text-muted-foreground"} />
                      <div>
                        <p className={`text-sm font-medium ${paymentMethod === method.id ? "text-primary" : "text-foreground"}`}>
                          {method.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{method.description}</p>
                      </div>
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
                ₱{consultationFee.toLocaleString()}
              </span>
            </div>

            {/* Book Button */}
            <Button
              onClick={handleBookAppointment}
              disabled={!selectedDate || !selectedTime || !paymentMethod || isBooking}
              className="w-full"
            >
              {isBooking ? "Booking..." : "Confirm Booking"}
            </Button>
            
            {!paymentMethod && selectedTime && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                Please select a payment method
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
