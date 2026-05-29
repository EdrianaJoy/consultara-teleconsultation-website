/**
 * ConsulTara TeleConsultation Platform - Authentication Context
 * 
 * This context provides authentication state management across the application.
 * Uses localStorage for demo persistence (no backend required).
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, UserRole, PatientProfile, DoctorProfile } from './types';

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
  signIn: (email: string, password: string) => Promise<{
    success: boolean;
    error?: string;
    user?: User;
    patientProfile?: PatientProfile | null;
    doctorProfile?: DoctorProfile | null;
  }>;
  signUp: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  register: (
    email: string,
    password: string,
    role: UserRole,
    profileData: Partial<PatientProfile> | Partial<DoctorProfile>,
  ) => Promise<{
    success: boolean;
    error?: string;
    user?: User;
    patientProfile?: PatientProfile | null;
    doctorProfile?: DoctorProfile | null;
  }>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  selectRole: (role: UserRole) => Promise<void>;
  updatePatientProfile: (profile: Partial<PatientProfile>) => Promise<void>;
  updateDoctorProfile: (profile: Partial<DoctorProfile>) => Promise<void>;
  updateUser: (profile: Partial<PatientProfile> | Partial<DoctorProfile>) => Promise<void>;
  completeRegistration: (profileData: Partial<PatientProfile> | Partial<DoctorProfile>) => Promise<void>;
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

async function apiRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(payload?.error || 'Request failed');
  }

  return response.json() as Promise<T>;
}

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
    const loadAuthState = async () => {
      try {
        const response = await apiRequest<{ user: User | null; patientProfile: PatientProfile | null; doctorProfile: DoctorProfile | null; isAuthenticated: boolean }>('/api/session');

        setState({
          user: response.user,
          patientProfile: response.patientProfile,
          doctorProfile: response.doctorProfile,
          isLoading: false,
          isAuthenticated: response.isAuthenticated,
        });
      } catch (error) {
        console.error('Error loading auth state:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    void loadAuthState();
  }, []);

  // Sign in function
  const signIn = useCallback(async (email: string, password: string): Promise<{
    success: boolean;
    error?: string;
    user?: User;
    patientProfile?: PatientProfile | null;
    doctorProfile?: DoctorProfile | null;
  }> => {
    try {
      const result = await apiRequest<{ success: boolean; error?: string; user?: User; patientProfile?: PatientProfile | null; doctorProfile?: DoctorProfile | null }>('/api/session', {
        method: 'POST',
        body: JSON.stringify({ action: 'signin', email, password }),
      });

      if (!result.success || !result.user) {
        return { success: false, error: result.error || 'Sign in failed' };
      }

      setState({
        user: result.user,
        patientProfile: result.patientProfile || null,
        doctorProfile: result.doctorProfile || null,
        isLoading: false,
        isAuthenticated: true,
      });

      return {
        success: true,
        user: result.user,
        patientProfile: result.patientProfile || null,
        doctorProfile: result.doctorProfile || null,
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Sign in failed' };
    }
  }, []);

  // Sign up function
  const signUp = useCallback(async (email: string, password: string, role: UserRole): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await apiRequest<{ success: boolean; error?: string; user?: User }>('/api/session', {
        method: 'POST',
        body: JSON.stringify({ action: 'signup', email, password, role }),
      });

      if (!result.success || !result.user) {
        return { success: false, error: result.error || 'Sign up failed' };
      }

      setState(prev => ({
        ...prev,
        user: result.user || null,
        patientProfile: null,
        doctorProfile: null,
        isLoading: false,
        isAuthenticated: true,
      }));

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Sign up failed' };
    }
  }, []);

  const register = useCallback(async (
    email: string,
    password: string,
    role: UserRole,
    profileData: Partial<PatientProfile> | Partial<DoctorProfile>,
  ): Promise<{
    success: boolean;
    error?: string;
    user?: User;
    patientProfile?: PatientProfile | null;
    doctorProfile?: DoctorProfile | null;
  }> => {
    try {
      const result = await apiRequest<{
        success: boolean;
        error?: string;
        user?: User;
        patientProfile?: PatientProfile | null;
        doctorProfile?: DoctorProfile | null;
      }>('/api/session', {
        method: 'POST',
        body: JSON.stringify({ action: 'register', email, password, role, profileData }),
      });

      if (!result.success || !result.user) {
        return { success: false, error: result.error || 'Registration failed' };
      }

      setState({
        user: result.user,
        patientProfile: result.patientProfile || null,
        doctorProfile: result.doctorProfile || null,
        isLoading: false,
        isAuthenticated: true,
      });

      return {
        success: true,
        user: result.user,
        patientProfile: result.patientProfile || null,
        doctorProfile: result.doctorProfile || null,
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Registration failed' };
    }
  }, []);

  // Sign out function
  const signOut = useCallback(async () => {
    await apiRequest('/api/session', {
      method: 'POST',
      body: JSON.stringify({ action: 'signout' }),
    });

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
  const selectRole = useCallback(async (role: UserRole) => {
    if (!state.user) return;

    const result = await apiRequest<{ user: User; patientProfile: PatientProfile | null; doctorProfile: DoctorProfile | null }>('/api/session', {
      method: 'POST',
      body: JSON.stringify({ action: 'selectRole', role }),
    });

    localStorage.removeItem(STORAGE_KEYS.PENDING_ROLE);
    setState(prev => ({
      ...prev,
      user: result.user,
      patientProfile: result.patientProfile,
      doctorProfile: result.doctorProfile,
    }));
  }, []);

  // Update patient profile
  const updatePatientProfile = useCallback(async (profile: Partial<PatientProfile>) => {
    const result = await apiRequest<{ user: User; patientProfile: PatientProfile | null }>('/api/session', {
      method: 'POST',
      body: JSON.stringify({ action: 'updatePatientProfile', profile }),
    });

    setState(prev => ({
      ...prev,
      user: result.user,
      patientProfile: result.patientProfile,
    }));
  }, []);

  // Update doctor profile
  const updateDoctorProfile = useCallback(async (profile: Partial<DoctorProfile>) => {
    const result = await apiRequest<{ user: User; doctorProfile: DoctorProfile | null }>('/api/session', {
      method: 'POST',
      body: JSON.stringify({ action: 'updateDoctorProfile', profile }),
    });

    setState(prev => ({
      ...prev,
      user: result.user,
      doctorProfile: result.doctorProfile,
    }));
  }, []);

  const updateUser = useCallback(async (profile: Partial<PatientProfile> | Partial<DoctorProfile>) => {
    if (state.user?.role === 'patient') {
      await updatePatientProfile(profile as Partial<PatientProfile>);
      return;
    }

    await updateDoctorProfile(profile as Partial<DoctorProfile>);
  }, [state.user?.role, updatePatientProfile, updateDoctorProfile]);

  // Complete registration with profile data
  const completeRegistration = useCallback(async (profileData: Partial<PatientProfile> | Partial<DoctorProfile>) => {
    const result = await apiRequest<{ user: User; patientProfile: PatientProfile | null; doctorProfile: DoctorProfile | null }>('/api/session', {
      method: 'POST',
      body: JSON.stringify({ action: 'completeRegistration', profileData }),
    });

    localStorage.removeItem(STORAGE_KEYS.PENDING_ROLE);
    setState(prev => ({
      ...prev,
      user: result.user,
      patientProfile: result.patientProfile,
      doctorProfile: result.doctorProfile,
    }));
  }, [state.user]);

  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    register,
    signOut,
    logout: signOut,
    selectRole,
    updatePatientProfile,
    updateDoctorProfile,
    updateUser,
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
