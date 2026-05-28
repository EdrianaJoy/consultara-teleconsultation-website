/**
 * Doctor Profile Page
 * 
 * Allows doctors to view and edit their profile information,
 * specialization, bio, and availability settings.
 * 
 * @module app/doctor/profile/page
 */

"use client";

import { useState } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Award,
  Save,
  CheckCircle,
  Camera
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Doctor Profile Page Component
 */
export default function DoctorProfilePage() {
  const { user, updateDoctorProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: (user as any)?.firstName || "",
    lastName: (user as any)?.lastName || "",
    email: user?.email || "",
    phone: (user as any)?.phone || "",
    specialization: (user as any)?.specialization || "",
    department: (user as any)?.department || "",
    licenseNumber: (user as any)?.licenseNumber || "",
    yearsOfExperience: (user as any)?.yearsOfExperience || 0,
    education: (user as any)?.education || "",
    bio: (user as any)?.bio || "",
    consultationFee: (user as any)?.consultationFee || 100,
    languages: (user as any)?.languages?.join(", ") || "English",
    address: (user as any)?.address || "",
  });

  /**
   * Handle input changes
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      updateDoctorProfile({
        ...formData,
        languages: formData.languages.split(",").map(l => l.trim()),
        yearsOfExperience: Number(formData.yearsOfExperience),
        consultationFee: Number(formData.consultationFee),
      });
    }

    setIsSaving(false);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const departments = [
    "Cardiology",
    "Dermatology",
    "Pediatrics",
    "Neurology",
    "Orthopedics",
    "Gynecology",
    "Ophthalmology",
    "Psychiatry",
    "General Medicine",
    "ENT",
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
                {(user as any)?.avatar ? (
                  <img 
                    src={(user as any).avatar} 
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
              <button
                type="button"
                className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
                aria-label="Change profile picture"
              >
                <Camera size={16} />
              </button>
            </div>
            <div>
              <p className="font-medium text-foreground">
                Dr. {formData.firstName} {formData.lastName}
              </p>
              <p className="text-sm text-muted-foreground">{formData.specialization}</p>
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
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">
                Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder="Enter address"
                />
              </div>
            </div>
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
                  <option key={dept} value={dept.toLowerCase().replace(" ", "-")}>
                    {dept}
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
                License Number
              </label>
              <div className="relative">
                <Award className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder="Enter license number"
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
                Consultation Fee ($)
              </label>
              <Input
                name="consultationFee"
                type="number"
                min="0"
                value={formData.consultationFee}
                onChange={handleChange}
                placeholder="Enter fee"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Languages (comma separated)
              </label>
              <Input
                name="languages"
                value={formData.languages}
                onChange={handleChange}
                placeholder="e.g., English, Spanish"
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
                placeholder="e.g., MD from Johns Hopkins University"
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
          </div>
        </div>
      </form>
    </div>
  );
}
