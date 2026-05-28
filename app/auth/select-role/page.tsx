/**
 * ConsulTara TeleConsultation Platform - Role Selection Page
 * 
 * After signing in, users select whether they are a patient or doctor.
 * This determines their dashboard and available features.
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User, Stethoscope, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth, isRoleSelectionPending, isRegistrationComplete } from '@/lib/auth-context';

export default function SelectRolePage() {
  const router = useRouter();
  const { user, selectRole, patientProfile, doctorProfile } = useAuth();

  useEffect(() => {
    // If not authenticated, redirect to sign in
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    // If role already selected and registration complete, redirect to dashboard
    if (!isRoleSelectionPending()) {
      if (user.role === 'patient' && patientProfile?.firstName) {
        router.push('/patient/dashboard');
      } else if (user.role === 'doctor' && doctorProfile?.firstName) {
        router.push('/doctor/dashboard');
      }
    }
  }, [user, router, patientProfile, doctorProfile]);

  const handleRoleSelect = (role: 'patient' | 'doctor') => {
    selectRole(role);
    
    // Redirect to registration form
    if (role === 'patient') {
      router.push('/auth/register/patient');
    } else {
      router.push('/auth/register/doctor');
    }
  };

  return (
    <div className="min-h-screen bg-[#F3EFE3] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ConsulTara%20Logo-oqtBESzen2QQnxkVKzgc7RxAQEbHnb.png"
            alt="ConsulTara Logo"
            width={80}
            height={80}
            className="mb-4"
          />
          <h1 className="text-2xl font-semibold text-[#769382]">ConsulTara</h1>
        </div>

        {/* Selection Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#2D3B35] mb-2">
              Welcome! How would you like to use ConsulTara?
            </h2>
            <p className="text-[#2D3B35]/70">
              Select your role to continue with the registration process.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Patient Option */}
            <button
              onClick={() => handleRoleSelect('patient')}
              className="group relative p-6 rounded-xl border-2 border-[#C0C3B9] hover:border-[#769382] bg-white hover:bg-[#769382]/5 transition-all duration-300 text-left"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-[#FFEBBC]/50 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#FFEBBC] transition-colors">
                  <User className="w-10 h-10 text-[#769382]" />
                </div>
                <h3 className="text-xl font-semibold text-[#2D3B35] mb-2">
                  I&apos;m a Patient
                </h3>
                <p className="text-sm text-[#2D3B35]/70 mb-4">
                  Book appointments, consult with doctors, and manage your health records.
                </p>
                <div className="flex items-center text-[#769382] font-medium">
                  Continue as Patient
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>

            {/* Doctor Option */}
            <button
              onClick={() => handleRoleSelect('doctor')}
              className="group relative p-6 rounded-xl border-2 border-[#C0C3B9] hover:border-[#769382] bg-white hover:bg-[#769382]/5 transition-all duration-300 text-left"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-[#769382]/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#769382]/20 transition-colors">
                  <Stethoscope className="w-10 h-10 text-[#769382]" />
                </div>
                <h3 className="text-xl font-semibold text-[#2D3B35] mb-2">
                  I&apos;m a Doctor
                </h3>
                <p className="text-sm text-[#2D3B35]/70 mb-4">
                  Manage your schedule, conduct consultations, and access patient records.
                </p>
                <div className="flex items-center text-[#769382] font-medium">
                  Continue as Doctor
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Back to Sign In */}
        <p className="text-center mt-6 text-sm text-[#2D3B35]/70">
          Want to use a different account?{' '}
          <button
            onClick={() => {
              router.push('/auth/signin');
            }}
            className="text-[#769382] font-medium hover:text-[#769382]/80 transition-colors"
          >
            Sign in again
          </button>
        </p>
      </div>
    </div>
  );
}
