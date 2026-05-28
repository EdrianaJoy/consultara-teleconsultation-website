/**
 * Our Services Page
 * 
 * Displays all available medical services and departments.
 * 
 * @module app/patient/services/page
 */

"use client";

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
  Clock
} from "lucide-react";
import { DEPARTMENTS, doctors } from "@/lib/data";

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
  "Surgery": <Scissors size={32} />,
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
 * Services Page Component
 */
export default function ServicesPage() {
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

      {/* Departments */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Medical Departments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DEPARTMENTS.map((dept) => {
            const doctorCount = doctors.filter(d => d.specialty === dept).length;
            return (
              <Link
                key={dept}
                href={`/patient/search?specialty=${encodeURIComponent(dept)}`}
                className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-shadow"
              >
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                    {departmentIcons[dept] || <Pill size={32} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-lg">{dept}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {departmentDescriptions[dept]}
                    </p>
                    <p className="text-sm text-primary mt-2">
                      {doctorCount} doctor{doctorCount !== 1 ? "s" : ""} available
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
