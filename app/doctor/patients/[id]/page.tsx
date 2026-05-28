/**
 * Doctor Patient Detail Page
 * 
 * Displays detailed patient information and medical history for doctors.
 * 
 * @module app/doctor/patients/[id]/page
 */

"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft,
  User, 
  Mail, 
  Phone, 
  Calendar, 
  FileText,
  Pill,
  AlertCircle,
  Heart,
  Activity,
  Download,
  Eye,
  MessageSquare
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useAppData } from "@/lib/app-data-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Tab type for record filtering
 */
type RecordTab = "overview" | "consultations" | "prescriptions" | "notes";

/**
 * Patient Detail Page Component
 */
export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { appointments, medicalRecords } = useAppData();
  const [activeTab, setActiveTab] = useState<RecordTab>("overview");

  const patientId = params.id as string;

  // Get patient's appointments with this doctor
  const patientAppointments = appointments.filter(
    apt => apt.patientId === patientId && apt.doctorId === user?.id
  );

  // Get patient's medical records from this doctor
  const patientRecords = medicalRecords.filter(
    record => record.patientId === patientId && record.doctorId === user?.id
  );

  // Calculate stats
  const totalVisits = patientAppointments.filter(a => a.status === "completed").length;
  const lastVisit = patientAppointments
    .filter(a => a.status === "completed")
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  const upcomingAppointments = patientAppointments.filter(
    a => a.status === "confirmed" || a.status === "pending"
  );

  // Mock patient data (in production, fetch from database)
  const patient = {
    id: patientId,
    name: `Patient ${patientId.slice(-4)}`,
    email: `patient${patientId.slice(-4)}@email.com`,
    phone: "+1-555-0123",
    dateOfBirth: "1985-06-15",
    gender: "Female",
    bloodType: "O+",
    allergies: ["Penicillin", "Peanuts"],
    medicalConditions: ["Hypertension"],
    emergencyContact: "John Doe",
    emergencyPhone: "+1-555-9999",
  };

  const tabs: { id: RecordTab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "consultations", label: "Consultations" },
    { id: "prescriptions", label: "Prescriptions" },
    { id: "notes", label: "Clinical Notes" },
  ];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back to Patients</span>
      </button>

      {/* Patient Header */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{patient.name}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail size={14} />
                  {patient.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone size={14} />
                  {patient.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/doctor/messages?patient=${patientId}`}>
              <Button variant="outline">
                <MessageSquare size={18} className="mr-2" />
                Message
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalVisits}</p>
              <p className="text-sm text-muted-foreground">Total Visits</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{upcomingAppointments.length}</p>
              <p className="text-sm text-muted-foreground">Upcoming</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{patient.bloodType}</p>
              <p className="text-sm text-muted-foreground">Blood Type</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{patientRecords.length}</p>
              <p className="text-sm text-muted-foreground">Records</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:bg-muted border border-border"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Medical Info */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Medical Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="font-medium text-foreground">{patient.gender}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Blood Type</p>
                <p className="font-medium text-foreground">{patient.bloodType}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <AlertCircle size={14} className="text-red-500" />
                  Allergies
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {patient.allergies.map((allergy, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-red-100 text-red-700 text-sm rounded-full"
                    >
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Medical Conditions</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {patient.medicalConditions.map((condition, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full"
                    >
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Emergency Contact</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Contact Name</p>
                <p className="font-medium text-foreground">{patient.emergencyContact}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone Number</p>
                <p className="font-medium text-foreground">{patient.emergencyPhone}</p>
              </div>
            </div>
          </div>

          {/* Last Visit Summary */}
          {lastVisit && (
            <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Last Visit Summary</h2>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Date</p>
                  <p className="font-medium text-foreground">
                    {new Date(lastVisit.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  {lastVisit.reason && (
                    <>
                      <p className="text-sm text-muted-foreground mt-3 mb-1">Reason</p>
                      <p className="text-foreground">{lastVisit.reason}</p>
                    </>
                  )}
                </div>
                <Link href={`/doctor/consultations/${lastVisit.id}/notes`}>
                  <Button variant="outline" size="sm">
                    <Eye size={16} className="mr-2" />
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "consultations" && (
        <div className="bg-card rounded-xl border border-border">
          {patientAppointments.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No consultations found</h3>
              <p className="text-muted-foreground">
                Consultation history with this patient will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {patientAppointments
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((apt) => (
                  <div key={apt.id} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-2 py-0.5 text-xs rounded-full capitalize",
                            apt.status === "completed" ? "bg-green-100 text-green-700" :
                            apt.status === "confirmed" ? "bg-blue-100 text-blue-700" :
                            apt.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                            "bg-gray-100 text-gray-700"
                          )}>
                            {apt.status}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {apt.type === "video" ? "Video Call" : "Chat"}
                          </span>
                        </div>
                        <p className="font-medium text-foreground mt-1">
                          {new Date(apt.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })} at {apt.time}
                        </p>
                        {apt.reason && (
                          <p className="text-sm text-muted-foreground mt-1">{apt.reason}</p>
                        )}
                      </div>
                      {apt.status === "completed" && (
                        <Link href={`/doctor/consultations/${apt.id}/notes`}>
                          <Button variant="outline" size="sm">
                            <FileText size={16} className="mr-2" />
                            Notes
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "prescriptions" && (
        <div className="bg-card rounded-xl border border-border">
          {patientRecords.filter(r => r.prescription).length === 0 ? (
            <div className="p-12 text-center">
              <Pill className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No prescriptions found</h3>
              <p className="text-muted-foreground">
                Prescriptions issued to this patient will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {patientRecords
                .filter(r => r.prescription)
                .map((record) => (
                  <div key={record.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium text-foreground">{record.diagnosis}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(record.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download size={16} className="mr-2" />
                        Download
                      </Button>
                    </div>
                    {record.prescription && (
                      <div className="bg-muted rounded-lg p-3">
                        <p className="text-sm font-medium text-foreground mb-2">Medications:</p>
                        <ul className="space-y-1">
                          {record.prescription.medications.map((med, i) => (
                            <li key={i} className="text-sm text-muted-foreground">
                              {med.name} - {med.dosage}, {med.frequency} for {med.duration}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "notes" && (
        <div className="bg-card rounded-xl border border-border">
          {patientRecords.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No clinical notes found</h3>
              <p className="text-muted-foreground">
                Clinical notes from consultations will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {patientRecords.map((record) => (
                <div key={record.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-foreground">{record.diagnosis}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(record.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  {record.symptoms && record.symptoms.length > 0 && (
                    <div className="mb-2">
                      <p className="text-sm text-muted-foreground">Symptoms:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {record.symptoms.map((symptom, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-muted text-foreground text-xs rounded-full"
                          >
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {record.treatment && (
                    <div className="mb-2">
                      <p className="text-sm text-muted-foreground">Treatment:</p>
                      <p className="text-sm text-foreground mt-1">{record.treatment}</p>
                    </div>
                  )}
                  {record.notes && (
                    <div>
                      <p className="text-sm text-muted-foreground">Notes:</p>
                      <p className="text-sm text-foreground mt-1">{record.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
