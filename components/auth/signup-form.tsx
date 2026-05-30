'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, EyeOff, ArrowLeft, ArrowRight, User, Stethoscope, MapPin, Heart, Scale, Phone, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

type Step = 'role' | 'credentials' | 'profile-1' | 'profile-2' | 'profile-3' | 'profile-4' | 'profile';
type Role = 'patient' | 'doctor';

export type SignUpFormProps = {
  initialRole?: Role;
};

export default function SignUpForm({ initialRole }: SignUpFormProps) {
  const router = useRouter();
  const { register } = useAuth();

  const [step, setStep] = useState<Step>(initialRole === 'patient' ? 'credentials' : initialRole ? 'credentials' : 'role');
  const [role, setRole] = useState<Role | null>(initialRole ?? null);
  const [pendingProfileData, setPendingProfileData] = useState<Record<string, unknown> | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('prefer-not-to-say');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [barangay, setBarangay] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [basicMedicalHistory, setBasicMedicalHistory] = useState('');
  const [allergiesText, setAllergiesText] = useState('');
  const [conditionsText, setConditionsText] = useState('');
  const [medicationsText, setMedicationsText] = useState('');

  const [specialization, setSpecialization] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [education, setEducation] = useState('');

  const roleLabel = role === 'doctor' ? 'Doctor' : 'Patient';

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const validatePhone = (value: string) => /^(\+63|0)9\d{9}$/.test(value.replace(/\s/g, ''));
  const validateName = (value: string) => /^[A-Za-z\s\-']+$/.test(value) && value.length >= 2;
  const isPatientSignup = initialRole === 'patient';
  const patientWizardSteps = [
    { key: 'credentials', title: 'Account Details', icon: ArrowRight },
    { key: 'profile-1', title: 'Personal Info', icon: User },
    { key: 'profile-2', title: 'Contact & Address', icon: MapPin },
    { key: 'profile-3', title: 'Body Metrics', icon: Scale },
    { key: 'profile-4', title: 'Medical History', icon: Heart },
  ] as const;
  const patientStepIndex = patientWizardSteps.findIndex((wizardStep) => wizardStep.key === step);

  const buildPatientProfileData = () => ({
    firstName,
    lastName,
    phone,
    dateOfBirth,
    gender: gender as 'male' | 'female' | 'other' | 'prefer-not-to-say',
    address,
    city,
    state,
    zipCode,
    barangay,
    emergencyContact,
    emergencyPhone,
    weight,
    height,
    bloodType,
    basicMedicalHistory,
    allergies: allergiesText.split(',').map((value) => value.trim()).filter(Boolean),
    medicalConditions: conditionsText.split(',').map((value) => value.trim()).filter(Boolean),
    currentMedications: medicationsText.split(',').map((value) => value.trim()).filter(Boolean),
  });

  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole);
    setStep('credentials');
  };

  const handleNext = async () => {
    if (step === 'profile-1') {
      if (!validateName(firstName)) {
        toast.error('Please enter a valid first name (letters only)');
        return;
      }

      if (!validateName(lastName)) {
        toast.error('Please enter a valid last name (letters only)');
        return;
      }

      if (!validatePhone(phone)) {
        toast.error('Please enter a valid Philippine mobile number (e.g., 09171234567)');
        return;
      }

      if (!dateOfBirth) {
        toast.error('Please enter your date of birth');
        return;
      }

      if (!gender) {
        toast.error('Please select your gender');
        return;
      }

      setStep('profile-2');
      return;
    }

    if (step === 'profile-2') {
      if (!address.trim()) {
        toast.error('Please enter your street address');
        return;
      }

      if (!city) {
        toast.error('Please select your city');
        return;
      }

      if (!state.trim()) {
        toast.error('Please enter your province or region');
        return;
      }

      if (!zipCode.trim()) {
        toast.error('Please enter your ZIP code');
        return;
      }

      if (!emergencyContact.trim()) {
        toast.error('Please enter your emergency contact name');
        return;
      }

      if (!validatePhone(emergencyPhone)) {
        toast.error('Please enter a valid emergency contact number');
        return;
      }

      setStep('profile-3');
      return;
    }

    if (step === 'profile-3') {
      if (!weight.trim() || Number(weight) <= 0) {
        toast.error('Please enter a valid weight');
        return;
      }

      if (!height.trim() || Number(height) <= 0) {
        toast.error('Please enter a valid height');
        return;
      }

      setStep('profile-4');
      return;
    }

    if (step === 'profile-4') {
      if (!basicMedicalHistory.trim()) {
        toast.error('Please enter your basic medical history');
        return;
      }

      const profileData = buildPatientProfileData();
      setIsLoading(true);
      try {
        const result = await register(email, password, 'patient', profileData as any);
        if (!result.success) {
          toast.error(result.error || 'Registration failed');
          return;
        }
        toast.success('Account created successfully!');
        router.push('/patient/dashboard');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Registration failed');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step === 'profile-1') {
      setStep('credentials');
      return;
    }

    if (step === 'profile-2') {
      setStep('profile-1');
      return;
    }

    if (step === 'profile-3') {
      setStep('profile-2');
      return;
    }

    if (step === 'profile-4') {
      setStep('profile-3');
      return;
    }

    if (step === 'credentials') {
      router.push('/auth/select-role');
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (role === 'doctor' || initialRole === 'doctor') {
      setStep('profile');
      return;
    }

    // Move to the first patient profile step; registration will occur after profiles are complete.
    setStep('profile-1');
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateName(firstName)) {
      toast.error('Please enter a valid first name (letters only)');
      return;
    }

    if (!validateName(lastName)) {
      toast.error('Please enter a valid last name (letters only)');
      return;
    }

    if (!validatePhone(phone)) {
      toast.error('Please enter a valid Philippine mobile number (e.g., 09171234567)');
      return;
    }

    if (!dateOfBirth) {
      toast.error('Please enter your date of birth');
      return;
    }

    if (!gender) {
      toast.error('Please select your gender');
      return;
    }

    if (!city) {
      toast.error('Please select your city');
      return;
    }

    if (role === 'doctor') {
      const license = licenseNumber.trim().toUpperCase();
      if (!specialization) {
        toast.error('Please select your specialization');
        return;
      }
      if (!/^PRC-\d{6,7}$/.test(license)) {
        toast.error('PRC license number must be in the format PRC-0123456');
        return;
      }
      if (!yearsOfExperience || isNaN(Number(yearsOfExperience)) || Number(yearsOfExperience) < 0) {
        toast.error('Please enter valid years of experience');
        return;
      }
      if (!consultationFee || isNaN(Number(consultationFee)) || Number(consultationFee) < 0) {
        toast.error('Please enter a valid consultation fee');
        return;
      }
    }

    setIsLoading(true);
    try {
      const profileData = role === 'patient'
        ? {
            firstName,
            lastName,
            phone,
            dateOfBirth,
            gender: gender as 'male' | 'female' | 'other' | 'prefer-not-to-say',
            address,
            city,
            state,
            zipCode: '',
            barangay,
            emergencyContact,
            emergencyPhone,
          }
        : {
            firstName,
            lastName,
            phone,
            dateOfBirth,
            gender: gender as 'male' | 'female' | 'other' | 'prefer-not-to-say',
            address,
            city,
            state,
            zipCode: '',
            barangay,
            emergencyContact,
            emergencyPhone,
            specialization,
            licenseNumber: licenseNumber.trim().toUpperCase(),
            yearsOfExperience: Number(yearsOfExperience),
            consultationFee: Number(consultationFee),
            education,
          };

      if (role === 'patient' && initialRole === 'patient' && !pendingProfileData) {
        setPendingProfileData(profileData as Record<string, unknown>);
        setStep('credentials');
        return;
      }

      const result = await register(email, password, role!, profileData as any);
      if (!result.success) {
        toast.error(result.error || 'Registration failed');
        return;
      }
      toast.success('Account created successfully!');
      router.push(role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const metroManilaCities = [
    'Caloocan', 'Las Piñas', 'Makati', 'Malabon', 'Mandaluyong', 'Manila', 'Marikina',
    'Muntinlupa', 'Navotas', 'Parañaque', 'Pasay', 'Pasig', 'Pateros', 'Quezon City',
    'San Juan', 'Taguig', 'Valenzuela',
  ];

  const departments = [
    'Cardiology', 'Dermatology', 'Pediatrics', 'Neurology', 'Orthopedics',
    'Gynecology', 'Ophthalmology', 'Psychiatry', 'General Medicine', 'ENT',
  ];

  const inputClass = 'h-12 bg-white border-[#C0C3B9] focus:border-[#769382] focus:ring-[#769382] rounded-lg';
  const selectTriggerClass = 'h-12 border-[#C0C3B9] focus:border-[#769382] rounded-lg';
  const textareaClass = 'min-h-20 border-[#C0C3B9] focus:border-[#769382] rounded-lg resize-none';

  const patientMode = initialRole === 'patient';

  return isPatientSignup ? (
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
          {patientWizardSteps.map((wizardStep, index) => {
            const isActive = patientStepIndex >= index;
            const StepIcon = wizardStep.icon;

            return (
              <div key={wizardStep.key} className="flex items-center">
                <div className={`flex items-center gap-2 ${isActive ? 'text-sage' : 'text-mist'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${isActive ? 'bg-sage border-sage text-white' : 'border-mist text-mist'}`}>
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium">{wizardStep.title}</span>
                </div>
                {index < patientWizardSteps.length - 1 && (
                  <div className={`w-8 sm:w-12 h-0.5 mx-2 ${patientStepIndex > index ? 'bg-sage' : 'bg-mist'}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          {step === 'profile-1' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-foreground">Personal Information</h2>
                <p className="text-sm text-foreground/70">Tell us about yourself</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-foreground">First Name *</Label>
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Enter your first name" className="h-11 border-mist focus:border-sage" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-foreground">Last Name *</Label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Enter your last name" className="h-11 border-mist focus:border-sage" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">Phone Number *</Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+63 9XX XXX XXXX" className="h-11 border-mist focus:border-sage" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob" className="text-foreground">Date of Birth *</Label>
                  <Input id="dob" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="h-11 border-mist focus:border-sage" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="text-foreground">Gender</Label>
                <Select value={gender} onValueChange={(value) => setGender(value)}>
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

              <div className="flex justify-between pt-2">
                <Button type="button" variant="ghost" onClick={() => router.push('/auth/select-role')} className="text-foreground/70">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Change Role
                </Button>
                <Button type="button" onClick={handleNext} className="bg-sage hover:bg-sage/90 text-white">
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 'profile-2' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-foreground">Contact & Address</h2>
                <p className="text-sm text-foreground/70">Where can we reach you?</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-foreground">Street Address *</Label>
                <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Hello St." className="h-11 border-mist focus:border-sage" />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-foreground">City *</Label>
                  <Select value={city} onValueChange={setCity}>
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
                  <Input id="state" value={state} onChange={(e) => setState(e.target.value)} placeholder="Metro Manila" className="h-11 border-mist focus:border-sage" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode" className="text-foreground">ZIP Code *</Label>
                  <Input id="zipCode" value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="1243" className="h-11 border-mist focus:border-sage" />
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
                    <Input id="emergencyContact" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} placeholder="Emergency Contact Name" className="h-11 border-mist focus:border-sage" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone" className="text-foreground">Contact Phone *</Label>
                    <Input id="emergencyPhone" type="tel" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} placeholder="09123456789" className="h-11 border-mist focus:border-sage" />
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <Button type="button" variant="outline" onClick={handleBack} className="border-mist">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button type="button" onClick={handleNext} className="bg-sage hover:bg-sage/90 text-white">
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 'profile-3' && (
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
                  <Input id="weight" type="number" min="1" max="500" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="65" className="h-11 border-mist focus:border-sage" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-foreground flex items-center gap-2">
                    <Ruler className="w-4 h-4" />
                    Height (cm) *
                  </Label>
                  <Input id="height" type="number" min="50" max="300" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="175" className="h-11 border-mist focus:border-sage" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bloodType" className="text-foreground">Blood Type</Label>
                <Select value={bloodType} onValueChange={setBloodType}>
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
                <p className="text-sm text-foreground/70">Your weight and height help calculate your BMI and assist doctors in prescribing appropriate medication dosages.</p>
              </div>

              <div className="flex justify-between pt-2">
                <Button type="button" variant="outline" onClick={handleBack} className="border-mist">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button type="button" onClick={handleNext} className="bg-sage hover:bg-sage/90 text-white">
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 'profile-4' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-foreground">Medical History</h2>
                <p className="text-sm text-foreground/70">Help us understand your health better</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="basicMedicalHistory" className="text-foreground">Basic Medical History *</Label>
                <Textarea id="basicMedicalHistory" value={basicMedicalHistory} onChange={(e) => setBasicMedicalHistory(e.target.value)} placeholder="Please describe any past surgeries, hospitalizations, chronic conditions, or significant medical events..." className="min-h-28 border-mist focus:border-sage resize-none" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies" className="text-foreground">Known Allergies</Label>
                <Textarea id="allergies" value={allergiesText} onChange={(e) => setAllergiesText(e.target.value)} placeholder="List any allergies, separated by commas (e.g., Penicillin, Peanuts, Shellfish)" className="min-h-20 border-mist focus:border-sage resize-none" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="conditions" className="text-foreground">Existing Medical Conditions</Label>
                <Textarea id="conditions" value={conditionsText} onChange={(e) => setConditionsText(e.target.value)} placeholder="List any existing conditions, separated by commas (e.g., Diabetes, Hypertension, Asthma)" className="min-h-20 border-mist focus:border-sage resize-none" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medications" className="text-foreground">Current Medications</Label>
                <Textarea id="medications" value={medicationsText} onChange={(e) => setMedicationsText(e.target.value)} placeholder="List current medications with dosage, separated by commas (e.g., Metformin 500mg, Lisinopril 10mg)" className="min-h-20 border-mist focus:border-sage resize-none" />
              </div>

              <div className="flex justify-between pt-2">
                <Button type="button" variant="outline" onClick={handleBack} className="border-mist">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button type="button" onClick={handleNext} className="bg-sage hover:bg-sage/90 text-white">
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 'credentials' && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-foreground">Account Details</h2>
                <p className="text-sm text-foreground/70">Create your login credentials</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email Address</Label>
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 border-mist focus:border-sage" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">Password</Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 border-mist focus:border-sage pr-12" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-11 border-mist focus:border-sage" required />
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={handleBack} className="flex-1 h-12 border-mist">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1 h-12 bg-sage hover:bg-sage/90 text-white">
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  ) : (
    <div className="min-h-screen bg-ivory py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col items-center mb-8">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ConsulTara%20Logo-oqtBESzen2QQnxkVKzgc7RxAQEbHnb.png"
            alt="ConsulTara Logo"
            width={72}
            height={72}
            className="mb-2"
          />
          <h1 className="text-2xl font-semibold text-[#769382]">ConsulTara</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          {step === 'role' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-[#2D3B35] mb-2">Create Your Account</h2>
                <p className="text-[#2D3B35]/70">Choose your role to get started</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <button
                  type="button"
                  onClick={() => router.push('/auth/register/patient')}
                  className="group relative p-6 rounded-xl border-2 border-[#C0C3B9] hover:border-[#769382] bg-white hover:bg-[#769382]/5 transition-all duration-300 text-left"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-[#FFEBBC]/50 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#FFEBBC] transition-colors">
                      <User className="w-10 h-10 text-[#769382]" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#2D3B35] mb-2">I&apos;m a Patient</h3>
                    <p className="text-sm text-[#2D3B35]/70 mb-4">Book appointments, consult with doctors, and manage your health records.</p>
                    <div className="flex items-center text-[#769382] font-medium">Continue as Patient <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => router.push('/auth/register/doctor')}
                  className="group relative p-6 rounded-xl border-2 border-[#C0C3B9] hover:border-[#769382] bg-white hover:bg-[#769382]/5 transition-all duration-300 text-left"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-[#769382]/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#769382]/20 transition-colors">
                      <Stethoscope className="w-10 h-10 text-[#769382]" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#2D3B35] mb-2">I&apos;m a Doctor</h3>
                    <p className="text-sm text-[#2D3B35]/70 mb-4">Manage your schedule, conduct consultations, and access patient records.</p>
                    <div className="flex items-center text-[#769382] font-medium">Continue as Doctor <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></div>
                  </div>
                </button>
              </div>

              <p className="text-center text-sm text-[#2D3B35]/70">
                Already have an account?{' '}
                <Link href="/auth/signin" className="text-[#769382] font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          )}

          {step === 'credentials' && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-[#2D3B35] mb-2">{roleLabel} Account Details</h2>
                <p className="text-[#2D3B35]/70">Signing up as a {roleLabel}</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#2D3B35] text-sm">Email Address</Label>
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#2D3B35] text-sm">Password</Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputClass} pr-12`} required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2D3B35]/50 hover:text-[#2D3B35]">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-[#2D3B35] text-sm">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} required />
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={handleBack} className="flex-1 h-12 border-[#C0C3B9]">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {initialRole ? 'Change Role' : 'Back'}
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1 h-12 bg-[#769382] hover:bg-[#769382]/90 text-white">
                  {isLoading ? 'Creating Account...' : initialRole === 'patient' ? 'Next' : 'Create Account'}
                </Button>
              </div>
            </form>
          )}

          {step === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-[#2D3B35] mb-2">{roleLabel} Profile Details</h2>
                <p className="text-[#2D3B35]/70">{role === 'doctor' ? 'Complete your medical profile' : 'Complete your profile'}</p>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-[#2D3B35] text-sm">First Name</Label>
                    <Input id="firstName" placeholder="Juan" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-[#2D3B35] text-sm">Last Name</Label>
                    <Input id="lastName" placeholder="Dela Cruz" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[#2D3B35] text-sm">Mobile Number</Label>
                  <Input id="phone" type="tel" placeholder="09171234567" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-[#2D3B35] text-sm">Date of Birth</Label>
                    <Input id="dateOfBirth" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className={inputClass} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-[#2D3B35] text-sm">Gender</Label>
                    <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)} className={`w-full ${inputClass} px-3`} required>
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-[#2D3B35] text-sm">City (Metro Manila)</Label>
                  <select id="city" value={city} onChange={(e) => setCity(e.target.value)} className={`w-full ${inputClass} px-3`} required>
                    <option value="">Select City</option>
                    {metroManilaCities.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state" className="text-[#2D3B35] text-sm">Province / State</Label>
                  <Input id="state" placeholder="Enter province or state" value={state} onChange={(e) => setState(e.target.value)} className={inputClass} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="barangay" className="text-[#2D3B35] text-sm">Barangay</Label>
                  <Input id="barangay" placeholder="Enter your barangay" value={barangay} onChange={(e) => setBarangay(e.target.value)} className={inputClass} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-[#2D3B35] text-sm">Street Address</Label>
                  <Input id="address" placeholder="House/Unit No., Street Name" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContact" className="text-[#2D3B35] text-sm">Emergency Contact</Label>
                  <Input id="emergencyContact" placeholder="Emergency Contact Name" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} className={inputClass} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone" className="text-[#2D3B35] text-sm">Emergency Contact Number</Label>
                  <Input id="emergencyPhone" placeholder="09123456789" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} className={inputClass} />
                </div>

                {role === 'doctor' && (
                  <>
                    <hr className="border-[#C0C3B9]" />
                    <p className="text-sm font-medium text-[#2D3B35]">Professional Information</p>

                    <div className="space-y-2">
                      <Label htmlFor="specialization" className="text-[#2D3B35] text-sm">Specialization</Label>
                      <select id="specialization" value={specialization} onChange={(e) => setSpecialization(e.target.value)} className={`w-full ${inputClass} px-3`} required>
                        <option value="">Select Department</option>
                        {departments.map((dept) => <option key={dept} value={dept}>{dept}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber" className="text-[#2D3B35] text-sm">PRC License Number</Label>
                      <Input id="licenseNumber" placeholder="PRC-0095631" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} className={inputClass} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="yearsOfExperience" className="text-[#2D3B35] text-sm">Years of Experience</Label>
                        <Input id="yearsOfExperience" type="number" min="0" placeholder="0" value={yearsOfExperience} onChange={(e) => setYearsOfExperience(e.target.value)} className={inputClass} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="consultationFee" className="text-[#2D3B35] text-sm">Consultation Fee (PHP)</Label>
                        <Input id="consultationFee" type="number" min="0" placeholder="500" value={consultationFee} onChange={(e) => setConsultationFee(e.target.value)} className={inputClass} required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="education" className="text-[#2D3B35] text-sm">Education & Certifications</Label>
                      <Input id="education" value={education} onChange={(e) => setEducation(e.target.value)} placeholder="e.g., MD from UP Manila, Fellowship at Philippine Heart Center" className={inputClass} />
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (initialRole === 'patient' && pendingProfileData) {
                      setStep('profile');
                      return;
                    }

                    if (initialRole) {
                      router.push('/auth/select-role');
                      return;
                    }

                    setStep('role');
                  }}
                  className="flex-1 h-12 border-[#C0C3B9]"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {initialRole === 'patient' ? 'Change Role' : 'Back'}
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1 h-12 bg-[#769382] hover:bg-[#769382]/90 text-white">
                  {isLoading ? 'Creating Account...' : initialRole === 'patient' ? 'Next' : 'Create Account'}
                </Button>
              </div>
            </form>
          )}
          </div>
        </div>
      </div>
  );
}
