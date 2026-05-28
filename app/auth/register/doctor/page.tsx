/**
 * ConsulTara TeleConsultation Platform - Doctor Registration Page
 * 
 * Collects necessary doctor profile information after role selection.
 * Includes professional details, credentials, and availability setup.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, User, Briefcase, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import type { DoctorProfile, Department, WeeklySchedule } from '@/lib/types';
import { departments } from '@/lib/data';

type Step = 1 | 2 | 3;

const defaultSchedule: WeeklySchedule = {
  monday: { isWorkingDay: true, slots: [{ startTime: '09:00', endTime: '17:00', isAvailable: true }] },
  tuesday: { isWorkingDay: true, slots: [{ startTime: '09:00', endTime: '17:00', isAvailable: true }] },
  wednesday: { isWorkingDay: true, slots: [{ startTime: '09:00', endTime: '17:00', isAvailable: true }] },
  thursday: { isWorkingDay: true, slots: [{ startTime: '09:00', endTime: '17:00', isAvailable: true }] },
  friday: { isWorkingDay: true, slots: [{ startTime: '09:00', endTime: '17:00', isAvailable: true }] },
  saturday: { isWorkingDay: false, slots: [] },
  sunday: { isWorkingDay: false, slots: [] },
};

export default function DoctorRegistrationPage() {
  const router = useRouter();
  const { completeRegistration } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<DoctorProfile>>({
    firstName: '',
    lastName: '',
    phone: '',
    specialization: '',
    department: 'general-medicine',
    licenseNumber: '',
    yearsOfExperience: 0,
    education: '',
    bio: '',
    consultationFee: 100,
    languages: ['English'],
    availability: defaultSchedule,
    isAvailable: true,
  });

  const [languagesText, setLanguagesText] = useState('English');
  const [workingDays, setWorkingDays] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  });

  const updateFormData = (field: keyof DoctorProfile, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.firstName || !formData.lastName || !formData.phone) {
        toast.error('Please fill in all required fields');
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.licenseNumber || !formData.specialization || !formData.education) {
        toast.error('Please fill in all required fields');
        return;
      }
    }
    setCurrentStep((prev) => (prev + 1) as Step);
  };

  const handleBack = () => {
    setCurrentStep((prev) => (prev - 1) as Step);
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      // Build availability schedule based on working days
      const availability: WeeklySchedule = {
        monday: { 
          isWorkingDay: workingDays.monday, 
          slots: workingDays.monday ? [{ startTime: '09:00', endTime: '17:00', isAvailable: true }] : [] 
        },
        tuesday: { 
          isWorkingDay: workingDays.tuesday, 
          slots: workingDays.tuesday ? [{ startTime: '09:00', endTime: '17:00', isAvailable: true }] : [] 
        },
        wednesday: { 
          isWorkingDay: workingDays.wednesday, 
          slots: workingDays.wednesday ? [{ startTime: '09:00', endTime: '17:00', isAvailable: true }] : [] 
        },
        thursday: { 
          isWorkingDay: workingDays.thursday, 
          slots: workingDays.thursday ? [{ startTime: '09:00', endTime: '17:00', isAvailable: true }] : [] 
        },
        friday: { 
          isWorkingDay: workingDays.friday, 
          slots: workingDays.friday ? [{ startTime: '09:00', endTime: '17:00', isAvailable: true }] : [] 
        },
        saturday: { 
          isWorkingDay: workingDays.saturday, 
          slots: workingDays.saturday ? [{ startTime: '09:00', endTime: '13:00', isAvailable: true }] : [] 
        },
        sunday: { 
          isWorkingDay: workingDays.sunday, 
          slots: workingDays.sunday ? [{ startTime: '09:00', endTime: '13:00', isAvailable: true }] : [] 
        },
      };

      const profileData: Partial<DoctorProfile> = {
        ...formData,
        languages: languagesText.split(',').map(s => s.trim()).filter(Boolean),
        availability,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.firstName}${formData.lastName}`,
        rating: 0,
        totalReviews: 0,
      };

      completeRegistration(profileData);
      toast.success('Registration complete!');
      router.push('/doctor/dashboard');
    } catch {
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Professional', icon: Briefcase },
    { number: 3, title: 'Availability', icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-[#F3EFE3] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ConsulTara%20Logo-oqtBESzen2QQnxkVKzgc7RxAQEbHnb.png"
            alt="ConsulTara Logo"
            width={60}
            height={60}
            className="mb-3"
          />
          <h1 className="text-xl font-semibold text-[#769382]">ConsulTara</h1>
          <p className="text-[#2D3B35]/70 mt-2">Complete your doctor profile</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`flex items-center gap-2 ${currentStep >= step.number ? 'text-[#769382]' : 'text-[#C0C3B9]'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                  currentStep >= step.number 
                    ? 'bg-[#769382] border-[#769382] text-white' 
                    : 'border-[#C0C3B9] text-[#C0C3B9]'
                }`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <span className="hidden sm:block text-sm font-medium">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 sm:w-20 h-0.5 mx-2 ${currentStep > step.number ? 'bg-[#769382]' : 'bg-[#C0C3B9]'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-[#2D3B35]">Personal Information</h2>
                <p className="text-sm text-[#2D3B35]/70">Tell us about yourself</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-[#2D3B35]">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => updateFormData('firstName', e.target.value)}
                    placeholder="Enter your first name"
                    className="h-11 border-[#C0C3B9] focus:border-[#769382]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-[#2D3B35]">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => updateFormData('lastName', e.target.value)}
                    placeholder="Enter your last name"
                    className="h-11 border-[#C0C3B9] focus:border-[#769382]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-[#2D3B35]">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="h-11 border-[#C0C3B9] focus:border-[#769382]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-[#2D3B35]">Professional Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => updateFormData('bio', e.target.value)}
                  placeholder="Tell patients about yourself, your experience, and approach to care..."
                  className="min-h-24 border-[#C0C3B9] focus:border-[#769382] resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 2: Professional Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-[#2D3B35]">Professional Details</h2>
                <p className="text-sm text-[#2D3B35]/70">Your credentials and expertise</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenseNumber" className="text-[#2D3B35]">Medical License Number *</Label>
                <Input
                  id="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={(e) => updateFormData('licenseNumber', e.target.value)}
                  placeholder="e.g., MD-123456"
                  className="h-11 border-[#C0C3B9] focus:border-[#769382]"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-[#2D3B35]">Department *</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => updateFormData('department', value as Department)}
                  >
                    <SelectTrigger className="h-11 border-[#C0C3B9] focus:border-[#769382]">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization" className="text-[#2D3B35]">Specialization *</Label>
                  <Input
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) => updateFormData('specialization', e.target.value)}
                    placeholder="e.g., Interventional Cardiology"
                    className="h-11 border-[#C0C3B9] focus:border-[#769382]"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-[#2D3B35]">Years of Experience *</Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    value={formData.yearsOfExperience}
                    onChange={(e) => updateFormData('yearsOfExperience', parseInt(e.target.value) || 0)}
                    className="h-11 border-[#C0C3B9] focus:border-[#769382]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fee" className="text-[#2D3B35]">Consultation Fee ($)</Label>
                  <Input
                    id="fee"
                    type="number"
                    min="0"
                    value={formData.consultationFee}
                    onChange={(e) => updateFormData('consultationFee', parseInt(e.target.value) || 0)}
                    className="h-11 border-[#C0C3B9] focus:border-[#769382]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="education" className="text-[#2D3B35]">Education & Certifications *</Label>
                <Textarea
                  id="education"
                  value={formData.education}
                  onChange={(e) => updateFormData('education', e.target.value)}
                  placeholder="e.g., MD from Harvard Medical School, Cardiology Fellowship at Mayo Clinic"
                  className="min-h-20 border-[#C0C3B9] focus:border-[#769382] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="languages" className="text-[#2D3B35]">Languages Spoken</Label>
                <Input
                  id="languages"
                  value={languagesText}
                  onChange={(e) => setLanguagesText(e.target.value)}
                  placeholder="English, Spanish, Mandarin (comma-separated)"
                  className="h-11 border-[#C0C3B9] focus:border-[#769382]"
                />
              </div>
            </div>
          )}

          {/* Step 3: Availability */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-[#2D3B35]">Availability</h2>
                <p className="text-sm text-[#2D3B35]/70">Set your working days</p>
              </div>

              <div className="space-y-4">
                <Label className="text-[#2D3B35] font-medium">Working Days</Label>
                <p className="text-sm text-[#2D3B35]/60">
                  Select the days you&apos;re available for consultations. You can adjust specific time slots later.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).map((day) => (
                    <div
                      key={day}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        workingDays[day]
                          ? 'border-[#769382] bg-[#769382]/10'
                          : 'border-[#C0C3B9] bg-white'
                      }`}
                      onClick={() => setWorkingDays(prev => ({ ...prev, [day]: !prev[day] }))}
                    >
                      <Checkbox
                        checked={workingDays[day]}
                        onCheckedChange={(checked) => 
                          setWorkingDays(prev => ({ ...prev, [day]: checked as boolean }))
                        }
                        className="data-[state=checked]:bg-[#769382] data-[state=checked]:border-[#769382]"
                      />
                      <span className="text-sm font-medium text-[#2D3B35] capitalize">{day}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#FFEBBC]/30 rounded-lg p-4">
                <h4 className="font-medium text-[#2D3B35] mb-2">Default Hours</h4>
                <p className="text-sm text-[#2D3B35]/70">
                  Weekdays: 9:00 AM - 5:00 PM<br />
                  Weekends: 9:00 AM - 1:00 PM (if selected)
                </p>
                <p className="text-xs text-[#2D3B35]/50 mt-2">
                  You can customize specific time slots from your dashboard after registration.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-[#C0C3B9]">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="border-[#C0C3B9] text-[#2D3B35] hover:bg-[#C0C3B9]/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push('/auth/select-role')}
                className="text-[#2D3B35]/70"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Change Role
              </Button>
            )}

            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="bg-[#769382] hover:bg-[#769382]/90 text-white"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-[#769382] hover:bg-[#769382]/90 text-white"
              >
                {isLoading ? 'Completing...' : 'Complete Registration'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
