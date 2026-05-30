/**
 * Doctor Consultation Session Page
 * 
 * Video/chat consultation interface with ability to add notes and prescriptions.
 * 
 * @module app/doctor/consultation/[id]/page
 */

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone,
  MessageSquare,
  FileText,
  Send,
  User,
  Clock,
  Pill,
  Plus,
  Trash2,
  Save,
  CheckCircle
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useAppData } from "@/lib/app-data-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Medication item interface
 */
interface MedicationItem {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

/**
 * Consultation Session Page Component
 */
export default function ConsultationSessionPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { appointments, updateAppointment, addMedicalRecord, sendMessage } = useAppData();

  // Find the appointment
  const appointment = appointments.find(apt => apt.id === params.id);

  // Video controls
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isInCall, setIsInCall] = useState(false);

  // Chat state
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<{ sender: string; content: string; time: string }[]>([]);

  // Notes and prescription state
  const [activeTab, setActiveTab] = useState<"video" | "notes">("video");
  const [notes, setNotes] = useState({
    chiefComplaint: "",
    symptoms: "",
    diagnosis: "",
    treatment: "",
    followUpRequired: false,
    followUpDate: "",
  });
  const [medications, setMedications] = useState<MedicationItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

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

  if (!appointment) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Consultation not found</h2>
          <p className="text-muted-foreground mb-4">The consultation you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push("/doctor/consultations")}>
            Back to Consultations
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
   * Start/join call
   */
  const handleStartCall = () => {
    setIsInCall(true);
    updateAppointment(appointment.id, { status: "in-progress" });
  };

  /**
   * End call
   */
  const handleEndCall = () => {
    setIsInCall(false);
    setActiveTab("notes");
  };

  /**
   * Send chat message
   */
  const handleSendChat = () => {
    if (!chatMessage.trim()) return;
    setChatMessages(prev => [...prev, {
      sender: "doctor",
      content: chatMessage,
      time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    }]);
    setChatMessage("");
  };

  /**
   * Add medication
   */
  const addMedication = () => {
    setMedications(prev => [...prev, {
      name: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
    }]);
  };

  /**
   * Update medication
   */
  const updateMedication = (index: number, field: keyof MedicationItem, value: string) => {
    setMedications(prev => prev.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    ));
  };

  /**
   * Remove medication
   */
  const removeMedication = (index: number) => {
    setMedications(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * Save consultation notes and complete
   */
  const handleSaveAndComplete = async () => {
    setIsSaving(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Add medical record
    addMedicalRecord({
      patientId: appointment.patientId,
      consultationId: appointment.id,
      doctorId: user?.id || "",
      doctorName: `Dr. ${(user as any)?.lastName || "Doctor"}`,
      date: new Date().toISOString().split("T")[0],
      type: "consultations",
      diagnosis: notes.diagnosis,
      symptoms: notes.symptoms.split(",").map(s => s.trim()),
      treatment: notes.treatment,
      prescription: medications.length > 0 ? {
        id: `rx-${Date.now()}`,
        consultationId: appointment.id,
        medications: medications,
        instructions: notes.treatment,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      } : undefined,
      notes: notes.chiefComplaint,
      followUpRequired: notes.followUpRequired,
      followUpDate: notes.followUpDate || undefined,
      createdAt: new Date().toISOString(),
    });

    // Update appointment status
    updateAppointment(appointment.id, { status: "completed" });

    setIsSaving(false);
    setSavedMessage(true);

    // Redirect after short delay
    setTimeout(() => {
      router.push("/doctor/consultations");
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Consultation Session</h1>
          <p className="text-muted-foreground">
            Patient {appointment.patientId.slice(-4)} • {appointment.date} at {appointment.time}
          </p>
        </div>
        {isInCall && (
          <div className="flex items-center gap-2 text-foreground bg-red-100 px-4 py-2 rounded-full">
            <Clock size={18} className="text-red-600" />
            <span className="font-mono font-medium">{formatTime(sessionTime)}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("video")}
          className={cn(
            "px-4 py-2 rounded-lg font-medium transition-colors",
            activeTab === "video"
              ? "bg-primary text-primary-foreground"
              : "bg-card text-muted-foreground hover:bg-muted border border-border"
          )}
        >
          <Video size={18} className="inline mr-2" />
          Video Session
        </button>
        <button
          onClick={() => setActiveTab("notes")}
          className={cn(
            "px-4 py-2 rounded-lg font-medium transition-colors",
            activeTab === "notes"
              ? "bg-primary text-primary-foreground"
              : "bg-card text-muted-foreground hover:bg-muted border border-border"
          )}
        >
          <FileText size={18} className="inline mr-2" />
          Notes & Prescription
        </button>
      </div>

      {activeTab === "video" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Area */}
          <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden">
            {!isInCall ? (
              <div className="aspect-video bg-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                  <Video size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="mb-4">Ready to start the consultation?</p>
                  <Button onClick={handleStartCall} size="lg">
                    <Video size={20} className="mr-2" />
                    Start Video Call
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="aspect-video bg-gray-900 relative">
                  {/* Main video (patient) */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center">
                      <User size={48} className="text-gray-400" />
                    </div>
                  </div>
                  
                  {/* Self view (doctor) */}
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
                    onClick={handleEndCall}
                    className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                    aria-label="End call"
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
              <h3 className="font-semibold text-foreground">Chat</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm">
                  No messages yet
                </p>
              ) : (
                chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      "max-w-[80%] rounded-lg p-3",
                      msg.sender === "doctor"
                        ? "ml-auto bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    )}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1">{msg.time}</p>
                  </div>
                ))
              )}
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
      ) : (
        /* Notes and Prescription Tab */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Consultation Notes */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Consultation Notes</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Chief Complaint
                </label>
                <textarea
                  value={notes.chiefComplaint}
                  onChange={(e) => setNotes(prev => ({ ...prev, chiefComplaint: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground resize-none"
                  placeholder="Patient's main concern..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Symptoms (comma separated)
                </label>
                <textarea
                  value={notes.symptoms}
                  onChange={(e) => setNotes(prev => ({ ...prev, symptoms: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground resize-none"
                  placeholder="fever, headache, fatigue..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Diagnosis
                </label>
                <textarea
                  value={notes.diagnosis}
                  onChange={(e) => setNotes(prev => ({ ...prev, diagnosis: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground resize-none"
                  placeholder="Clinical diagnosis..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Treatment Plan
                </label>
                <textarea
                  value={notes.treatment}
                  onChange={(e) => setNotes(prev => ({ ...prev, treatment: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground resize-none"
                  placeholder="Recommended treatment..."
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={notes.followUpRequired}
                    onChange={(e) => setNotes(prev => ({ ...prev, followUpRequired: e.target.checked }))}
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="text-sm text-foreground">Follow-up Required</span>
                </label>
                {notes.followUpRequired && (
                  <input
                    type="date"
                    value={notes.followUpDate}
                    onChange={(e) => setNotes(prev => ({ ...prev, followUpDate: e.target.value }))}
                    className="px-3 py-1 rounded-lg border border-border bg-background text-foreground text-sm"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Prescription */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Pill size={20} />
                Prescription
              </h2>
              <Button size="sm" variant="outline" onClick={addMedication}>
                <Plus size={16} className="mr-1" />
                Add Medication
              </Button>
            </div>

            {medications.length === 0 ? (
              <div className="text-center py-8">
                <Pill className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No medications added yet.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Click &quot;Add Medication&quot; to prescribe.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {medications.map((med, index) => (
                  <div key={index} className="p-4 bg-muted rounded-lg relative">
                    <button
                      onClick={() => removeMedication(index)}
                      className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 rounded"
                      aria-label="Remove medication"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <Input
                          placeholder="Medication name"
                          value={med.name}
                          onChange={(e) => updateMedication(index, "name", e.target.value)}
                        />
                      </div>
                      <Input
                        placeholder="Dosage (e.g., 500mg)"
                        value={med.dosage}
                        onChange={(e) => updateMedication(index, "dosage", e.target.value)}
                      />
                      <Input
                        placeholder="Frequency (e.g., twice daily)"
                        value={med.frequency}
                        onChange={(e) => updateMedication(index, "frequency", e.target.value)}
                      />
                      <Input
                        placeholder="Duration (e.g., 7 days)"
                        value={med.duration}
                        onChange={(e) => updateMedication(index, "duration", e.target.value)}
                      />
                      <Input
                        placeholder="Special instructions"
                        value={med.instructions}
                        onChange={(e) => updateMedication(index, "instructions", e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="lg:col-span-2">
            <Button
              onClick={handleSaveAndComplete}
              disabled={isSaving || !notes.diagnosis}
              className="w-full py-6 text-lg"
            >
              {isSaving ? (
                "Saving..."
              ) : savedMessage ? (
                <>
                  <CheckCircle size={20} className="mr-2" />
                  Consultation Completed!
                </>
              ) : (
                <>
                  <Save size={20} className="mr-2" />
                  Save Notes & Complete Consultation
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
