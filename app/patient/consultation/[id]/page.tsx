/**
 * Patient Consultation Session Page
 * 
 * Video/chat consultation interface for patients.
 * 
 * @module app/patient/consultation/[id]/page
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone,
  MessageSquare,
  Send,
  User,
  Clock,
  Stethoscope,
  Star
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useAppData } from "@/lib/app-data-context";
import { doctors } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Patient Consultation Session Page Component
 */
export default function PatientConsultationPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { appointments, updateAppointment, isLoading } = useAppData();
  const consultationId = Array.isArray(params.id) ? params.id[0] : params.id;

  const patientAppointments = user
    ? appointments.filter(appointment => appointment.patientId === user.id)
    : appointments;

  const appointment = appointments.find(apt => apt.id === consultationId)
    || patientAppointments.find(apt => apt.status === "confirmed")
    || patientAppointments[0]
    || null;
  const doctor = appointment ? doctors.find(d => d.id === appointment.doctorId) : null;

  // Video controls
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isInCall, setIsInCall] = useState(false);

  // Chat state
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<{ sender: string; content: string; time: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Session timer
  const [sessionTime, setSessionTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isInCall) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isInCall]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Loading consultation</h2>
          <p className="text-muted-foreground">Preparing your session.</p>
        </div>
      </div>
    );
  }

  if (!appointment || !doctor) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Consultation not found</h2>
          <p className="text-muted-foreground mb-4">The consultation you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push("/patient/calendar")}>
            Back to Calendar
          </Button>
        </div>
      </div>
    );
  }

  /**
   * Format session time
   */
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  /**
   * Join call
   */
  const handleJoinCall = () => {
    setIsInCall(true);
  };

  /**
   * Leave call
   */
  const handleLeaveCall = () => {
    if (confirm("Are you sure you want to leave the consultation?")) {
      setIsInCall(false);
      router.push("/patient/calendar");
    }
  };

  /**
   * Send chat message
   */
  const handleSendChat = () => {
    if (!chatMessage.trim()) return;
    setChatMessages(prev => [...prev, {
      sender: "patient",
      content: chatMessage,
      time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    }]);
    setChatMessage("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden shrink-0">
            <img
              src={doctor.avatar}
              alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Consultation with Dr. {doctor.firstName} {doctor.lastName}
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Stethoscope size={16} />
              {doctor.specialization}
              <span className="mx-2">|</span>
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
              {doctor.rating}
            </p>
          </div>
        </div>
        {isInCall && (
          <div className="flex items-center gap-2 text-foreground bg-red-100 px-4 py-2 rounded-full">
            <Clock size={18} className="text-red-600" />
            <span className="font-mono font-medium">{formatTime(sessionTime)}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Area */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden">
          {!isInCall ? (
            <div className="aspect-video bg-gray-900 flex items-center justify-center">
              <div className="text-center text-white">
                <Video size={48} className="mx-auto mb-4 opacity-50" />
                <p className="mb-2">Ready to join your consultation?</p>
                <p className="text-sm text-gray-400 mb-4">
                  Scheduled for {appointment.date} at {appointment.time}
                </p>
                <Button onClick={handleJoinCall} size="lg" className="bg-green-600 hover:bg-green-700">
                  <Video size={20} className="mr-2" />
                  Join Video Call
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="aspect-video bg-gray-900 relative">
                {/* Main video (doctor) */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20">
                    <img
                      src={doctor.avatar}
                      alt={`Dr. ${doctor.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                {/* Self view (patient) */}
                <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden border-2 border-white/20">
                  {isVideoOn ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <User size={24} className="text-gray-400" />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-700">
                      <VideoOff size={24} className="text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Doctor name overlay */}
                <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
                  Dr. {doctor.firstName} {doctor.lastName}
                </div>
              </div>

              {/* Controls */}
              <div className="p-4 flex items-center justify-center gap-4 bg-gray-900">
                <button
                  onClick={() => setIsMicOn(!isMicOn)}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                    isMicOn ? "bg-gray-700 text-white" : "bg-red-500 text-white"
                  )}
                  aria-label={isMicOn ? "Mute microphone" : "Unmute microphone"}
                >
                  {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
                </button>
                <button
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                    isVideoOn ? "bg-gray-700 text-white" : "bg-red-500 text-white"
                  )}
                  aria-label={isVideoOn ? "Turn off camera" : "Turn on camera"}
                >
                  {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
                </button>
                <button
                  onClick={handleLeaveCall}
                  className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                  aria-label="Leave call"
                >
                  <Phone size={20} className="rotate-135" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Chat Sidebar */}
        <div className="bg-card rounded-xl border border-border flex flex-col h-125 lg:h-auto">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <MessageSquare size={18} />
              Chat
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm">
                Send a message to your doctor
              </p>
            ) : (
              chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[80%] rounded-lg p-3",
                    msg.sender === "patient"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  )}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1">{msg.time}</p>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === "Enter" && handleSendChat()}
              />
              <Button onClick={handleSendChat} disabled={!chatMessage.trim()}>
                <Send size={18} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Consultation Details */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Consultation Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Date & Time</p>
            <p className="font-medium text-foreground">
              {new Date(appointment.date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })} at {appointment.time}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Consultation Type</p>
            <p className="font-medium text-foreground capitalize">
              {appointment.type === "video" ? "Video Call" : "Chat"} Consultation
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Reason</p>
            <p className="font-medium text-foreground">
              {appointment.reason || "General Consultation"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
