/**
 * Patient Profile Page
 * 
 * Displays and allows editing of patient profile information.
 * 
 * @module app/patient/profile/page
 */

"use client";

import { useState } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit2, 
  Save,
  X,
  Camera
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { PatientUser } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Patient Profile Page Component
 */
export default function PatientProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const patient = user as PatientUser | null;
  
  const [formData, setFormData] = useState({
    firstName: patient?.firstName || "",
    lastName: patient?.lastName || "",
    email: patient?.email || "",
    phone: patient?.phone || "",
    dateOfBirth: patient?.dateOfBirth || "",
    gender: patient?.gender || "",
    address: patient?.address || "",
    emergencyContact: patient?.emergencyContact || "",
    bloodType: patient?.bloodType || "",
    allergies: patient?.allergies?.join(", ") || "",
  });

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  /**
   * Handle input change
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /**
   * Handle save profile
   */
  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    updateUser({
      ...formData,
      allergies: formData.allergies.split(",").map(a => a.trim()).filter(Boolean),
    });
    
    setIsSaving(false);
    setIsEditing(false);
  };

  /**
   * Handle cancel edit
   */
  const handleCancel = () => {
    setFormData({
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email,
      phone: patient.phone || "",
      dateOfBirth: patient.dateOfBirth || "",
      gender: patient.gender || "",
      address: patient.address || "",
      emergencyContact: patient.emergencyContact || "",
      bloodType: patient.bloodType || "",
      allergies: patient.allergies?.join(", ") || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information and medical details.
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit2 size={18} className="mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              <X size={18} className="mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save size={18} className="mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </div>

      {/* Profile Header */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-accent overflow-hidden">
              {patient.avatar ? (
                <img 
                  src={patient.avatar} 
                  alt={`${patient.firstName} ${patient.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl text-muted-foreground">
                  {patient.firstName?.charAt(0)}{patient.lastName?.charAt(0)}
                </div>
              )}
            </div>
            {isEditing && (
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                <Camera size={16} />
              </button>
            )}
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-semibold text-foreground">
              {patient.firstName} {patient.lastName}
            </h2>
            <p className="text-muted-foreground">{patient.email}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Patient ID: {patient.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Personal Information</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              First Name
            </label>
            {isEditing ? (
              <Input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
            ) : (
              <p className="text-muted-foreground">{patient.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Last Name
            </label>
            {isEditing ? (
              <Input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            ) : (
              <p className="text-muted-foreground">{patient.lastName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Email Address
            </label>
            {isEditing ? (
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            ) : (
              <p className="text-muted-foreground">{patient.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Phone Number
            </label>
            {isEditing ? (
              <Input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
              />
            ) : (
              <p className="text-muted-foreground">{patient.phone || "Not provided"}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Date of Birth
            </label>
            {isEditing ? (
              <Input
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            ) : (
              <p className="text-muted-foreground">
                {patient.dateOfBirth 
                  ? new Date(patient.dateOfBirth).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Not provided"
                }
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Gender
            </label>
            {isEditing ? (
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            ) : (
              <p className="text-muted-foreground capitalize">{patient.gender || "Not provided"}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1">
              Address
            </label>
            {isEditing ? (
              <Input
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            ) : (
              <p className="text-muted-foreground">{patient.address || "Not provided"}</p>
            )}
          </div>
        </div>
      </div>

      {/* Medical Information */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Medical Information</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Blood Type
            </label>
            {isEditing ? (
              <select
                name="bloodType"
                value={formData.bloodType}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
              >
                <option value="">Select blood type</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            ) : (
              <p className="text-muted-foreground">{patient.bloodType || "Not provided"}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Emergency Contact
            </label>
            {isEditing ? (
              <Input
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                placeholder="Name - Phone number"
              />
            ) : (
              <p className="text-muted-foreground">{patient.emergencyContact || "Not provided"}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1">
              Allergies
            </label>
            {isEditing ? (
              <textarea
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                placeholder="Enter allergies separated by commas"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground resize-none h-20"
              />
            ) : (
              <p className="text-muted-foreground">
                {patient.allergies?.length 
                  ? patient.allergies.join(", ")
                  : "None reported"
                }
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
