/**
 * Doctor Patients Page
 * 
 * Lists all patients who have consulted with the doctor.
 * 
 * @module app/doctor/patients/page
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Search, 
  User, 
  Calendar, 
  FileText,
  ChevronRight,
  Filter
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useAppData } from "@/lib/app-data-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * Mock patient data (in production, this would come from a database)
 */
interface PatientSummary {
  id: string;
  name: string;
  email: string;
  lastVisit: string;
  totalVisits: number;
  avatar?: string;
}

/**
 * Doctor Patients Page Component
 */
export default function DoctorPatientsPage() {
  const { user } = useAuth();
  const { appointments, medicalRecords } = useAppData();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "lastVisit" | "totalVisits">("lastVisit");

  // Get unique patients from appointments
  const doctorAppointments = appointments.filter(apt => apt.doctorId === user?.id);
  
  // Create patient summaries
  const patientMap = new Map<string, PatientSummary>();
  
  doctorAppointments.forEach(apt => {
    const existing = patientMap.get(apt.patientId);
    if (existing) {
      existing.totalVisits++;
      if (apt.date > existing.lastVisit) {
        existing.lastVisit = apt.date;
      }
    } else {
      patientMap.set(apt.patientId, {
        id: apt.patientId,
        name: `Patient ${apt.patientId.slice(-4)}`, // Mock name
        email: `patient${apt.patientId.slice(-4)}@email.com`,
        lastVisit: apt.date,
        totalVisits: 1,
      });
    }
  });

  let patients = Array.from(patientMap.values());

  // Filter by search
  if (searchQuery) {
    patients = patients.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Sort patients
  patients.sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "lastVisit":
        return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
      case "totalVisits":
        return b.totalVisits - a.totalVisits;
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">My Patients</h1>
        <p className="text-muted-foreground">
          View and manage your patient records.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            type="text"
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-2 rounded-lg border border-border bg-card text-foreground"
        >
          <option value="lastVisit">Sort by Last Visit</option>
          <option value="name">Sort by Name</option>
          <option value="totalVisits">Sort by Total Visits</option>
        </select>
      </div>

      {/* Patients List */}
      {patients.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No patients found</h3>
          <p className="text-muted-foreground">
            {searchQuery 
              ? "Try adjusting your search criteria."
              : "Your patient list will appear here after consultations."
            }
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-medium text-foreground">Patient</th>
                <th className="text-left p-4 font-medium text-foreground hidden sm:table-cell">Email</th>
                <th className="text-left p-4 font-medium text-foreground hidden md:table-cell">Last Visit</th>
                <th className="text-left p-4 font-medium text-foreground hidden lg:table-cell">Total Visits</th>
                <th className="text-right p-4 font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                        {patient.avatar ? (
                          <img 
                            src={patient.avatar} 
                            alt={patient.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{patient.name}</p>
                        <p className="text-sm text-muted-foreground sm:hidden">{patient.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground hidden sm:table-cell">{patient.email}</td>
                  <td className="p-4 text-muted-foreground hidden md:table-cell">
                    {new Date(patient.lastVisit).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="p-4 text-muted-foreground hidden lg:table-cell">{patient.totalVisits}</td>
                  <td className="p-4 text-right">
                    <Link href={`/doctor/patients/${patient.id}`}>
                      <Button variant="ghost" size="sm">
                        <FileText size={16} className="mr-2" />
                        Records
                        <ChevronRight size={16} className="ml-1" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary */}
      {patients.length > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          Showing {patients.length} patient{patients.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
