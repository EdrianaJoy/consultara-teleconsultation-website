/**
 * ConsulTara TeleConsultation Platform - Patient Registration Page
 * 
 * Collects necessary patient profile information after role selection.
 * Includes personal details, emergency contact, weight, height, and medical history.
 */

'use client';

import { useEffect, useState } from 'react';
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
  const { user, isLoading: authLoading, completeRegistration } = useAuth();
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

  const formatRegistrationError = (error: unknown) => {
    const reason = error instanceof Error ? error.message.trim() : '';
    if (!reason) {
      return 'Registration failed. Please try again.';
    }

    return reason.startsWith('Registration failed.') ? reason : `Registration failed. ${reason}`;
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/auth/signup');
    }
  }, [user, authLoading, router]);

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
      if (!formData.address || !formData.city || !formData.state || !formData.emergencyContact || !formData.emergencyPhone) {
        toast.error('Please fill in all required fields');
        return;
      }
    } else if (currentStep === 3) {
      if (!formData.weight || !formData.height) {
        toast.error('Please fill in weight and height');
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
    } catch (error) {
      toast.error(formatRegistrationError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Contact & Address', icon: MapPin },
    { number: 3, title: 'Body Metrics', icon: Scale },
    { number: 4, title: 'Medical History', icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-ivory py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col items-center mb-8">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ConsulTara%20Logo-oqtBESzen2QQnxkVKzgc7RxAQEbHnb.png"
            alt="ConsulTara Logo"
            width={60}
            height={60}
            className="mb-3"
          />
          <h1 className="text-xl font-semibold text-sage">ConsulTara</h1>
          <p className="text-foreground/70 mt-2">Complete your patient profile</p>
        </div>

        <div className="flex items-center justify-center mb-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`flex items-center gap-2 ${currentStep >= step.number ? 'text-sage' : 'text-mist'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                  currentStep >= step.number 
                    ? 'bg-sage border-sage text-white' 
                    : 'border-mist text-mist'
                }`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <span className="hidden sm:block text-sm font-medium">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 sm:w-12 h-0.5 mx-2 ${currentStep > step.number ? 'bg-sage' : 'bg-mist'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-foreground">Personal Information</h2>
                <p className="text-sm text-foreground/70">Tell us about yourself</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-foreground">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => updateFormData('firstName', e.target.value)}
                    placeholder="Enter your first name"
                    className="h-11 border-mist focus:border-sage"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-foreground">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => updateFormData('lastName', e.target.value)}
                    placeholder="Enter your last name"
                    className="h-11 border-mist focus:border-sage"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    placeholder="+63 9XX XXX XXXX"
                    className="h-11 border-mist focus:border-sage"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob" className="text-foreground">Date of Birth *</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                    className="h-11 border-mist focus:border-sage"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="text-foreground">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => updateFormData('gender', value)}
                >
                  <SelectTrigger className="h-11 border-mist focus:border-sage">
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

          {/* Step 2: Contact & Address */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-foreground">Contact & Address</h2>
                <p className="text-sm text-foreground/70">Where can we reach you?</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-foreground">Street Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateFormData('address', e.target.value)}
                  placeholder="123 Main Street, Barangay"
                  className="h-11 border-mist focus:border-sage"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-foreground">City *</Label>
                  <Select
                    value={formData.city}
                    onValueChange={(value) => updateFormData('city', value)}
                  >
                    <SelectTrigger className="h-11 border-mist focus:border-sage">
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
                  <Label htmlFor="state" className="text-foreground">Province/Region *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => updateFormData('state', e.target.value)}
                    placeholder="Metro Manila"
                    className="h-11 border-mist focus:border-sage"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode" className="text-foreground">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => updateFormData('zipCode', e.target.value)}
                    placeholder="1200"
                    className="h-11 border-mist focus:border-sage"
                  />
                </div>
              </div>

              <div className="border-t border-[#C0C3B9] pt-6">
                <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-sage" />
                  Emergency Contact
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact" className="text-foreground">Contact Name *</Label>
                    <Input
                      id="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={(e) => updateFormData('emergencyContact', e.target.value)}
                      placeholder="Emergency contact name"
                      className="h-11 border-mist focus:border-sage"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone" className="text-foreground">Contact Phone *</Label>
                    <Input
                      id="emergencyPhone"
                      type="tel"
                      value={formData.emergencyPhone}
                      onChange={(e) => updateFormData('emergencyPhone', e.target.value)}
                      placeholder="+63 9XX XXX XXXX"
                      className="h-11 border-mist focus:border-sage"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Body Metrics (Weight & Height) */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-foreground">Body Metrics</h2>
                <p className="text-sm text-foreground/70">This helps doctors provide better care</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-foreground flex items-center gap-2">
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
                    className="h-11 border-mist focus:border-sage"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-foreground flex items-center gap-2">
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
                    className="h-11 border-mist focus:border-sage"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bloodType" className="text-foreground">Blood Type</Label>
                <Select
                  value={formData.bloodType || ''}
                  onValueChange={(value) => updateFormData('bloodType', value)}
                >
                  <SelectTrigger className="h-11 border-mist focus:border-sage">
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

              <div className="bg-cream/30 rounded-lg p-4">
                <p className="text-sm text-foreground/70">
                  Your weight and height help calculate your BMI and assist doctors in prescribing appropriate medication dosages.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Medical History */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-foreground">Medical History</h2>
                <p className="text-sm text-foreground/70">Help us understand your health better</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="basicMedicalHistory" className="text-foreground">Basic Medical History *</Label>
                <Textarea
                  id="basicMedicalHistory"
                  value={formData.basicMedicalHistory}
                  onChange={(e) => updateFormData('basicMedicalHistory', e.target.value)}
                  placeholder="Please describe any past surgeries, hospitalizations, chronic conditions, or significant medical events..."
                  className="min-h-28 border-mist focus:border-sage resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies" className="text-foreground">Known Allergies</Label>
                <Textarea
                  id="allergies"
                  value={allergiesText}
                  onChange={(e) => setAllergiesText(e.target.value)}
                  placeholder="List any allergies, separated by commas (e.g., Penicillin, Peanuts, Shellfish)"
                  className="min-h-20 border-mist focus:border-sage resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="conditions" className="text-foreground">Existing Medical Conditions</Label>
                <Textarea
                  id="conditions"
                  value={conditionsText}
                  onChange={(e) => setConditionsText(e.target.value)}
                  placeholder="List any existing conditions, separated by commas (e.g., Diabetes, Hypertension, Asthma)"
                  className="min-h-20 border-mist focus:border-sage resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medications" className="text-foreground">Current Medications</Label>
                <Textarea
                  id="medications"
                  value={medicationsText}
                  onChange={(e) => setMedicationsText(e.target.value)}
                  placeholder="List current medications with dosage, separated by commas (e.g., Metformin 500mg, Lisinopril 10mg)"
                  className="min-h-20 border-mist focus:border-sage resize-none"
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
