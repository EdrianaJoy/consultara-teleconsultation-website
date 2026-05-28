/**
 * Our Services Page
 * 
 * Displays all available medical services and departments with doctors.
 * Shows doctor cards with full details: name, specialty, location, insurance, experience, consultation fee, reviews.
 * 
 * @module app/patient/services/page
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { 
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
  Video,
  MessageSquare,
  FileText,
  Clock,
  Star,
  MapPin,
  Shield,
  Search
} from "lucide-react";
import { DEPARTMENTS, doctors, departments } from "@/lib/data";
import { DoctorProfile } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * Department icons mapping
 */
const departmentIcons: Record<string, React.ReactNode> = {
  "Cardiology": <Heart size={32} />,
  "Neurology": <Brain size={32} />,
  "Ophthalmology": <Eye size={32} />,
  "Orthopedics": <Bone size={32} />,
  "Pediatrics": <Baby size={32} />,
  "Dermatology": <Smile size={32} />,
  "General Medicine": <Pill size={32} />,
  "Gynecology": <Activity size={32} />,
  "Psychiatry": <Microscope size={32} />,
  "ENT": <Scissors size={32} />,
};

/**
 * Department descriptions
 */
const departmentDescriptions: Record<string, string> = {
  "Cardiology": "Heart and cardiovascular system specialists treating conditions like heart disease, hypertension, and arrhythmias.",
  "Neurology": "Brain and nervous system experts addressing migraines, epilepsy, stroke, and neurological disorders.",
  "Ophthalmology": "Eye care specialists for vision problems, cataracts, glaucoma, and other eye conditions.",
  "Orthopedics": "Bone, joint, and muscle specialists treating fractures, arthritis, and sports injuries.",
  "Pediatrics": "Child healthcare experts providing comprehensive care for infants, children, and adolescents.",
  "Dermatology": "Skin, hair, and nail specialists treating acne, eczema, psoriasis, and skin conditions.",
  "General Medicine": "Primary care physicians for routine checkups, preventive care, and common illnesses.",
  "Gynecology": "Women's health specialists for reproductive health, pregnancy care, and hormonal management.",
  "Psychiatry": "Mental health experts treating depression, anxiety, PTSD, and other psychiatric conditions.",
  "ENT": "Ear, nose, and throat specialists treating hearing loss, sinusitis, voice disorders, and related conditions.",
};

/**
 * Doctor Card Component with all required information
 */
function DoctorCard({ doctor }: { doctor: DoctorProfile }) {
  const fullName = `Dr. ${doctor.firstName} ${doctor.lastName}`;
  
  return (
    <Link
      href={`/patient/doctors/${doctor.id}`}
      className="bg-card rounded-xl p-4 hover:shadow-lg transition-all border border-border group"
    >
      <div className="flex gap-4">
        {/* Doctor Avatar */}
        <div className="w-20 h-20 rounded-xl bg-accent overflow-hidden flex-shrink-0">
          {doctor.avatar ? (
            <img 
              src={doctor.avatar} 
              alt={fullName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-2xl font-bold">
              {doctor.firstName.charAt(0)}{doctor.lastName.charAt(0)}
            </div>
          )}
        </div>

        {/* Doctor Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {fullName}
          </h3>
          <p className="text-sm text-primary font-medium">{doctor.specialization}</p>
          
          {/* Rating */}
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-foreground">{doctor.rating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">
              ({doctor.totalReviews} reviews)
            </span>
          </div>
          
          {/* Location */}
          <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
            <MapPin size={14} className="flex-shrink-0" />
            <span className="truncate">{doctor.location || 'Metro Manila'}</span>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-4 space-y-2">
        <div className="flex flex-wrap gap-2">
          <span className="px-2 py-1 bg-muted rounded-full text-xs text-muted-foreground">
            {doctor.yearsOfExperience} years exp.
          </span>
          <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
            ₱{doctor.consultationFee.toLocaleString()} per session
          </span>
        </div>
        
        {/* Insurance Status */}
        <div className="flex items-center gap-2">
          <Shield size={14} className={doctor.acceptsInsurance ? "text-green-600" : "text-muted-foreground"} />
          <span className={`text-xs ${doctor.acceptsInsurance ? "text-green-600" : "text-muted-foreground"}`}>
            {doctor.acceptsInsurance ? "Accepts Health Insurance" : "No Insurance Accepted"}
          </span>
        </div>
      </div>

      {/* Book Button */}
      <Button className="w-full mt-4 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
        Book Consultation
      </Button>
    </Link>
  );
}

/**
 * Services Page Component
 */
export default function ServicesPage() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Get department name from ID
  const getDeptNameFromId = (deptId: string): string => {
    const dept = departments.find(d => d.id === deptId);
    return dept?.name || deptId;
  };

  // Filter doctors based on department and search
  const filteredDoctors = doctors.filter(doctor => {
    // Department filter
    if (selectedDepartment) {
      const deptName = getDeptNameFromId(doctor.department);
      if (deptName !== selectedDepartment) return false;
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const fullName = `${doctor.firstName} ${doctor.lastName}`.toLowerCase();
      return fullName.includes(query) || 
             doctor.specialization.toLowerCase().includes(query) ||
             (doctor.location?.toLowerCase().includes(query));
    }
    
    return true;
  });

  // Get doctors count per department
  const getDoctorCountForDept = (deptName: string): number => {
    return doctors.filter(d => getDeptNameFromId(d.department) === deptName).length;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Our Services</h1>
        <p className="text-muted-foreground">
          Comprehensive healthcare services available through video consultations and chat.
        </p>
      </div>

      {/* Service Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
            <Video className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Video Consultations</h3>
          <p className="text-sm text-muted-foreground">
            Face-to-face consultations with doctors from the comfort of your home.
          </p>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
            <MessageSquare className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Chat Consultations</h3>
          <p className="text-sm text-muted-foreground">
            Quick text-based consultations for non-urgent medical questions.
          </p>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Digital Prescriptions</h3>
          <p className="text-sm text-muted-foreground">
            Receive prescriptions electronically after your consultation.
          </p>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">24/7 Availability</h3>
          <p className="text-sm text-muted-foreground">
            Access healthcare services any time, day or night.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <Input
          type="text"
          placeholder="Search doctors by name, specialty, or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Departments */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Medical Departments</h2>
        
        {/* Department Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedDepartment("")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !selectedDepartment 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            All Departments ({doctors.length})
          </button>
          {DEPARTMENTS.map((dept) => {
            const count = getDoctorCountForDept(dept);
            return (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept === selectedDepartment ? "" : dept)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedDepartment === dept 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {dept} ({count})
              </button>
            );
          })}
        </div>

        {/* Selected Department Description */}
        {selectedDepartment && (
          <div className="bg-card rounded-xl p-6 border border-border mb-6">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                {departmentIcons[selectedDepartment] || <Pill size={32} />}
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-lg">{selectedDepartment}</h3>
                <p className="text-muted-foreground mt-1">
                  {departmentDescriptions[selectedDepartment]}
                </p>
                <p className="text-sm text-primary mt-2 font-medium">
                  {getDoctorCountForDept(selectedDepartment)} doctors available
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <p className="text-muted-foreground mb-4">
          Showing {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? "s" : ""}
          {selectedDepartment && ` in ${selectedDepartment}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>

        {/* Doctors Grid */}
        {filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDoctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <Pill className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No doctors found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or selecting a different department.
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSelectedDepartment("");
                setSearchQuery("");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
