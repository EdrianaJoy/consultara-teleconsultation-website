/**
 * ConsulTara TeleConsultation Platform - Authentication Context
 * 
 * This context provides authentication state management across the application.
 * Uses localStorage for demo persistence (no backend required).
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, UserRole, PatientProfile, DoctorProfile } from './types';
import { samplePatient, doctors } from './data';

// ============================================================================
// Types
// ============================================================================

interface AuthState {
  user: User | null;
  patientProfile: PatientProfile | null;
  doctorProfile: DoctorProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
  logout: () => void;
  selectRole: (role: UserRole) => void;
  updatePatientProfile: (profile: Partial<PatientProfile>) => void;
  updateDoctorProfile: (profile: Partial<DoctorProfile>) => void;
  completeRegistration: (profileData: Partial<PatientProfile> | Partial<DoctorProfile>) => void;
}

// ============================================================================
// Context
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// Storage Keys
// ============================================================================

const STORAGE_KEYS = {
  USER: 'consultara_user',
  PATIENT_PROFILE: 'consultara_patient_profile',
  DOCTOR_PROFILE: 'consultara_doctor_profile',
  PENDING_ROLE: 'consultara_pending_role',
};

// ============================================================================
// Provider Component
// ============================================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    patientProfile: null,
    doctorProfile: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Load saved auth state on mount
  useEffect(() => {
    const loadAuthState = () => {
      try {
        const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
        const savedPatientProfile = localStorage.getItem(STORAGE_KEYS.PATIENT_PROFILE);
        const savedDoctorProfile = localStorage.getItem(STORAGE_KEYS.DOCTOR_PROFILE);

        if (savedUser) {
          const user = JSON.parse(savedUser) as User;
          const patientProfile = savedPatientProfile ? JSON.parse(savedPatientProfile) as PatientProfile : null;
          const doctorProfile = savedDoctorProfile ? JSON.parse(savedDoctorProfile) as DoctorProfile : null;

          setState({
            user,
            patientProfile,
            doctorProfile,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadAuthState();
  }, []);

  // Sign in function
  const signIn = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if this email belongs to a doctor in the system
    const existingDoctor = doctors.find(d => d.email.toLowerCase() === email.toLowerCase());
    
    if (existingDoctor) {
      // Sign in as existing doctor
      const user: User = {
        id: existingDoctor.userId,
        email: existingDoctor.email,
        role: 'doctor',
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.DOCTOR_PROFILE, JSON.stringify(existingDoctor));

      setState({
        user,
        patientProfile: null,
        doctorProfile: existingDoctor,
        isLoading: false,
        isAuthenticated: true,
      });

      return { success: true };
    }

    // Check if returning user (has an existing account in localStorage)
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (savedUser) {
      const user = JSON.parse(savedUser) as User;
      if (user.email.toLowerCase() === email.toLowerCase()) {
        const patientProfile = localStorage.getItem(STORAGE_KEYS.PATIENT_PROFILE);
        const doctorProfile = localStorage.getItem(STORAGE_KEYS.DOCTOR_PROFILE);

        setState({
          user,
          patientProfile: patientProfile ? JSON.parse(patientProfile) : null,
          doctorProfile: doctorProfile ? JSON.parse(doctorProfile) : null,
          isLoading: false,
          isAuthenticated: true,
        });

        return { success: true };
      }
    }

    // No account found - show error message prompting user to sign up
    return { 
      success: false, 
      error: 'No account found with this email. Please sign up first to create an account.' 
    };
  }, []);

  // Sign up function
  const signUp = useCallback(async (email: string, password: string, role: UserRole): Promise<{ success: boolean; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const user: User = {
      id: `user-${Date.now()}`,
      email,
      role,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

    setState({
      user,
      patientProfile: null,
      doctorProfile: null,
      isLoading: false,
      isAuthenticated: true,
    });

    return { success: true };
  }, []);

  // Sign out function
  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.PATIENT_PROFILE);
    localStorage.removeItem(STORAGE_KEYS.DOCTOR_PROFILE);
    localStorage.removeItem(STORAGE_KEYS.PENDING_ROLE);

    setState({
      user: null,
      patientProfile: null,
      doctorProfile: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, []);

  // Select role after sign in
  const selectRole = useCallback((role: UserRole) => {
    if (!state.user) return;

    const updatedUser: User = {
      ...state.user,
      role,
    };

    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    localStorage.removeItem(STORAGE_KEYS.PENDING_ROLE);

    // For demo purposes, if selecting patient, pre-populate with sample data
    if (role === 'patient') {
      const patientProfile: PatientProfile = {
        ...samplePatient,
        id: `patient-${Date.now()}`,
        userId: updatedUser.id,
        email: updatedUser.email,
        firstName: '',
        lastName: '',
      };
      localStorage.setItem(STORAGE_KEYS.PATIENT_PROFILE, JSON.stringify(patientProfile));

      setState(prev => ({
        ...prev,
        user: updatedUser,
        patientProfile,
      }));
    } else {
      setState(prev => ({
        ...prev,
        user: updatedUser,
      }));
    }
  }, [state.user]);

  // Update patient profile
  const updatePatientProfile = useCallback((profile: Partial<PatientProfile>) => {
    setState(prev => {
      if (!prev.patientProfile) return prev;

      const updatedProfile: PatientProfile = {
        ...prev.patientProfile,
        ...profile,
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem(STORAGE_KEYS.PATIENT_PROFILE, JSON.stringify(updatedProfile));

      return {
        ...prev,
        patientProfile: updatedProfile,
      };
    });
  }, []);

  // Update doctor profile
  const updateDoctorProfile = useCallback((profile: Partial<DoctorProfile>) => {
    setState(prev => {
      if (!prev.doctorProfile) return prev;

      const updatedProfile: DoctorProfile = {
        ...prev.doctorProfile,
        ...profile,
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem(STORAGE_KEYS.DOCTOR_PROFILE, JSON.stringify(updatedProfile));

      return {
        ...prev,
        doctorProfile: updatedProfile,
      };
    });
  }, []);

  // Complete registration with profile data
  const completeRegistration = useCallback((profileData: Partial<PatientProfile> | Partial<DoctorProfile>) => {
    if (!state.user) return;

    if (state.user.role === 'patient') {
      const patientProfile: PatientProfile = {
        id: `patient-${Date.now()}`,
        userId: state.user.id,
        email: state.user.email,
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...(profileData as Partial<PatientProfile>),
      };

      localStorage.setItem(STORAGE_KEYS.PATIENT_PROFILE, JSON.stringify(patientProfile));

      setState(prev => ({
        ...prev,
        patientProfile,
      }));
    } else {
      const doctorProfile: DoctorProfile = {
        id: `doctor-${Date.now()}`,
        userId: state.user.id,
        email: state.user.email,
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
        avatar: '',
        availability: {
          monday: { isWorkingDay: true, slots: [] },
          tuesday: { isWorkingDay: true, slots: [] },
          wednesday: { isWorkingDay: true, slots: [] },
          thursday: { isWorkingDay: true, slots: [] },
          friday: { isWorkingDay: true, slots: [] },
          saturday: { isWorkingDay: false, slots: [] },
          sunday: { isWorkingDay: false, slots: [] },
        },
        languages: ['English'],
        rating: 0,
        totalReviews: 0,
        isAvailable: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...(profileData as Partial<DoctorProfile>),
      };

      localStorage.setItem(STORAGE_KEYS.DOCTOR_PROFILE, JSON.stringify(doctorProfile));

      setState(prev => ({
        ...prev,
        doctorProfile,
      }));
    }
  }, [state.user]);

  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    logout: signOut,
    selectRole,
    updatePatientProfile,
    updateDoctorProfile,
    completeRegistration,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ============================================================================
// Helper: Check if registration is complete
// ============================================================================

export function isRegistrationComplete(auth: AuthContextType): boolean {
  if (!auth.user) return false;
  
  if (auth.user.role === 'patient') {
    return !!(auth.patientProfile?.firstName && auth.patientProfile?.lastName);
  } else {
    return !!(auth.doctorProfile?.firstName && auth.doctorProfile?.lastName && auth.doctorProfile?.licenseNumber);
  }
}

// ============================================================================
// Helper: Check if role selection is pending
// ============================================================================

export function isRoleSelectionPending(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEYS.PENDING_ROLE) === 'true';
}
