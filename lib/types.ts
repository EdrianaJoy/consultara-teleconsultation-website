/**
 * ConsulTara TeleConsultation Platform - Type Definitions
 * 
 * This file contains all TypeScript interfaces and types used throughout
 * the application for type safety and documentation.
 */

// ============================================================================
// User & Authentication Types
// ============================================================================

export type UserRole = 'patient' | 'doctor';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  bloodType?: string;
  allergies?: string[];
  medicalConditions?: string[];
  currentMedications?: string[];
  basicMedicalHistory?: string;
  specialization?: string;
  specialty?: string;
  department?: Department;
  licenseNumber?: string;
  yearsOfExperience?: number;
  education?: string;
  bio?: string;
  consultationFee?: number;
  avatar?: string;
  availability?: WeeklySchedule;
  languages?: string[];
  rating?: number;
  totalReviews?: number;
  isAvailable?: boolean;
  location?: string;
  acceptsInsurance?: boolean;
}

export type PatientUser = User & PatientProfile;
export type DoctorUser = User & DoctorProfile;

export interface PatientProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  address: string;
  city: string;
  state: string;
  zipCode: string;
  emergencyContact: string;
  emergencyPhone: string;
  weight?: string;
  height?: string;
  bloodType?: string;
  allergies?: string[];
  medicalConditions?: string[];
  currentMedications?: string[];
  basicMedicalHistory?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  specialty?: string;
  name?: string;
  department: Department;
  licenseNumber: string;
  yearsOfExperience: number;
  education: string;
  bio: string;
  consultationFee: number;
  avatar: string;
  availability: WeeklySchedule;
  languages: string[];
  rating: number;
  totalReviews: number;
  isAvailable: boolean;
  location: string;
  acceptsInsurance: boolean;
  reviews?: DoctorReview[];
  contactNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorReview {
  id: string;
  rating: number;
  comment: string;
  date: string;
  isAnonymous: boolean;
}

// ============================================================================
// Department & Specialization Types
// ============================================================================

export type Department =
  | 'cardiology'
  | 'dermatology'
  | 'pediatrics'
  | 'neurology'
  | 'orthopedics'
  | 'gynecology'
  | 'ophthalmology'
  | 'psychiatry'
  | 'general-medicine'
  | 'ent';

export interface DepartmentInfo {
  id: Department;
  name: string;
  description: string;
  icon: string;
  commonSymptoms: string[];
}

// ============================================================================
// Scheduling Types
// ============================================================================

export interface TimeSlot {
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  isAvailable: boolean;
}

export interface DaySchedule {
  isWorkingDay: boolean;
  slots: TimeSlot[];
}

export interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

// ============================================================================
// Appointment Types
// ============================================================================

export type AppointmentStatus = 
  | 'pending'
  | 'confirmed'
  | 'in-progress'
  | 'completed'
  | 'cancelled'
  | 'no-show';

export type ConsultationType = 'video' | 'audio' | 'chat';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;         // YYYY-MM-DD format
  timeSlot: TimeSlot;
  consultationType: ConsultationType;
  type?: ConsultationType;
  time?: string;
  reason?: string;
  status: AppointmentStatus;
  symptoms?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Consultation Types
// ============================================================================

export interface Consultation {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  startTime: string;
  endTime?: string;
  diagnosis?: string;
  prescription?: Prescription;
  notes: string;
  followUpDate?: string;
  attachments?: Attachment[];
  status: 'ongoing' | 'completed';
  createdAt: string;
}

export interface Prescription {
  id: string;
  consultationId: string;
  patientId?: string;
  doctorId?: string;
  medications: Medication[];
  instructions: string;
  validUntil: string;
  createdAt: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'lab-result';
  url: string;
  uploadedAt: string;
}

// ============================================================================
// Medical Records Types
// ============================================================================

export interface MedicalRecord {
  id: string;
  patientId: string;
  consultationId: string;
  doctorId: string;
  doctorName: string;
  date: string;
  title?: string;
  type?: 'consultation' | 'prescription' | 'lab_result';
  diagnosis: string;
  symptoms: string[];
  treatment: string;
  prescription?: Prescription;
  notes?: string;
  followUpRequired: boolean;
  followUpDate?: string;
  attachments?: Attachment[];
  createdAt: string;
}

// ============================================================================
// Messaging Types
// ============================================================================

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: UserRole;
  senderType?: UserRole;
  content: string;
  attachments?: Attachment[];
  isRead: boolean;
  read?: boolean;
  createdAt: string;
  timestamp?: string;
}

export interface Conversation {
  id: string;
  participants: {
    patientId: string;
    doctorId: string;
  };
  patientId?: string;
  doctorId?: string;
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Notification Types
// ============================================================================

export type NotificationType = 
  | 'appointment-reminder'
  | 'appointment-confirmed'
  | 'appointment-cancelled'
  | 'new-message'
  | 'prescription-ready'
  | 'consultation-started'
  | 'follow-up-reminder';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

// ============================================================================
// Review Types
// ============================================================================

export interface Review {
  id: string;
  patientId: string;
  doctorId: string;
  consultationId: string;
  rating: number;       // 1-5
  comment?: string;
  isAnonymous: boolean;
  createdAt: string;
}

// ============================================================================
// Consulty AI Types
// ============================================================================

export interface SymptomAnalysis {
  symptoms: string[];
  possibleDepartments: Department[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  recommendedDoctors: DoctorProfile[];
  disclaimer: string;
}

export interface ConsultyMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  analysis?: SymptomAnalysis;
  timestamp: string;
}

// ============================================================================
// Search & Filter Types
// ============================================================================

export interface DoctorSearchFilters {
  department?: Department;
  location?: string;
  date?: string;
  availability?: boolean;
  minRating?: number;
  maxFee?: number;
  language?: string;
}

export interface AppointmentFilters {
  status?: AppointmentStatus;
  dateFrom?: string;
  dateTo?: string;
  doctorId?: string;
  patientId?: string;
}
