/**
 * Doctor Consultations Page
 * 
 * Displays consultation history and allows doctors to add notes and prescriptions.
 * 
 * @module app/doctor/consultations/page
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Search, 
  Calendar, 
  Clock, 
  User,
  Video,
  MessageSquare,
  FileText,
  ChevronRight,
  Filter,
  Eye
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useAppData } from "@/lib/app-data-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Consultation status badge colors
 */
const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  "in-progress": "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  "no-show": "bg-gray-100 text-gray-700",
};

/**
 * Filter tabs
 */
type FilterTab = "all" | "pending" | "confirmed" | "completed" | "cancelled";

/**
 * Doctor Consultations Page Component
 */
export default function DoctorConsultationsPage() {
  const { user } = useAuth();
  const { appointments } = useAppData();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [dateFilter, setDateFilter] = useState("");

  // Get doctor's consultations
  const doctorConsultations = appointments.filter(apt => apt.doctorId === user?.id);

  // Filter consultations
  let filteredConsultations = [...doctorConsultations];

  // Filter by status
  if (activeTab !== "all") {
    filteredConsultations = filteredConsultations.filter(c => c.status === activeTab);
  }

  // Filter by date
  if (dateFilter) {
    filteredConsultations = filteredConsultations.filter(c => c.date === dateFilter);
  }

  // Filter by search
  if (searchQuery) {
    filteredConsultations = filteredConsultations.filter(c =>
      c.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.patientId.includes(searchQuery)
    );
  }

  // Sort by date (most recent first)
  filteredConsultations.sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return b.time.localeCompare(a.time);
  });

  const tabs: { id: FilterTab; label: string; count: number }[] = [
    { id: "all", label: "All", count: doctorConsultations.length },
    { id: "pending", label: "Pending", count: doctorConsultations.filter(c => c.status === "pending").length },
    { id: "confirmed", label: "Confirmed", count: doctorConsultations.filter(c => c.status === "confirmed").length },
    { id: "completed", label: "Completed", count: doctorConsultations.filter(c => c.status === "completed").length },
    { id: "cancelled", label: "Cancelled", count: doctorConsultations.filter(c => c.status === "cancelled").length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Consultations</h1>
        <p className="text-muted-foreground">
          View and manage your consultation history.
        </p>
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
              placeholder="Search consultations..."
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

      {/* Consultations List */}
      {filteredConsultations.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No consultations found</h3>
          <p className="text-muted-foreground">
            {activeTab === "all" 
              ? "Your consultations will appear here."
              : `No ${activeTab} consultations found.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredConsultations.map((consultation) => (
            <div
              key={consultation.id}
              className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">
                        Patient {consultation.patientId.slice(-4)}
                      </h3>
                      <span className={cn(
                        "px-2 py-0.5 text-xs rounded-full capitalize",
                        statusColors[consultation.status]
                      )}>
                        {consultation.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(consultation.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {consultation.time}
                      </span>
                      <span className="flex items-center gap-1">
                        {consultation.type === "video" ? (
                          <Video size={14} />
                        ) : (
                          <MessageSquare size={14} />
                        )}
                        {consultation.type === "video" ? "Video Call" : "Chat"}
                      </span>
                    </div>
                    {consultation.reason && (
                      <p className="text-sm text-foreground mt-2">
                        <span className="text-muted-foreground">Reason: </span>
                        {consultation.reason}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 lg:flex-shrink-0">
                  {consultation.status === "confirmed" && (
                    <Link href={`/doctor/consultation/${consultation.id}`}>
                      <Button size="sm">
                        <Video size={16} className="mr-2" />
                        Join Session
                      </Button>
                    </Link>
                  )}
                  {consultation.status === "completed" && (
                    <Link href={`/doctor/consultations/${consultation.id}/notes`}>
                      <Button size="sm" variant="outline">
                        <FileText size={16} className="mr-2" />
                        View Notes
                      </Button>
                    </Link>
                  )}
                  <Link href={`/doctor/patients/${consultation.patientId}`}>
                    <Button size="sm" variant="outline">
                      <Eye size={16} className="mr-2" />
                      Patient Records
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination hint */}
      {filteredConsultations.length > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          Showing {filteredConsultations.length} consultation{filteredConsultations.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
