/**
 * Patient Dashboard Page
 * 
 * Main dashboard for patients featuring:
 * - Doctor search with filters (location, specialty, date)
 * - Department quick access grid
 * - Consulty AI symptom checker
 * - Upcoming appointments
 * 
 * @module app/patient/dashboard/page
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  MapPin, 
  Stethoscope, 
  Calendar as CalendarIcon,
  Heart,
  Brain,
  Eye,
  Bone,
  Baby,
  Pill,
  Activity,
  Microscope,
  Scissors,
  Smile,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useAppData } from "@/lib/app-data-context";
import { DEPARTMENTS, LOCATIONS, doctors } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Department icons mapping
 */
const departmentIcons: Record<string, React.ReactNode> = {
  "Cardiology": <Heart size={24} />,
  "Neurology": <Brain size={24} />,
  "Ophthalmology": <Eye size={24} />,
  "Orthopedics": <Bone size={24} />,
  "Pediatrics": <Baby size={24} />,
  "Dermatology": <Smile size={24} />,
  "General Medicine": <Pill size={24} />,
  "Gynecology": <Activity size={24} />,
  "Psychiatry": <Microscope size={24} />,
  "Surgery": <Scissors size={24} />,
};

/**
 * Patient Dashboard Component
 */
export default function PatientDashboard() {
  const router = useRouter();
  const { user, patientProfile } = useAuth();
  const { appointments } = useAppData();
  
  // Search filters state
  const [location, setLocation] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [date, setDate] = useState("");
  const [symptoms, setSymptoms] = useState("");

  // Get patient name from profile
  const patientName = patientProfile?.firstName || "User";

  // Get upcoming appointments
  const upcomingAppointments = appointments
    .filter(apt => apt.patientId === user?.id && apt.status === "confirmed")
    .slice(0, 3);

  /**
   * Handle doctor search
   */
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (specialty) params.set("specialty", specialty);
    if (date) params.set("date", date);
    router.push(`/patient/search?${params.toString()}`);
  };

  /**
   * Handle department click
   */
  const handleDepartmentClick = (department: string) => {
    router.push(`/patient/search?specialty=${encodeURIComponent(department)}`);
  };

  /**
   * Handle Consulty symptom submission
   */
  const handleConsultySubmit = () => {
    if (symptoms.trim()) {
      router.push(`/patient/consulty?symptoms=${encodeURIComponent(symptoms)}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <section className="bg-primary rounded-2xl p-6 text-primary-foreground">
        <p className="text-center mb-4 text-sm lg:text-base">
          Find the right doctor, right where you are, right when you&apos;re free.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Location Filter */}
          <div className="relative">
            <label className="block text-xs font-medium mb-1 text-primary-foreground/80">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-full bg-background text-foreground border-0 focus:ring-2 focus:ring-accent appearance-none cursor-pointer"
                aria-label="Select location"
              >
                <option value="">All Locations</option>
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Specialty Filter */}
          <div className="relative">
            <label className="block text-xs font-medium mb-1 text-primary-foreground/80">
              Type of Specialist
            </label>
            <div className="relative">
              <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-full bg-background text-foreground border-0 focus:ring-2 focus:ring-accent appearance-none cursor-pointer"
                aria-label="Select specialty"
              >
                <option value="">All Specialties</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Filter */}
          <div className="relative">
            <label className="block text-xs font-medium mb-1 text-primary-foreground/80">
              Date
            </label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-full bg-background text-foreground border-0 focus:ring-2 focus:ring-accent"
                aria-label="Select date"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Button 
            onClick={handleSearch}
            className="bg-accent text-accent-foreground hover:bg-accent/90 px-8"
          >
            Search Doctors
          </Button>
        </div>
      </section>

      {/* Departments Grid */}
      <section className="bg-card rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Department</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-3">
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept}
              onClick={() => handleDepartmentClick(dept)}
              className="aspect-square bg-accent/50 hover:bg-accent rounded-xl flex flex-col items-center justify-center p-2 transition-colors group"
              aria-label={`Browse ${dept} department`}
            >
              <div className="text-primary group-hover:text-primary-foreground transition-colors">
                {departmentIcons[dept] || <Stethoscope size={24} />}
              </div>
              <span className="text-xs text-center mt-2 text-foreground group-hover:text-foreground line-clamp-2">
                {dept}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Consulty AI Section */}
      <section className="bg-gradient-to-r from-[#769382]/20 to-[#FFEBBC]/30 rounded-2xl p-6 relative overflow-hidden border-2 border-[#769382]/30">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex-1">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
              Tell Consulty what hurts.
              <Sparkles className="w-6 h-6 text-[#769382]" />
            </h2>
            <p className="text-muted-foreground mb-4">
              Simply type your symptoms — Consulty figures out the right doctor and department for you.
            </p>
            <div className="relative">
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="What symptoms are you currently feeling? How bad is it when rated out of 10?"
                className="w-full p-4 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground resize-none h-24 focus:ring-2 focus:ring-primary focus:border-transparent"
                aria-label="Describe your symptoms"
              />
              <Button 
                onClick={handleConsultySubmit}
                disabled={!symptoms.trim()}
                className="mt-2 bg-[#769382] text-white hover:bg-[#769382]/90 shadow-lg px-6 py-3 text-base font-semibold"
                size="lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Ask Consulty
              </Button>
            </div>
          </div>
          
          {/* Consulty Robot Image */}
          <div className="hidden lg:block w-48 h-48 flex-shrink-0">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Consulty%20AI%20Robot.png-06mGlgpODX9iZuCiwFkaHZT4PuQbRr.jpeg"
              alt="Consulty AI Assistant"
              className="w-full h-full object-contain"
              style={{ background: 'transparent' }}
            />
          </div>
        </div>
      </section>

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <section className="bg-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Upcoming Appointments</h2>
            <Link 
              href="/patient/calendar"
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingAppointments.map((apt) => {
              const doctor = doctors.find(d => d.id === apt.doctorId);
              return (
                <div 
                  key={apt.id}
                  className="flex items-center gap-4 p-4 bg-muted rounded-xl"
                >
                  <div className="w-12 h-12 rounded-full bg-accent overflow-hidden flex-shrink-0">
                    {doctor?.avatar ? (
                      <img 
                        src={doctor.avatar} 
                        alt={doctor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Stethoscope size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {doctor?.name || "Doctor"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {doctor?.specialty} • {apt.date} at {apt.time}
                    </p>
                  </div>
                  <Link
                    href={`/patient/appointments/${apt.id}`}
                    className="text-sm text-primary hover:underline flex-shrink-0"
                  >
                    View Details
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
