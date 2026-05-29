/**
 * Doctor Profile Page
 * 
 * Allows doctors to view and edit their profile information,
 * specialization, bio, and availability settings.
 * 
 * @module app/doctor/profile/page
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Award,
  Save,
  CheckCircle,
  Camera,
  Upload,
  Clock,
  Plus,
  Trash2
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { WeeklySchedule } from "@/lib/types";

/**
 * Doctor Profile Page Component
 */
export default function DoctorProfilePage() {
  const { user, doctorProfile, updateDoctorProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultSchedule: WeeklySchedule = {
    monday: { isWorkingDay: true, slots: [{ startTime: "09:00", endTime: "17:00", isAvailable: true }] },
    tuesday: { isWorkingDay: true, slots: [{ startTime: "09:00", endTime: "17:00", isAvailable: true }] },
    wednesday: { isWorkingDay: true, slots: [{ startTime: "09:00", endTime: "17:00", isAvailable: true }] },
    thursday: { isWorkingDay: true, slots: [{ startTime: "09:00", endTime: "17:00", isAvailable: true }] },
    friday: { isWorkingDay: true, slots: [{ startTime: "09:00", endTime: "17:00", isAvailable: true }] },
    saturday: { isWorkingDay: false, slots: [] },
    sunday: { isWorkingDay: false, slots: [] },
  };

  // Form state - initialize from doctorProfile
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialization: "",
    department: "",
    licenseNumber: "",
    yearsOfExperience: 0,
    education: "",
    bio: "",
    consultationFee: 500,
    languages: "English, Filipino",
    location: "Metro Manila",
    acceptsInsurance: true,
  });
  const [availability, setAvailability] = useState<WeeklySchedule>(defaultSchedule);

  // Load profile data on mount and when doctorProfile changes
  useEffect(() => {
    if (doctorProfile) {
      setFormData({
        firstName: doctorProfile.firstName || "",
        lastName: doctorProfile.lastName || "",
        email: doctorProfile.email || user?.email || "",
        phone: doctorProfile.phone || "",
        specialization: doctorProfile.specialization || "",
        department: doctorProfile.department || "",
        licenseNumber: doctorProfile.licenseNumber || "",
        yearsOfExperience: doctorProfile.yearsOfExperience || 0,
        education: doctorProfile.education || "",
        bio: doctorProfile.bio || "",
        consultationFee: doctorProfile.consultationFee || 500,
        languages: doctorProfile.languages?.join(", ") || "English, Filipino",
        location: doctorProfile.location || "Metro Manila",
        acceptsInsurance: doctorProfile.acceptsInsurance ?? true,
      });
      setAvailability(doctorProfile.availability || defaultSchedule);
    }
  }, [doctorProfile, user]);

  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

  const toggleWorkingDay = (day: typeof days[number]) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        isWorkingDay: !prev[day].isWorkingDay,
        slots: !prev[day].isWorkingDay ? (prev[day].slots.length > 0 ? prev[day].slots : [{ startTime: "09:00", endTime: "17:00", isAvailable: true }]) : prev[day].slots,
      },
    }));
  };

  const updateTimeSlot = (day: typeof days[number], index: number, field: "startTime" | "endTime", value: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.map((slot, slotIndex) => slotIndex === index ? { ...slot, [field]: value } : slot),
      },
    }));
  };

  const addTimeSlot = (day: typeof days[number]) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        isWorkingDay: true,
        slots: [...prev[day].slots, { startTime: "09:00", endTime: "17:00", isAvailable: true }],
      },
    }));
  };

  const removeTimeSlot = (day: typeof days[number], index: number) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.filter((_, slotIndex) => slotIndex !== index),
        isWorkingDay: prev[day].slots.length > 1 ? prev[day].isWorkingDay : false,
      },
    }));
  };

  /**
   * Handle input changes
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
    }));
  };

  /**
   * Handle profile picture upload
   */
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Save avatar to profile
        if (updateDoctorProfile) {
          void updateDoctorProfile({ avatar: base64String });
          toast.success('Profile picture updated!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update user profile
    if (updateDoctorProfile) {
      await updateDoctorProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        specialization: formData.specialization,
        department: formData.department as any,
        licenseNumber: formData.licenseNumber,
        yearsOfExperience: Number(formData.yearsOfExperience),
        education: formData.education,
        bio: formData.bio,
        consultationFee: Number(formData.consultationFee),
        languages: formData.languages.split(",").map(l => l.trim()),
        location: formData.location,
        acceptsInsurance: formData.acceptsInsurance,
        availability,
      });
    }

    setIsSaving(false);
    setSavedMessage(true);
    toast.success('Profile saved successfully!');
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const departments = [
    { id: "cardiology", name: "Cardiology" },
    { id: "dermatology", name: "Dermatology" },
    { id: "pediatrics", name: "Pediatrics" },
    { id: "neurology", name: "Neurology" },
    { id: "orthopedics", name: "Orthopedics" },
    { id: "gynecology", name: "Gynecology" },
    { id: "ophthalmology", name: "Ophthalmology" },
    { id: "psychiatry", name: "Psychiatry" },
    { id: "general-medicine", name: "General Medicine" },
    { id: "ent", name: "ENT" },
  ];

  const metroManilaLocations = [
    "Makati City",
    "Quezon City",
    "Manila",
    "Taguig City",
    "Pasig City",
    "Mandaluyong City",
    "San Juan City",
    "Parañaque City",
    "Pasay City",
    "Muntinlupa City",
    "Las Piñas City",
    "Marikina City",
    "Caloocan City",
    "Valenzuela City",
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your professional profile and settings.
          </p>
        </div>
        <Button 
          onClick={handleSubmit} 
          disabled={isSaving}
          className="min-w-[120px]"
        >
          {isSaving ? (
            "Saving..."
          ) : savedMessage ? (
            <>
              <CheckCircle size={18} className="mr-2" />
              Saved!
            </>
          ) : (
            <>
              <Save size={18} className="mr-2" />
              Save Profile
            </>
          )}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture Section */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Profile Picture</h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-accent overflow-hidden flex items-center justify-center">
                {doctorProfile?.avatar ? (
                  <img 
                    src={doctorProfile.avatar} 
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
              <button
                type="button"
                onClick={handleAvatarClick}
                className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
                aria-label="Change profile picture"
              >
                <Camera size={16} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            <div>
              <p className="font-medium text-foreground">
                Dr. {formData.firstName} {formData.lastName}
              </p>
              <p className="text-sm text-muted-foreground">{formData.specialization}</p>
              <button
                type="button"
                onClick={handleAvatarClick}
                className="flex items-center gap-2 mt-2 text-sm text-primary hover:underline"
              >
                <Upload size={14} />
                Upload new picture
              </button>
              <p className="text-xs text-muted-foreground mt-1">
                Recommended: Square image, at least 200x200 pixels
              </p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                First Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder="Enter first name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Last Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder="Enter email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder="+63 9XX XXX XXXX"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground"
                >
                  <option value="">Select Location</option>
                  {metroManilaLocations.map(loc => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Availability Schedule</h2>
              <p className="text-sm text-muted-foreground">Set the days and hours patients can book you.</p>
            </div>
            <Clock className="text-muted-foreground" />
          </div>

          <div className="space-y-3">
            {days.map((day) => (
              <div key={day} className="rounded-lg border border-border p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <label className="flex items-center gap-3 text-sm font-medium text-foreground capitalize">
                    <input
                      type="checkbox"
                      checked={availability[day].isWorkingDay}
                      onChange={() => toggleWorkingDay(day)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    />
                    {day}
                  </label>

                  {availability[day].isWorkingDay ? (
                    <div className="flex flex-wrap items-center gap-2">
                      {availability[day].slots.map((slot, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => updateTimeSlot(day, index, "startTime", e.target.value)}
                            className="w-28"
                          />
                          <span className="text-xs text-muted-foreground">to</span>
                          <Input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => updateTimeSlot(day, index, "endTime", e.target.value)}
                            className="w-28"
                          />
                          {availability[day].slots.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTimeSlot(day, index)}
                              className="p-2 rounded-md text-destructive hover:bg-destructive/10"
                              aria-label={`Remove ${day} slot`}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={() => addTimeSlot(day)}>
                        <Plus size={16} className="mr-2" />
                        Add Slot
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Unavailable</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Professional Information */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Professional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Specialization
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder="e.g., Interventional Cardiology"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                License Number (PRC)
              </label>
              <div className="relative">
                <Award className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder="e.g., PRC-0123456"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Years of Experience
              </label>
              <Input
                name="yearsOfExperience"
                type="number"
                min="0"
                value={formData.yearsOfExperience}
                onChange={handleChange}
                placeholder="Enter years of experience"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Consultation Fee (PHP)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                  ₱
                </span>
                <Input
                  name="consultationFee"
                  type="number"
                  min="0"
                  value={formData.consultationFee}
                  onChange={handleChange}
                  placeholder="Enter fee in Pesos"
                  className="pl-8"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Languages (comma separated)
              </label>
              <Input
                name="languages"
                value={formData.languages}
                onChange={handleChange}
                placeholder="e.g., English, Filipino, Mandarin"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">
                Education & Certifications
              </label>
              <Input
                name="education"
                value={formData.education}
                onChange={handleChange}
                placeholder="e.g., MD from UP Manila, Fellowship at Philippine Heart Center"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Write a brief professional bio..."
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
              <input
                type="checkbox"
                name="acceptsInsurance"
                id="acceptsInsurance"
                checked={formData.acceptsInsurance}
                onChange={handleChange}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="acceptsInsurance" className="text-sm font-medium text-foreground">
                I accept health insurance
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
