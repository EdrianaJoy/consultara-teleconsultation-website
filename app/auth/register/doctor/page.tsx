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
import { ArrowLeft, ArrowRight, User, Briefcase, Clock, MapPin } from 'lucide-react';
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

type Step = 1 | 2 | 3 | 4;

const metroManilaLocations = [
  'Makati City',
  'Quezon City',
  'Manila',
  'Taguig City',
  'Pasig City',
  'Mandaluyong City',
  'San Juan City',
  'Parañaque City',
  'Pasay City',
  'Muntinlupa City',
  'Las Piñas City',
  'Marikina City',
  'Caloocan City',
  'Valenzuela City',
];

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

  const inputClass = 'h-12 rounded-lg border border-[#e6e6e6] px-4 placeholder-[#9aa69a] focus:border-[#6b8f79] focus:ring-0';

  // Form state
  const [formData, setFormData] = useState<Partial<DoctorProfile> & { dateOfBirth?: string }>({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    specialization: '',
    department: 'general-medicine',
    licenseNumber: '',
    yearsOfExperience: 0,
    education: '',
    bio: '',
    consultationFee: 500,
    languages: ['English', 'Filipino'],
    availability: defaultSchedule,
    isAvailable: true,
    location: 'Makati City',
    acceptsInsurance: true,
  });

  const [languagesText, setLanguagesText] = useState('English, Filipino');
  const [workingDays, setWorkingDays] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  });
  const [timeSlots, setTimeSlots] = useState({
    monday: { start: '09:00', end: '17:00' },
    tuesday: { start: '09:00', end: '17:00' },
    wednesday: { start: '09:00', end: '17:00' },
    thursday: { start: '09:00', end: '17:00' },
    friday: { start: '09:00', end: '17:00' },
    saturday: { start: '09:00', end: '13:00' },
    sunday: { start: '09:00', end: '13:00' },
  });

  const formatRegistrationError = (error: unknown) => {
    const reason = error instanceof Error ? error.message.trim() : '';
    if (!reason) {
      return 'Registration failed. Please try again.';
    }

    return reason.startsWith('Registration failed.') ? reason : `Registration failed. ${reason}`;
  };

  const updateFormData = (field: keyof DoctorProfile, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.firstName || !formData.lastName || !formData.phone) {
        toast.error('Please fill in all required fields');
        return;
      }
      // Validate date of birth (minimum age 17)
      if (!formData.dateOfBirth) {
        toast.error('Please enter your date of birth');
        return;
      }
      const dob = new Date(formData.dateOfBirth);
      if (Number.isNaN(dob.getTime())) {
        toast.error('Invalid date of birth');
        return;
      }
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear() - (today < new Date(dob.getFullYear() + (today.getFullYear() - dob.getFullYear()), dob.getMonth(), dob.getDate()) ? 1 : 0);
      // Simple age calc: compare year difference and adjust
      const ageYears = Math.floor((today.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
      if (ageYears < 17) {
        toast.error('You must be at least 17 years old to register');
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.licenseNumber || !formData.specialization || !formData.education) {
        toast.error('Please fill in all required fields');
        return;
      }
      // Validate PRC license format (e.g., PRC-0123456)
      const license = String(formData.licenseNumber || '').trim().toUpperCase();
      const prcRegex = /^PRC-\d{6,7}$/; // allow 6 or 7 digits
      if (!prcRegex.test(license)) {
        toast.error('PRC license number must be in the format PRC-0123456');
        return;
      }
      updateFormData('licenseNumber', license);
    } else if (currentStep === 3) {
      if (!formData.location) {
        toast.error('Please select your location');
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
      // Build availability schedule based on working days and time slots
      const availability: WeeklySchedule = {
        monday: { 
          isWorkingDay: workingDays.monday, 
          slots: workingDays.monday ? [{ startTime: timeSlots.monday.start, endTime: timeSlots.monday.end, isAvailable: true }] : [] 
        },
        tuesday: { 
          isWorkingDay: workingDays.tuesday, 
          slots: workingDays.tuesday ? [{ startTime: timeSlots.tuesday.start, endTime: timeSlots.tuesday.end, isAvailable: true }] : [] 
        },
        wednesday: { 
          isWorkingDay: workingDays.wednesday, 
          slots: workingDays.wednesday ? [{ startTime: timeSlots.wednesday.start, endTime: timeSlots.wednesday.end, isAvailable: true }] : [] 
        },
        thursday: { 
          isWorkingDay: workingDays.thursday, 
          slots: workingDays.thursday ? [{ startTime: timeSlots.thursday.start, endTime: timeSlots.thursday.end, isAvailable: true }] : [] 
        },
        friday: { 
          isWorkingDay: workingDays.friday, 
          slots: workingDays.friday ? [{ startTime: timeSlots.friday.start, endTime: timeSlots.friday.end, isAvailable: true }] : [] 
        },
        saturday: { 
          isWorkingDay: workingDays.saturday, 
          slots: workingDays.saturday ? [{ startTime: timeSlots.saturday.start, endTime: timeSlots.saturday.end, isAvailable: true }] : [] 
        },
        sunday: { 
          isWorkingDay: workingDays.sunday, 
          slots: workingDays.sunday ? [{ startTime: timeSlots.sunday.start, endTime: timeSlots.sunday.end, isAvailable: true }] : [] 
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

      await completeRegistration(profileData);
      toast.success('Registration complete!');
      router.push('/doctor/dashboard');
    } catch (error) {
      toast.error(formatRegistrationError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Professional', icon: Briefcase },
    { number: 3, title: 'Location', icon: MapPin },
    { number: 4, title: 'Availability', icon: Clock },
  ];

  const progressPercent = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-[#f3efe6] pt-14 pb-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <Image
            src="/professional-doctors/doc-007.svg"
            alt="ConsulTara emblem"
            width={84}
            height={84}
            className="mb-4"
          />
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#6b8f79]">ConsulTara</h1>
          <p className="text-sm text-[#2D3B35]/60 mt-2">Complete your doctor profile</p>
        </div>

        {/* Progress Steps */}
        <div className="w-full max-w-2xl mx-auto mb-8">
          <div className="relative flex items-center justify-center gap-6">
            {/* Left active chip */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#6b8f79] text-white">
                <User className="w-5 h-5" />
              </div>
              <div className="text-sm text-[#6b8f79] font-medium">Personal Info</div>
            </div>

            {/* Progress connectors and remaining steps */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <div className="h-1 rounded-full bg-[#e6e6e6]" />
                <div className="absolute left-0 top-0 h-1 rounded-full bg-[#6b8f79]" style={{ width: `${progressPercent}%` }} />
                <div className="flex items-center justify-between mt-3">
                  {steps.map((step, i) => (
                    <div key={step.number} className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${currentStep > step.number ? 'bg-[#6b8f79] border-[#6b8f79] text-white' : 'border-[#e6e6e6] text-[#9aa69a]'}`}>
                        <step.icon className="w-4 h-4" />
                      </div>
                      <span className="mt-2 text-xs text-[#2D3B35]/60">{step.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-lg p-8 sm:p-12 border border-[#f0ede9] max-w-3xl mx-auto">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-[#23302c]">Personal Information</h2>
                <p className="text-sm text-[#2D3B35]/60">Tell us about yourself</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-[#2D3B35]">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => updateFormData('firstName', e.target.value)}
                    placeholder="Enter your first name"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-[#2D3B35]">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => updateFormData('lastName', e.target.value)}
                    placeholder="Enter your last name"
                    className={inputClass}
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
                  placeholder="+63 9XX XXX XXXX"
                  className={inputClass}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-[#2D3B35]">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth || ''}
                  onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-[#2D3B35]">Professional Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => updateFormData('bio', e.target.value)}
                  placeholder="Tell patients about yourself, your experience, and approach to care..."
                  className={`min-h-24 resize-none ${inputClass}`}
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
                <Label htmlFor="licenseNumber" className="text-[#2D3B35]">PRC License Number *</Label>
                <Input
                  id="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={(e) => updateFormData('licenseNumber', e.target.value)}
                  placeholder="e.g., PRC-0123456"
                  className="h-11 border-mist focus:border-sage"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-[#2D3B35]">Department *</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => updateFormData('department', value as Department)}
                  >
                    <SelectTrigger className="h-11 border-mist focus:border-sage">
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
                    className="h-11 border-mist focus:border-sage"
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
                    className="h-11 border-mist focus:border-sage"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fee" className="text-[#2D3B35]">Consultation Fee (PHP)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2D3B35]/70 font-medium">
                      ₱
                    </span>
                    <Input
                      id="fee"
                      type="number"
                      min="0"
                      value={formData.consultationFee}
                      onChange={(e) => updateFormData('consultationFee', parseInt(e.target.value) || 0)}
                      className="h-11 border-mist focus:border-sage pl-8"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="education" className="text-[#2D3B35]">Education & Certifications *</Label>
                <Textarea
                  id="education"
                  value={formData.education}
                  onChange={(e) => updateFormData('education', e.target.value)}
                  placeholder="e.g., MD from UP Manila, Cardiology Fellowship at Philippine Heart Center"
                  className="min-h-20 border-mist focus:border-sage resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="languages" className="text-[#2D3B35]">Languages Spoken</Label>
                <Input
                  id="languages"
                  value={languagesText}
                  onChange={(e) => setLanguagesText(e.target.value)}
                  placeholder="English, Filipino, Mandarin (comma-separated)"
                  className="h-11 border-mist focus:border-sage"
                />
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-[#2D3B35]">Practice Location</h2>
                <p className="text-sm text-[#2D3B35]/70">Where are you based in Metro Manila?</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-[#2D3B35]">Location *</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) => updateFormData('location', value)}
                >
                  <SelectTrigger className="h-11 border-mist focus:border-sage">
                    <SelectValue placeholder="Select your location" />
                  </SelectTrigger>
                  <SelectContent>
                    {metroManilaLocations.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  id="acceptsInsurance"
                  checked={formData.acceptsInsurance}
                  onCheckedChange={(checked) => updateFormData('acceptsInsurance', checked)}
                  className="data-[state=checked]:bg-sage data-[state=checked]:border-sage"
                />
                <Label htmlFor="acceptsInsurance" className="text-[#2D3B35] cursor-pointer">
                  I accept health insurance (HMO, PhilHealth, etc.)
                </Label>
              </div>

              <div className="bg-cream/30 rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2">About Your Location</h4>
                <p className="text-sm text-foreground/70">
                  This helps patients find doctors near them. You can also provide teleconsultation services to patients anywhere in Metro Manila.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Availability */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-[#2D3B35]">Availability Schedule</h2>
                <p className="text-sm text-[#2D3B35]/70">Set your available days and time slots</p>
              </div>

              <div className="space-y-4">
                <Label className="text-[#2D3B35] font-medium">Working Days & Hours</Label>
                <p className="text-sm text-[#2D3B35]/60">
                  Select the days you are available and set your working hours. You can adjust these later in your profile.
                </p>

                <div className="space-y-3">
                  {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).map((day) => (
                    <div
                      key={day}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        workingDays[day]
                          ? 'border-sage bg-sage/10'
                          : 'border-mist bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={workingDays[day]}
                            onCheckedChange={(checked) => 
                              setWorkingDays(prev => ({ ...prev, [day]: checked as boolean }))
                            }
                            className="data-[state=checked]:bg-sage data-[state=checked]:border-sage"
                          />
                          <span className="text-sm font-medium text-foreground capitalize">{day}</span>
                        </div>
                        {workingDays[day] && (
                          <div className="flex items-center gap-2">
                            <Input
                              type="time"
                              value={timeSlots[day].start}
                              onChange={(e) => setTimeSlots(prev => ({
                                ...prev,
                                [day]: { ...prev[day], start: e.target.value }
                              }))}
                              className="w-28 h-9 text-sm border-mist"
                            />
                            <span className="text-foreground/60">to</span>
                            <Input
                              type="time"
                              value={timeSlots[day].end}
                              onChange={(e) => setTimeSlots(prev => ({
                                ...prev,
                                [day]: { ...prev[day], end: e.target.value }
                              }))}
                              className="w-28 h-9 text-sm border-mist"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-cream/30 rounded-lg p-4">
                <p className="text-sm text-foreground/70">
                  These are your default hours. Patients will be able to book appointments during these times. You can customize specific time slots from your dashboard after registration.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-mist">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="border-mist text-foreground hover:bg-mist/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push('/auth/select-role')}
                className="text-foreground/70"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Change Role
              </Button>
            )}

            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="bg-sage hover:bg-sage/90 text-white"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-sage hover:bg-sage/90 text-white"
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
