/**
 * Medical Records Page
 * 
 * Displays patient's medical records, prescriptions, and consultation history.
 * 
 * @module app/patient/records/page
 */

"use client";

import { useState } from "react";
import { 
  FileText, 
  Download, 
  Calendar, 
  Pill, 
  Stethoscope,
  Filter,
  Search,
  Eye
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useAppData } from "@/lib/app-data-context";
import { doctors } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Tab type for filtering records
 */
type RecordTab = "all" | "consultations" | "prescriptions" | "lab-results";

/**
 * Medical Records Page Component
 */
export default function MedicalRecordsPage() {
  const { user } = useAuth();
  const { medicalRecords, appointments, prescriptions } = useAppData();
  const [activeTab, setActiveTab] = useState<RecordTab>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Get patient-specific records
  const patientRecords = medicalRecords.filter(r => r.patientId === user?.id);
  const patientPrescriptions = prescriptions.filter(p => p.patientId === user?.id);
  const completedAppointments = appointments.filter(
    a => a.patientId === user?.id && a.status === "completed"
  );

  /**
   * Filter records based on active tab and search
   */
  const filteredRecords = patientRecords.filter(record => {
    // Filter by tab
    if (activeTab !== "all" && record.type !== activeTab.replace("-", "_")) {
      return false;
    }
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const doctor = doctors.find(d => d.id === record.doctorId);
      return (
        record.title.toLowerCase().includes(query) ||
        record.diagnosis?.toLowerCase().includes(query) ||
        doctor?.name.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  const tabs: { id: RecordTab; label: string; icon: React.ReactNode }[] = [
    { id: "all", label: "All Records", icon: <FileText size={18} /> },
    { id: "consultations", label: "Consultations", icon: <Stethoscope size={18} /> },
    { id: "prescriptions", label: "Prescriptions", icon: <Pill size={18} /> },
    { id: "lab-results", label: "Lab Results", icon: <FileText size={18} /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Medical Records</h1>
        <p className="text-muted-foreground">
          Access your complete medical history, prescriptions, and lab results.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{completedAppointments.length}</p>
              <p className="text-sm text-muted-foreground">Consultations</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Pill className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{patientPrescriptions.length}</p>
              <p className="text-sm text-muted-foreground">Prescriptions</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{patientRecords.length}</p>
              <p className="text-sm text-muted-foreground">Total Records</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {patientRecords[0] 
                  ? new Date(patientRecords[0].date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  : "N/A"
                }
              </p>
              <p className="text-sm text-muted-foreground">Last Visit</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-muted"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            type="text"
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Records List */}
      {filteredRecords.length === 0 ? (
        <div className="bg-card rounded-xl p-12 border border-border text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No records found</h3>
          <p className="text-muted-foreground">
            {activeTab === "all" 
              ? "Your medical records will appear here after consultations."
              : `No ${activeTab.replace("-", " ")} found.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((record) => {
            const doctor = doctors.find(d => d.id === record.doctorId);
            return (
              <div
                key={record.id}
                className="bg-card rounded-xl p-6 border border-border hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      {record.type === "prescription" ? (
                        <Pill className="w-6 h-6 text-primary" />
                      ) : record.type === "lab_result" ? (
                        <FileText className="w-6 h-6 text-primary" />
                      ) : (
                        <Stethoscope className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{record.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {doctor?.name || "Doctor"} • {doctor?.specialty}
                      </p>
                      {record.diagnosis && (
                        <p className="text-sm text-foreground mt-2">
                          <span className="text-muted-foreground">Diagnosis:</span> {record.diagnosis}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(record.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 sm:flex-shrink-0">
                    <Button variant="outline" size="sm">
                      <Eye size={16} className="mr-2" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download size={16} className="mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
