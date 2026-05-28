/**
 * Doctor Records Page
 * 
 * Displays all medical records created by the doctor.
 * 
 * @module app/doctor/records/page
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Search, 
  FileText, 
  Pill,
  User,
  Calendar,
  Filter,
  Download,
  Eye,
  Stethoscope
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useAppData } from "@/lib/app-data-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Filter tab type
 */
type FilterTab = "all" | "consultations" | "prescriptions";

/**
 * Doctor Records Page Component
 */
export default function DoctorRecordsPage() {
  const { user } = useAuth();
  const { medicalRecords } = useAppData();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Get doctor's records
  const doctorRecords = medicalRecords.filter(record => record.doctorId === user?.id);

  // Filter records
  let filteredRecords = [...doctorRecords];

  // Filter by type
  if (activeTab === "prescriptions") {
    filteredRecords = filteredRecords.filter(r => r.prescription);
  }

  // Filter by date
  if (dateFilter) {
    filteredRecords = filteredRecords.filter(r => r.date === dateFilter);
  }

  // Filter by search
  if (searchQuery) {
    filteredRecords = filteredRecords.filter(r =>
      r.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.patientId.includes(searchQuery)
    );
  }

  // Sort by date (most recent first)
  filteredRecords.sort((a, b) => b.date.localeCompare(a.date));

  const tabs: { id: FilterTab; label: string; count: number }[] = [
    { id: "all", label: "All Records", count: doctorRecords.length },
    { id: "consultations", label: "Consultations", count: doctorRecords.length },
    { id: "prescriptions", label: "Prescriptions", count: doctorRecords.filter(r => r.prescription).length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Medical Records</h1>
        <p className="text-muted-foreground">
          View and manage all medical records you have created.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{doctorRecords.length}</p>
              <p className="text-sm text-muted-foreground">Total Records</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Pill className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {doctorRecords.filter(r => r.prescription).length}
              </p>
              <p className="text-sm text-muted-foreground">Prescriptions</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {new Set(doctorRecords.map(r => r.patientId)).size}
              </p>
              <p className="text-sm text-muted-foreground">Patients</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
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
              <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-black/10">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              type="text"
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-border bg-card text-foreground"
          />
        </div>
      </div>

      {/* Records List */}
      {filteredRecords.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No records found</h3>
          <p className="text-muted-foreground">
            Medical records you create will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((record) => (
            <div
              key={record.id}
              className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">
                        Patient {record.patientId.slice(-4)}
                      </h3>
                      {record.prescription && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                          Has Prescription
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(record.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Stethoscope size={14} />
                        {record.diagnosis || "No diagnosis"}
                      </span>
                    </div>
                    {record.symptoms && record.symptoms.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {record.symptoms.slice(0, 3).map((symptom, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-muted text-foreground text-xs rounded-full"
                          >
                            {symptom}
                          </span>
                        ))}
                        {record.symptoms.length > 3 && (
                          <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">
                            +{record.symptoms.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 lg:flex-shrink-0">
                  <Link href={`/doctor/patients/${record.patientId}`}>
                    <Button size="sm" variant="outline">
                      <Eye size={16} className="mr-2" />
                      View Patient
                    </Button>
                  </Link>
                  <Button size="sm" variant="outline">
                    <Download size={16} className="mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Prescription Summary */}
              {record.prescription && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <Pill size={14} />
                    Prescription
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {record.prescription.medications.slice(0, 2).map((med, i) => (
                      <li key={i}>
                        {med.name} - {med.dosage}, {med.frequency}
                      </li>
                    ))}
                    {record.prescription.medications.length > 2 && (
                      <li className="text-primary">
                        +{record.prescription.medications.length - 2} more medications
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination hint */}
      {filteredRecords.length > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          Showing {filteredRecords.length} record{filteredRecords.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
