/**
 * ConsulTara TeleConsultation Platform - Patient Registration Page
 * 
 * Collects necessary patient profile information after role selection.
 * Includes personal details, emergency contact, weight, height, and medical history.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, User, Phone, MapPin, Heart, Scale, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import type { PatientProfile } from '@/lib/types';

type Step = 1 | 2 | 3 | 4;

export default function PatientRegistrationPage() {
  const router = useRouter();
  const { user, completeRegistration } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<PatientProfile>>({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    gender: 'prefer-not-to-say',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    emergencyContact: '',
    emergencyPhone: '',
    weight: '',
    height: '',
    bloodType: '',
    allergies: [],
    medicalConditions: [],
    currentMedications: [],
    basicMedicalHistory: '',
  });

  const [allergiesText, setAllergiesText] = useState('');
  const [conditionsText, setConditionsText] = useState('');
  const [medicationsText, setMedicationsText] = useState('');

  const updateFormData = (field: keyof PatientProfile, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.firstName || !formData.lastName || !formData.phone || !formData.dateOfBirth) {
        toast.error('Please fill in all required fields');
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.weight || !formData.height) {
        toast.error('Please fill in weight and height');
        return;
      }
    } else if (currentStep === 3) {
      if (!formData.address || !formData.city || !formData.state || !formData.emergencyContact || !formData.emergencyPhone) {
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
      // Parse comma-separated values into arrays
      const profileData: Partial<PatientProfile> = {
        ...formData,
        allergies: allergiesText.split(',').map(s => s.trim()).filter(Boolean),
        medicalConditions: conditionsText.split(',').map(s => s.trim()).filter(Boolean),
        currentMedications: medicationsText.split(',').map(s => s.trim()).filter(Boolean),
      };

      await completeRegistration(profileData);
      toast.success('Registration complete!');
      router.push('/patient/dashboard');
    } catch {
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Body Metrics', icon: Scale },
    { number: 3, title: 'Contact & Address', icon: MapPin },
    { number: 4, title: 'Medical History', icon: Heart },
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
          <p className="text-[#2D3B35]/70 mt-2">Complete your patient profile</p>
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
                <div className={`w-8 sm:w-12 h-0.5 mx-2 ${currentStep > step.number ? 'bg-[#769382]' : 'bg-[#C0C3B9]'}`} />
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

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[#2D3B35]">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    placeholder="+63 9XX XXX XXXX"
                    className="h-11 border-[#C0C3B9] focus:border-[#769382]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob" className="text-[#2D3B35]">Date of Birth *</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                    className="h-11 border-[#C0C3B9] focus:border-[#769382]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="text-[#2D3B35]">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => updateFormData('gender', value)}
                >
                  <SelectTrigger className="h-11 border-[#C0C3B9] focus:border-[#769382]">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2: Body Metrics (Weight & Height) */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-[#2D3B35]">Body Metrics</h2>
                <p className="text-sm text-[#2D3B35]/70">This helps doctors provide better care</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-[#2D3B35] flex items-center gap-2">
                    <Scale className="w-4 h-4" />
                    Weight (kg) *
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    min="1"
                    max="500"
                    value={formData.weight}
                    onChange={(e) => updateFormData('weight', e.target.value)}
                    placeholder="e.g., 65"
                    className="h-11 border-[#C0C3B9] focus:border-[#769382]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-[#2D3B35] flex items-center gap-2">
                    <Ruler className="w-4 h-4" />
                    Height (cm) *
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    min="50"
                    max="300"
                    value={formData.height}
                    onChange={(e) => updateFormData('height', e.target.value)}
                    placeholder="e.g., 170"
                    className="h-11 border-[#C0C3B9] focus:border-[#769382]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bloodType" className="text-[#2D3B35]">Blood Type</Label>
                <Select
                  value={formData.bloodType || ''}
                  onValueChange={(value) => updateFormData('bloodType', value)}
                >
                  <SelectTrigger className="h-11 border-[#C0C3B9] focus:border-[#769382]">
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-[#FFEBBC]/30 rounded-lg p-4">
                <p className="text-sm text-[#2D3B35]/70">
                  Your weight and height help calculate your BMI and assist doctors in prescribing appropriate medication dosages.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Contact & Address */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-[#2D3B35]">Contact & Address</h2>
                <p className="text-sm text-[#2D3B35]/70">Where can we reach you?</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-[#2D3B35]">Street Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateFormData('address', e.target.value)}
                  placeholder="123 Main Street, Barangay"
                  className="h-11 border-[#C0C3B9] focus:border-[#769382]"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-[#2D3B35]">City *</Label>
                  <Select
                    value={formData.city}
                    onValueChange={(value) => updateFormData('city', value)}
                  >
                    <SelectTrigger className="h-11 border-[#C0C3B9] focus:border-[#769382]">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Makati City">Makati City</SelectItem>
                      <SelectItem value="Quezon City">Quezon City</SelectItem>
                      <SelectItem value="Manila">Manila</SelectItem>
                      <SelectItem value="Taguig City">Taguig City</SelectItem>
                      <SelectItem value="Pasig City">Pasig City</SelectItem>
                      <SelectItem value="Mandaluyong City">Mandaluyong City</SelectItem>
                      <SelectItem value="San Juan City">San Juan City</SelectItem>
                      <SelectItem value="Parañaque City">Parañaque City</SelectItem>
                      <SelectItem value="Pasay City">Pasay City</SelectItem>
                      <SelectItem value="Muntinlupa City">Muntinlupa City</SelectItem>
                      <SelectItem value="Las Piñas City">Las Piñas City</SelectItem>
                      <SelectItem value="Marikina City">Marikina City</SelectItem>
                      <SelectItem value="Caloocan City">Caloocan City</SelectItem>
                      <SelectItem value="Valenzuela City">Valenzuela City</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-[#2D3B35]">Province/Region *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => updateFormData('state', e.target.value)}
                    placeholder="Metro Manila"
                    className="h-11 border-[#C0C3B9] focus:border-[#769382]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode" className="text-[#2D3B35]">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => updateFormData('zipCode', e.target.value)}
                    placeholder="1200"
                    className="h-11 border-[#C0C3B9] focus:border-[#769382]"
                  />
                </div>
              </div>

              <div className="border-t border-[#C0C3B9] pt-6">
                <h3 className="text-lg font-medium text-[#2D3B35] mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-[#769382]" />
                  Emergency Contact
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact" className="text-[#2D3B35]">Contact Name *</Label>
                    <Input
                      id="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={(e) => updateFormData('emergencyContact', e.target.value)}
                      placeholder="Emergency contact name"
                      className="h-11 border-[#C0C3B9] focus:border-[#769382]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone" className="text-[#2D3B35]">Contact Phone *</Label>
                    <Input
                      id="emergencyPhone"
                      type="tel"
                      value={formData.emergencyPhone}
                      onChange={(e) => updateFormData('emergencyPhone', e.target.value)}
                      placeholder="+63 9XX XXX XXXX"
                      className="h-11 border-[#C0C3B9] focus:border-[#769382]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Medical History */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-[#2D3B35]">Medical History</h2>
                <p className="text-sm text-[#2D3B35]/70">Help us understand your health better</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="basicMedicalHistory" className="text-[#2D3B35]">Basic Medical History *</Label>
                <Textarea
                  id="basicMedicalHistory"
                  value={formData.basicMedicalHistory}
                  onChange={(e) => updateFormData('basicMedicalHistory', e.target.value)}
                  placeholder="Please describe any past surgeries, hospitalizations, chronic conditions, or significant medical events..."
                  className="min-h-28 border-[#C0C3B9] focus:border-[#769382] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies" className="text-[#2D3B35]">Known Allergies</Label>
                <Textarea
                  id="allergies"
                  value={allergiesText}
                  onChange={(e) => setAllergiesText(e.target.value)}
                  placeholder="List any allergies, separated by commas (e.g., Penicillin, Peanuts, Shellfish)"
                  className="min-h-20 border-[#C0C3B9] focus:border-[#769382] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="conditions" className="text-[#2D3B35]">Existing Medical Conditions</Label>
                <Textarea
                  id="conditions"
                  value={conditionsText}
                  onChange={(e) => setConditionsText(e.target.value)}
                  placeholder="List any existing conditions, separated by commas (e.g., Diabetes, Hypertension, Asthma)"
                  className="min-h-20 border-[#C0C3B9] focus:border-[#769382] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medications" className="text-[#2D3B35]">Current Medications</Label>
                <Textarea
                  id="medications"
                  value={medicationsText}
                  onChange={(e) => setMedicationsText(e.target.value)}
                  placeholder="List current medications with dosage, separated by commas (e.g., Metformin 500mg, Lisinopril 10mg)"
                  className="min-h-20 border-[#C0C3B9] focus:border-[#769382] resize-none"
                />
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

            {currentStep < 4 ? (
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
