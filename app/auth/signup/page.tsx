/**
 * ConsulTara TeleConsultation Platform - Sign Up Page
 * 
 * Registration page for new patients and doctors.
 * Features role selection and profile information collection.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, EyeOff, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Step = 'role' | 'credentials' | 'profile';
type Role = 'patient' | 'doctor';

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, completeRegistration } = useAuth();
  
  const [step, setStep] = useState<Step>('role');
  const [role, setRole] = useState<Role | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Profile fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [barangay, setBarangay] = useState('');
  
  // Doctor-specific fields
  const [specialization, setSpecialization] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [consultationFee, setConsultationFee] = useState('');

  // Validation helpers
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    // Philippine mobile number format: +63 or 09 followed by 9 digits
    const phoneRegex = /^(\+63|0)9\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateName = (name: string) => {
    // Only letters, spaces, hyphens, and apostrophes
    const nameRegex = /^[A-Za-z\s\-']+$/;
    return nameRegex.test(name) && name.length >= 2;
  };

  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole);
    setStep('credentials');
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

    setStep('profile');
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
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

    // Doctor-specific validation
    if (role === 'doctor') {
      if (!specialization) {
        toast.error('Please select your specialization');
        return;
      }
      if (!licenseNumber || licenseNumber.length < 5) {
        toast.error('Please enter a valid PRC license number');
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
      const result = await signUp(email, password, role!);
      
      if (result.success) {
        // Complete registration with profile data
        const profileData = role === 'patient' 
          ? {
              firstName,
              lastName,
              phone,
              dateOfBirth,
              gender,
              address,
              city,
              barangay,
            }
          : {
              firstName,
              lastName,
              phone,
              dateOfBirth,
              gender,
              address,
              city,
              barangay,
              specialization,
              licenseNumber,
              yearsOfExperience: Number(yearsOfExperience),
              consultationFee: Number(consultationFee),
            };

        completeRegistration(profileData);
        
        toast.success('Account created successfully!');
        router.push(role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard');
      } else {
        toast.error(result.error || 'Sign up failed');
      }
    } catch {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Metro Manila cities
  const metroManilaCities = [
    'Caloocan',
    'Las Piñas',
    'Makati',
    'Malabon',
    'Mandaluyong',
    'Manila',
    'Marikina',
    'Muntinlupa',
    'Navotas',
    'Parañaque',
    'Pasay',
    'Pasig',
    'Pateros',
    'Quezon City',
    'San Juan',
    'Taguig',
    'Valenzuela',
  ];

  const departments = [
    'Cardiology',
    'Dermatology',
    'Pediatrics',
    'Neurology',
    'Orthopedics',
    'Gynecology',
    'Ophthalmology',
    'Psychiatry',
    'General Medicine',
    'ENT',
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=1200&h=1600&fit=crop"
          alt="Healthcare professionals"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8 text-white">
          <h2 className="text-3xl font-bold mb-2">Join ConsulTara</h2>
          <p className="text-white/80">
            Access quality healthcare from anywhere in Metro Manila.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#F3EFE3]">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ConsulTara%20Logo-oqtBESzen2QQnxkVKzgc7RxAQEbHnb.png"
              alt="ConsulTara Logo"
              width={60}
              height={60}
              className="mb-2"
            />
            <h1 className="text-xl font-semibold text-[#769382]">ConsulTara</h1>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {['role', 'credentials', 'profile'].map((s, i) => (
              <div key={s} className="flex items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  step === s 
                    ? "bg-[#769382] text-white" 
                    : ['role', 'credentials', 'profile'].indexOf(step) > i 
                      ? "bg-[#769382] text-white"
                      : "bg-[#C0C3B9]/30 text-[#2D3B35]/50"
                )}>
                  {['role', 'credentials', 'profile'].indexOf(step) > i ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                {i < 2 && (
                  <div className={cn(
                    "w-12 h-0.5 mx-1",
                    ['role', 'credentials', 'profile'].indexOf(step) > i 
                      ? "bg-[#769382]" 
                      : "bg-[#C0C3B9]/30"
                  )} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Role Selection */}
          {step === 'role' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-[#2D3B35] mb-2">Create Your Account</h2>
                <p className="text-[#2D3B35]/70">Choose your role to get started</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleRoleSelect('patient')}
                  className="p-6 rounded-xl border-2 border-[#C0C3B9] hover:border-[#769382] bg-white transition-colors text-center group"
                >
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#769382]/10 flex items-center justify-center group-hover:bg-[#769382]/20 transition-colors">
                    <svg className="w-8 h-8 text-[#769382]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-[#2D3B35]">Patient</h3>
                  <p className="text-sm text-[#2D3B35]/60 mt-1">Book consultations</p>
                </button>

                <button
                  onClick={() => handleRoleSelect('doctor')}
                  className="p-6 rounded-xl border-2 border-[#C0C3B9] hover:border-[#769382] bg-white transition-colors text-center group"
                >
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#769382]/10 flex items-center justify-center group-hover:bg-[#769382]/20 transition-colors">
                    <svg className="w-8 h-8 text-[#769382]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-[#2D3B35]">Doctor</h3>
                  <p className="text-sm text-[#2D3B35]/60 mt-1">Provide consultations</p>
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

          {/* Step 2: Credentials */}
          {step === 'credentials' && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-[#2D3B35] mb-2">Account Details</h2>
                <p className="text-[#2D3B35]/70">
                  Signing up as a {role === 'patient' ? 'Patient' : 'Doctor'}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#2D3B35] text-sm">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-white border-[#C0C3B9] focus:border-[#769382] focus:ring-[#769382]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#2D3B35] text-sm">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 bg-white border-[#C0C3B9] focus:border-[#769382] focus:ring-[#769382] pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2D3B35]/50 hover:text-[#2D3B35]"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-[#2D3B35] text-sm">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 bg-white border-[#C0C3B9] focus:border-[#769382] focus:ring-[#769382]"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('role')}
                  className="flex-1 h-12 border-[#C0C3B9]"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 bg-[#769382] hover:bg-[#769382]/90 text-white"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </form>
          )}

          {/* Step 3: Profile Information */}
          {step === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-[#2D3B35] mb-2">Personal Information</h2>
                <p className="text-[#2D3B35]/70">Complete your profile</p>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-[#2D3B35] text-sm">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="Juan"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="h-10 bg-white border-[#C0C3B9] focus:border-[#769382] focus:ring-[#769382]"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-[#2D3B35] text-sm">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="Dela Cruz"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="h-10 bg-white border-[#C0C3B9] focus:border-[#769382] focus:ring-[#769382]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[#2D3B35] text-sm">
                    Mobile Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="09171234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-10 bg-white border-[#C0C3B9] focus:border-[#769382] focus:ring-[#769382]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-[#2D3B35] text-sm">
                      Date of Birth
                    </Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="h-10 bg-white border-[#C0C3B9] focus:border-[#769382] focus:ring-[#769382]"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-[#2D3B35] text-sm">
                      Gender
                    </Label>
                    <select
                      id="gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full h-10 px-3 rounded-md bg-white border border-[#C0C3B9] focus:border-[#769382] focus:ring-[#769382] text-[#2D3B35]"
                      required
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-[#2D3B35] text-sm">
                    City (Metro Manila)
                  </Label>
                  <select
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-10 px-3 rounded-md bg-white border border-[#C0C3B9] focus:border-[#769382] focus:ring-[#769382] text-[#2D3B35]"
                    required
                  >
                    <option value="">Select City</option>
                    {metroManilaCities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="barangay" className="text-[#2D3B35] text-sm">
                    Barangay
                  </Label>
                  <Input
                    id="barangay"
                    placeholder="Enter your barangay"
                    value={barangay}
                    onChange={(e) => setBarangay(e.target.value)}
                    className="h-10 bg-white border-[#C0C3B9] focus:border-[#769382] focus:ring-[#769382]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-[#2D3B35] text-sm">
                    Street Address
                  </Label>
                  <Input
                    id="address"
                    placeholder="House/Unit No., Street Name"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="h-10 bg-white border-[#C0C3B9] focus:border-[#769382] focus:ring-[#769382]"
                  />
                </div>

                {/* Doctor-specific fields */}
                {role === 'doctor' && (
                  <>
                    <hr className="border-[#C0C3B9]" />
                    <p className="text-sm font-medium text-[#2D3B35]">Professional Information</p>

                    <div className="space-y-2">
                      <Label htmlFor="specialization" className="text-[#2D3B35] text-sm">
                        Specialization
                      </Label>
                      <select
                        id="specialization"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        className="w-full h-10 px-3 rounded-md bg-white border border-[#C0C3B9] focus:border-[#769382] focus:ring-[#769382] text-[#2D3B35]"
                        required
                      >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber" className="text-[#2D3B35] text-sm">
                        PRC License Number
                      </Label>
                      <Input
                        id="licenseNumber"
                        placeholder="Enter your PRC license number"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        className="h-10 bg-white border-[#C0C3B9] focus:border-[#769382] focus:ring-[#769382]"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="yearsOfExperience" className="text-[#2D3B35] text-sm">
                          Years of Experience
                        </Label>
                        <Input
                          id="yearsOfExperience"
                          type="number"
                          min="0"
                          placeholder="0"
                          value={yearsOfExperience}
                          onChange={(e) => setYearsOfExperience(e.target.value)}
                          className="h-10 bg-white border-[#C0C3B9] focus:border-[#769382] focus:ring-[#769382]"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="consultationFee" className="text-[#2D3B35] text-sm">
                          Consultation Fee (PHP)
                        </Label>
                        <Input
                          id="consultationFee"
                          type="number"
                          min="0"
                          placeholder="500"
                          value={consultationFee}
                          onChange={(e) => setConsultationFee(e.target.value)}
                          className="h-10 bg-white border-[#C0C3B9] focus:border-[#769382] focus:ring-[#769382]"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('credentials')}
                  className="flex-1 h-12 border-[#C0C3B9]"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 h-12 bg-[#769382] hover:bg-[#769382]/90 text-white"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
