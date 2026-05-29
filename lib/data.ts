/**
 * ConsulTara TeleConsultation Platform - Mock Data
 * 
 * This file contains all mock data for the application including
 * departments, doctors, and sample data for demonstration purposes.
 */

import type { 
  DepartmentInfo, 
  DoctorProfile, 
  Department,
  WeeklySchedule,
  PatientProfile,
  Appointment,
  MedicalRecord,
  Notification,
  Conversation,
  Message
} from './types';
import { extendedDoctors } from './doctors-data';

// ============================================================================
// Department Data
// ============================================================================

export const departments: DepartmentInfo[] = [
  {
    id: 'cardiology',
    name: 'Cardiology',
    description: 'Heart and cardiovascular system specialists',
    icon: 'heart',
    commonSymptoms: ['chest pain', 'shortness of breath', 'irregular heartbeat', 'high blood pressure', 'fatigue', 'dizziness']
  },
  {
    id: 'dermatology',
    name: 'Dermatology',
    description: 'Skin, hair, and nail specialists',
    icon: 'scan',
    commonSymptoms: ['rash', 'acne', 'eczema', 'psoriasis', 'skin irritation', 'hair loss', 'nail problems']
  },
  {
    id: 'pediatrics',
    name: 'Pediatrics',
    description: 'Child and adolescent healthcare',
    icon: 'baby',
    commonSymptoms: ['fever in children', 'childhood vaccinations', 'growth concerns', 'behavioral issues', 'childhood infections']
  },
  {
    id: 'neurology',
    name: 'Neurology',
    description: 'Brain and nervous system specialists',
    icon: 'brain',
    commonSymptoms: ['headaches', 'migraines', 'seizures', 'numbness', 'memory problems', 'tremors', 'balance issues']
  },
  {
    id: 'orthopedics',
    name: 'Orthopedics',
    description: 'Bone, joint, and muscle specialists',
    icon: 'bone',
    commonSymptoms: ['joint pain', 'back pain', 'fractures', 'arthritis', 'sports injuries', 'muscle weakness']
  },
  {
    id: 'gynecology',
    name: 'Gynecology',
    description: "Women's health specialists",
    icon: 'users',
    commonSymptoms: ['menstrual issues', 'pregnancy care', 'pelvic pain', 'hormonal imbalance', 'fertility concerns']
  },
  {
    id: 'ophthalmology',
    name: 'Ophthalmology',
    description: 'Eye and vision specialists',
    icon: 'eye',
    commonSymptoms: ['vision problems', 'eye pain', 'redness', 'dry eyes', 'cataracts', 'glaucoma']
  },
  {
    id: 'psychiatry',
    name: 'Psychiatry',
    description: 'Mental health specialists',
    icon: 'brain-circuit',
    commonSymptoms: ['anxiety', 'depression', 'stress', 'sleep disorders', 'mood swings', 'panic attacks']
  },
  {
    id: 'general-medicine',
    name: 'General Medicine',
    description: 'Primary care and general health',
    icon: 'stethoscope',
    commonSymptoms: ['fever', 'cold', 'flu', 'general checkup', 'fatigue', 'weight changes', 'allergies']
  },
  {
    id: 'ent',
    name: 'ENT',
    description: 'Ear, nose, and throat specialists',
    icon: 'ear',
    commonSymptoms: ['ear pain', 'hearing loss', 'sore throat', 'sinusitis', 'tonsillitis', 'nasal congestion']
  }
];

// ============================================================================
// Default Weekly Schedule
// ============================================================================

const defaultSchedule: WeeklySchedule = {
  monday: {
    isWorkingDay: true,
    slots: [
      { startTime: '09:00', endTime: '09:30', isAvailable: true },
      { startTime: '09:30', endTime: '10:00', isAvailable: true },
      { startTime: '10:00', endTime: '10:30', isAvailable: true },
      { startTime: '10:30', endTime: '11:00', isAvailable: true },
      { startTime: '11:00', endTime: '11:30', isAvailable: true },
      { startTime: '14:00', endTime: '14:30', isAvailable: true },
      { startTime: '14:30', endTime: '15:00', isAvailable: true },
      { startTime: '15:00', endTime: '15:30', isAvailable: true },
      { startTime: '15:30', endTime: '16:00', isAvailable: true },
    ]
  },
  tuesday: {
    isWorkingDay: true,
    slots: [
      { startTime: '09:00', endTime: '09:30', isAvailable: true },
      { startTime: '09:30', endTime: '10:00', isAvailable: true },
      { startTime: '10:00', endTime: '10:30', isAvailable: true },
      { startTime: '10:30', endTime: '11:00', isAvailable: true },
      { startTime: '14:00', endTime: '14:30', isAvailable: true },
      { startTime: '14:30', endTime: '15:00', isAvailable: true },
      { startTime: '15:00', endTime: '15:30', isAvailable: true },
    ]
  },
  wednesday: {
    isWorkingDay: true,
    slots: [
      { startTime: '09:00', endTime: '09:30', isAvailable: true },
      { startTime: '09:30', endTime: '10:00', isAvailable: true },
      { startTime: '10:00', endTime: '10:30', isAvailable: true },
      { startTime: '14:00', endTime: '14:30', isAvailable: true },
      { startTime: '14:30', endTime: '15:00', isAvailable: true },
    ]
  },
  thursday: {
    isWorkingDay: true,
    slots: [
      { startTime: '09:00', endTime: '09:30', isAvailable: true },
      { startTime: '09:30', endTime: '10:00', isAvailable: true },
      { startTime: '10:00', endTime: '10:30', isAvailable: true },
      { startTime: '10:30', endTime: '11:00', isAvailable: true },
      { startTime: '14:00', endTime: '14:30', isAvailable: true },
      { startTime: '14:30', endTime: '15:00', isAvailable: true },
      { startTime: '15:00', endTime: '15:30', isAvailable: true },
      { startTime: '15:30', endTime: '16:00', isAvailable: true },
    ]
  },
  friday: {
    isWorkingDay: true,
    slots: [
      { startTime: '09:00', endTime: '09:30', isAvailable: true },
      { startTime: '09:30', endTime: '10:00', isAvailable: true },
      { startTime: '10:00', endTime: '10:30', isAvailable: true },
      { startTime: '14:00', endTime: '14:30', isAvailable: true },
    ]
  },
  saturday: {
    isWorkingDay: false,
    slots: []
  },
  sunday: {
    isWorkingDay: false,
    slots: []
  }
};

// ============================================================================
// Doctor Profiles - Diverse doctors across all departments
// ============================================================================

const baseDoctors: DoctorProfile[] = [
  // Cardiology (3 doctors)
  {
    id: 'doc-001',
    userId: 'user-doc-001',
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'sarah.chen@consultara.ph',
    phone: '+63-917-100-0101',
    specialization: 'Interventional Cardiology',
    department: 'cardiology',
    licenseNumber: 'PRC-0100001',
    yearsOfExperience: 15,
    education: 'MD from University of the Philippines Manila, Fellowship in Cardiology at Philippine Heart Center',
    bio: 'Dr. Sarah Chen is a board-certified cardiologist specializing in interventional procedures. She has performed over 2,000 cardiac catheterizations and is passionate about preventive cardiology.',
    consultationFee: 1500,
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
    availability: defaultSchedule,
    languages: ['English', 'Filipino', 'Mandarin'],
    rating: 4.9,
    totalReviews: 342,
    isAvailable: true,
    location: 'Makati City',
    acceptsInsurance: true,
    contactNumber: '+63-2-8100-0101',
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'doc-002',
    userId: 'user-doc-002',
    firstName: 'Marcus',
    lastName: 'Williams',
    email: 'marcus.williams@consultara.ph',
    phone: '+63-917-100-0102',
    specialization: 'Electrophysiology',
    department: 'cardiology',
    licenseNumber: 'PRC-0100002',
    yearsOfExperience: 12,
    education: 'MD from University of Santo Tomas, Fellowship at St. Lukes Medical Center',
    bio: 'Dr. Marcus Williams specializes in heart rhythm disorders and cardiac electrophysiology. He has pioneered several minimally invasive techniques for arrhythmia treatment.',
    consultationFee: 1600,
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
    availability: defaultSchedule,
    languages: ['English', 'Filipino'],
    rating: 4.8,
    totalReviews: 287,
    isAvailable: true,
    location: 'Quezon City',
    acceptsInsurance: true,
    contactNumber: '+63-2-8100-0102',
    createdAt: '2023-02-20T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'doc-003',
    userId: 'user-doc-003',
    firstName: 'Priya',
    lastName: 'Patel',
    email: 'priya.patel@consultara.ph',
    phone: '+63-917-100-0103',
    specialization: 'Heart Failure & Transplant',
    department: 'cardiology',
    licenseNumber: 'PRC-0100003',
    yearsOfExperience: 18,
    education: 'MD from Ateneo School of Medicine, Fellowship at Philippine Heart Center',
    bio: 'Dr. Priya Patel is an expert in advanced heart failure management and cardiac transplantation. She leads the heart failure program with a focus on innovative therapies.',
    consultationFee: 1800,
    avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face',
    availability: defaultSchedule,
    languages: ['English', 'Filipino', 'Hindi'],
    rating: 4.9,
    totalReviews: 456,
    isAvailable: true,
    createdAt: '2022-06-10T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },

  // Dermatology (3 doctors)
  {
    id: 'doc-004',
    userId: 'user-doc-004',
    firstName: 'Emily',
    lastName: 'Johnson',
    email: 'emily.johnson@consultara.com',
    phone: '+1-555-0104',
    specialization: 'Cosmetic Dermatology',
    department: 'dermatology',
    licenseNumber: 'MD-DER-001',
    yearsOfExperience: 10,
    education: 'MD from Yale University, Dermatology Residency at NYU',
    bio: 'Dr. Emily Johnson combines medical dermatology with aesthetic treatments. She specializes in acne, anti-aging procedures, and skin cancer screening.',
    consultationFee: 120,
    avatar: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&crop=face',
    availability: defaultSchedule,
    languages: ['English', 'French'],
    rating: 4.7,
    totalReviews: 298,
    isAvailable: true,
    createdAt: '2023-03-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'doc-005',
    userId: 'user-doc-005',
    firstName: 'Kwame',
    lastName: 'Asante',
    email: 'kwame.asante@consultara.com',
    phone: '+1-555-0105',
    specialization: 'Pediatric Dermatology',
    department: 'dermatology',
    licenseNumber: 'MD-DER-002',
    yearsOfExperience: 14,
    education: 'MD from University of Pennsylvania, Fellowship at Children\'s Hospital of Philadelphia',
    bio: 'Dr. Kwame Asante specializes in skin conditions affecting children and adolescents, including eczema, birthmarks, and genetic skin disorders.',
    consultationFee: 130,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face',
    availability: defaultSchedule,
    languages: ['English', 'Twi'],
    rating: 4.8,
    totalReviews: 234,
    isAvailable: true,
    createdAt: '2023-01-20T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'doc-006',
    userId: 'user-doc-006',
    firstName: 'Yuki',
    lastName: 'Tanaka',
    email: 'yuki.tanaka@consultara.com',
    phone: '+1-555-0106',
    specialization: 'Dermatopathology',
    department: 'dermatology',
    licenseNumber: 'MD-DER-003',
    yearsOfExperience: 16,
    education: 'MD from UCLA, Dermatopathology Fellowship at UCSF',
    bio: 'Dr. Yuki Tanaka is an expert in diagnosing skin diseases through microscopic examination. She specializes in skin cancer diagnosis and inflammatory skin conditions.',
    consultationFee: 140,
    avatar: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=400&h=400&fit=crop&crop=face',
    availability: defaultSchedule,
    languages: ['English', 'Japanese'],
    rating: 4.9,
    totalReviews: 312,
    isAvailable: true,
    createdAt: '2022-09-05T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },

  // Pediatrics (3 doctors)
  {
    id: 'doc-007',
    userId: 'user-doc-007',
    firstName: 'Maria',
    lastName: 'Rodriguez',
    email: 'maria.rodriguez@consultara.com',
    phone: '+1-555-0107',
    specialization: 'General Pediatrics',
    department: 'pediatrics',
    licenseNumber: 'MD-PED-001',
    yearsOfExperience: 20,
    education: 'MD from Columbia University, Pediatrics Residency at Boston Children\'s Hospital',
    bio: 'Dr. Maria Rodriguez has dedicated her career to child health and development. She provides comprehensive care from newborns to adolescents with a gentle approach.',
    consultationFee: 100,
    avatar: 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=400&h=400&fit=crop&crop=face',
    availability: defaultSchedule,
    languages: ['English', 'Spanish', 'Portuguese'],
    rating: 4.9,
    totalReviews: 567,
    isAvailable: true,
    createdAt: '2021-05-10T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'doc-008',
    userId: 'user-doc-008',
    firstName: 'David',
    lastName: 'Kim',
    email: 'david.kim@consultara.com',
    phone: '+1-555-0108',
    specialization: 'Pediatric Infectious Diseases',
    department: 'pediatrics',
    licenseNumber: 'MD-PED-002',
    yearsOfExperience: 11,
    education: 'MD from Duke University, Fellowship at Johns Hopkins Children\'s Center',
    bio: 'Dr. David Kim specializes in diagnosing and treating infectious diseases in children. He is actively involved in vaccine research and childhood immunization programs.',
    consultationFee: 110,
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face',
    availability: defaultSchedule,
    languages: ['English', 'Korean'],
    rating: 4.7,
    totalReviews: 198,
    isAvailable: true,
    createdAt: '2023-04-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'doc-009',
    userId: 'user-doc-009',
    firstName: 'Fatima',
    lastName: 'Al-Hassan',
    email: 'fatima.alhassan@consultara.com',
    phone: '+1-555-0109',
    specialization: 'Developmental Pediatrics',
    department: 'pediatrics',
    licenseNumber: 'MD-PED-003',
    yearsOfExperience: 13,
    education: 'MD from University of Michigan, Fellowship at Cincinnati Children\'s Hospital',
    bio: 'Dr. Fatima Al-Hassan focuses on children with developmental delays, autism spectrum disorders, and learning disabilities. She works closely with families to create individualized care plans.',
    consultationFee: 120,
    avatar: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400&h=400&fit=crop&crop=face',
    availability: defaultSchedule,
    languages: ['English', 'Arabic'],
    rating: 4.8,
    totalReviews: 276,
    isAvailable: true,
    createdAt: '2022-11-20T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },

  // Neurology (2 doctors)
  {
    id: 'doc-010',
    userId: 'user-doc-010',
    firstName: 'Alexander',
    lastName: 'Petrov',
    email: 'alexander.petrov@consultara.com',
    phone: '+1-555-0110',
    specialization: 'Stroke & Neurovascular',
    department: 'neurology',
    licenseNumber: 'MD-NEU-001',
    yearsOfExperience: 17,
    education: 'MD from University of Chicago, Neurology Residency at UCSF, Stroke Fellowship at Mayo Clinic',
    bio: 'Dr. Alexander Petrov is a leading expert in stroke prevention and treatment. He has developed protocols that have significantly improved patient outcomes.',
    consultationFee: 170,
    avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face',
    availability: defaultSchedule,
    languages: ['English', 'Russian'],
    rating: 4.9,
    totalReviews: 389,
    isAvailable: true,
    createdAt: '2022-03-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'doc-011',
    userId: 'user-doc-011',
    firstName: 'Grace',
    lastName: 'Okonkwo',
    email: 'grace.okonkwo@consultara.com',
    phone: '+1-555-0111',
    specialization: 'Epilepsy & Sleep Disorders',
    department: 'neurology',
    licenseNumber: 'MD-NEU-002',
    yearsOfExperience: 9,
    education: 'MD from Northwestern University, Fellowship in Epilepsy at Emory University',
    bio: 'Dr. Grace Okonkwo specializes in epilepsy management and sleep medicine. She uses cutting-edge diagnostic tools to provide personalized treatment plans.',
    consultationFee: 155,
    avatar: 'https://images.unsplash.com/photo-1643297654416-05795d62e39c?w=400&h=400&fit=crop&crop=face',
    availability: defaultSchedule,
    languages: ['English', 'Igbo'],
    rating: 4.7,
    totalReviews: 187,
    isAvailable: true,
    createdAt: '2023-05-10T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },

  // Orthopedics (2 doctors)
  {
    id: 'doc-012',
    userId: 'user-doc-012',
    firstName: 'James',
    lastName: 'Murphy',
    email: 'james.murphy@consultara.com',
    phone: '+1-555-0112',
    specialization: 'Sports Medicine',
    department: 'orthopedics',
    licenseNumber: 'MD-ORT-001',
    yearsOfExperience: 14,
    education: 'MD from University of Pittsburgh, Sports Medicine Fellowship at Hospital for Special Surgery',
    bio: 'Dr. James Murphy is a sports medicine specialist who has worked with professional athletes. He focuses on minimally invasive procedures and rehabilitation.',
    consultationFee: 145,
    avatar: 'https://images.unsplash.com/photo-1580281657702-257584239a55?w=400&h=400&fit=crop&crop=face',
    availability: defaultSchedule,
    languages: ['English', 'Irish'],
    rating: 4.8,
    totalReviews: 423,
    isAvailable: true,
    createdAt: '2022-07-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'doc-013',
    userId: 'user-doc-013',
    firstName: 'Anika',
    lastName: 'Sharma',
    email: 'anika.sharma@consultara.com',
    phone: '+1-555-0113',
    specialization: 'Spine Surgery',
    department: 'orthopedics',
    licenseNumber: 'MD-ORT-002',
    yearsOfExperience: 16,
    education: 'MD from Washington University, Spine Surgery Fellowship at Cedars-Sinai',
    bio: 'Dr. Anika Sharma specializes in complex spine conditions including herniated discs, spinal stenosis, and scoliosis. She emphasizes conservative treatment before surgery.',
    consultationFee: 165,
    avatar: 'https://images.unsplash.com/photo-1559839914-17aae19cec71?w=400&h=400&fit=crop&crop=face',
    availability: defaultSchedule,
    languages: ['English', 'Hindi', 'Punjabi'],
    rating: 4.9,
    totalReviews: 356,
    isAvailable: true,
    createdAt: '2022-01-20T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },

  // Gynecology (2 doctors)
  {
    id: 'doc-014',
    userId: 'user-doc-014',
    firstName: 'Jennifer',
    lastName: 'Thompson',
    email: 'jennifer.thompson@consultara.com',
    phone: '+1-555-0114',
    specialization: 'Obstetrics & High-Risk Pregnancy',
    department: 'gynecology',
    licenseNumber: 'MD-GYN-001',
    yearsOfExperience: 19,
    education: 'MD from Vanderbilt University, OB/GYN Residency at Johns Hopkins, MFM Fellowship',
    bio: 'Dr. Jennifer Thompson specializes in high-risk pregnancies and maternal-fetal medicine. She provides comprehensive prenatal care with a compassionate approach.',
    consultationFee: 140,
    avatar: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=400&h=400&fit=crop&crop=face',
    availability: defaultSchedule,
    languages: ['English'],
    rating: 4.9,
    totalReviews: 512,
    isAvailable: true,
    createdAt: '2021-08-10T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'doc-015',
    userId: 'user-doc-015',
    firstName: 'Olga',
    lastName: 'Volkov',
    email: 'olga.volkov@consultara.com',
    phone: '+1-555-0115',
    specialization: 'Reproductive Endocrinology',
    department: 'gynecology',
    licenseNumber: 'MD-GYN-002',
    yearsOfExperience: 12,
    education: 'MD from Cornell University, REI Fellowship at NYU Fertility Center',
    bio: 'Dr. Olga Volkov is a fertility specialist helping couples achieve their dream of parenthood. She offers IVF, IUI, and comprehensive fertility evaluations.',
    consultationFee: 175,
    avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=400&fit=crop&crop=face',
    availability: defaultSchedule,
    languages: ['English', 'Russian', 'Ukrainian'],
    rating: 4.8,
    totalReviews: 287,
    isAvailable: true,
    createdAt: '2022-10-05T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },

  // Ophthalmology (2 doctors)
  {
    id: 'doc-016',
    userId: 'user-doc-016',
    firstName: 'Robert',
    lastName: 'Chang',
    email: 'robert.chang@consultara.com',
    phone: '+1-555-0116',
    specialization: 'Retina & Vitreous',
    department: 'ophthalmology',
    licenseNumber: 'MD-OPH-001',
    yearsOfExperience: 15,
    education: 'MD from UCLA, Ophthalmology Residency at Wills Eye Hospital, Retina Fellowship at Bascom Palmer',
    bio: 'Dr. Robert Chang is a retina specialist treating conditions like macular degeneration, diabetic retinopathy, and retinal detachment with advanced surgical techniques.',
    consultationFee: 160,
    avatar: 'https://images.unsplash.com/photo-1612531386530-97286d97c2d2?w=400&h=400&fit=crop&crop=face',
    availability: defaultSchedule,
    languages: ['English', 'Cantonese', 'Mandarin'],
    rating: 4.9,
    totalReviews: 398,
    isAvailable: true,
    createdAt: '2022-04-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'doc-017',
    userId: 'user-doc-017',
    firstName: 'Amara',
    lastName: 'Diallo',
    email: 'amara.diallo@consultara.com',
    phone: '+1-555-0117',
    specialization: 'Glaucoma & Cataracts',
    department: 'ophthalmology',
    licenseNumber: 'MD-OPH-002',
    yearsOfExperience: 11,
    education: 'MD from Emory University, Glaucoma Fellowship at Jules Stein Eye Institute',
    bio: 'Dr. Amara Diallo specializes in glaucoma management and cataract surgery. She uses the latest laser technology for precise and effective treatments.',
    consultationFee: 150,
    avatar: 'https://images.unsplash.com/photo-1623854767648-e7bb8009f0db?w=400&h=400&fit=crop&crop=face',
    availability: defaultSchedule,
    languages: ['English', 'French', 'Wolof'],
    rating: 4.7,
    totalReviews: 234,
    isAvailable: true,
    createdAt: '2023-02-10T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },

  // Psychiatry (2 doctors)
  {
    id: 'doc-018',
    userId: 'user-doc-018',
    firstName: 'Michael',
    lastName: 'Bergman',
    email: 'michael.bergman@consultara.com',
    phone: '+1-555-0118',
    specialization: 'Adult Psychiatry',
    department: 'psychiatry',
    licenseNumber: 'MD-PSY-001',
    yearsOfExperience: 18,
    education: 'MD from University of Pennsylvania, Psychiatry Residency at McLean Hospital',
    bio: 'Dr. Michael Bergman provides comprehensive mental health care including medication management and psychotherapy. He specializes in mood disorders and anxiety.',
    consultationFee: 180,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    availability: defaultSchedule,
    languages: ['English', 'German'],
    rating: 4.9,
    totalReviews: 445,
    isAvailable: true,
    createdAt: '2021-11-05T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'doc-019',
    userId: 'user-doc-019',
    firstName: 'Sophia',
    lastName: 'Martinez',
    email: 'sophia.martinez@consultara.com',
    phone: '+1-555-0119',
    specialization: 'Child & Adolescent Psychiatry',
    department: 'psychiatry',
    licenseNumber: 'MD-PSY-002',
    yearsOfExperience: 10,
    education: 'MD from USC, Child Psychiatry Fellowship at UCLA',
    bio: 'Dr. Sophia Martinez helps children and teenagers navigate mental health challenges. She works with families to create supportive environments for healing.',
    consultationFee: 165,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
    availability: defaultSchedule,
    languages: ['English', 'Spanish'],
    rating: 4.8,
    totalReviews: 312,
    isAvailable: true,
    createdAt: '2023-01-10T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },

  // General Medicine (3 doctors)
  {
    id: 'doc-020',
    userId: 'user-doc-020',
    firstName: 'William',
    lastName: 'Brown',
    email: 'william.brown@consultara.com',
    phone: '+1-555-0120',
    specialization: 'Internal Medicine',
    department: 'general-medicine',
    licenseNumber: 'MD-GEN-001',
    yearsOfExperience: 22,
    education: 'MD from University of Virginia, Internal Medicine Residency at Duke',
    bio: 'Dr. William Brown provides comprehensive primary care for adults. He emphasizes preventive medicine and chronic disease management with a patient-centered approach.',
    consultationFee: 90,
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
    availability: defaultSchedule,
    languages: ['English'],
    rating: 4.8,
    totalReviews: 678,
    isAvailable: true,
    createdAt: '2020-06-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'doc-021',
    userId: 'user-doc-021',
    firstName: 'Linda',
    lastName: 'Nguyen',
    email: 'linda.nguyen@consultara.com',
    phone: '+1-555-0121',
    specialization: 'Family Medicine',
    department: 'general-medicine',
    licenseNumber: 'MD-GEN-002',
    yearsOfExperience: 13,
    education: 'MD from University of Washington, Family Medicine Residency at UCSF',
    bio: 'Dr. Linda Nguyen treats patients of all ages, from newborns to seniors. She believes in building long-term relationships with her patients and their families.',
    consultationFee: 85,
    avatar: 'https://images.unsplash.com/photo-1590611936760-eeb9bc598548?w=400&h=400&fit=crop&crop=face',
    availability: defaultSchedule,
    languages: ['English', 'Vietnamese'],
    rating: 4.9,
    totalReviews: 534,
    isAvailable: true,
    createdAt: '2022-02-20T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'doc-022',
    userId: 'user-doc-022',
    firstName: 'Hassan',
    lastName: 'Ibrahim',
    email: 'hassan.ibrahim@consultara.com',
    phone: '+1-555-0122',
    specialization: 'Geriatric Medicine',
    department: 'general-medicine',
    licenseNumber: 'MD-GEN-003',
    yearsOfExperience: 15,
    education: 'MD from Georgetown University, Geriatrics Fellowship at Mount Sinai',
    bio: 'Dr. Hassan Ibrahim specializes in healthcare for older adults, managing multiple chronic conditions and optimizing quality of life in the elderly.',
    consultationFee: 95,
    avatar: 'https://images.unsplash.com/photo-1618498082410-b4aa22193b38?w=400&h=400&fit=crop&crop=face',
    availability: defaultSchedule,
    languages: ['English', 'Arabic', 'Farsi'],
    rating: 4.8,
    totalReviews: 412,
    isAvailable: true,
    createdAt: '2022-05-10T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },

  // ENT (3 doctors)
  {
    id: 'doc-023',
    userId: 'user-doc-023',
    firstName: 'Catherine',
    lastName: 'Lee',
    email: 'catherine.lee@consultara.com',
    phone: '+1-555-0123',
    specialization: 'Otology & Hearing',
    department: 'ent',
    licenseNumber: 'MD-ENT-001',
    yearsOfExperience: 14,
    education: 'MD from Baylor College of Medicine, ENT Residency at Mass Eye and Ear',
    bio: 'Dr. Catherine Lee specializes in ear disorders and hearing restoration. She performs cochlear implant surgeries and treats conditions causing hearing loss.',
    consultationFee: 135,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
    availability: defaultSchedule,
    languages: ['English', 'Korean', 'Mandarin'],
    rating: 4.8,
    totalReviews: 287,
    isAvailable: true,
    createdAt: '2022-08-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'doc-024',
    userId: 'user-doc-024',
    firstName: 'Daniel',
    lastName: 'Costa',
    email: 'daniel.costa@consultara.com',
    phone: '+1-555-0124',
    specialization: 'Rhinology & Sinus',
    department: 'ent',
    licenseNumber: 'MD-ENT-002',
    yearsOfExperience: 11,
    education: 'MD from University of Miami, Rhinology Fellowship at Stanford',
    bio: 'Dr. Daniel Costa treats chronic sinusitis, nasal polyps, and other nasal disorders. He specializes in minimally invasive endoscopic sinus surgery.',
    consultationFee: 140,
    avatar: 'https://images.unsplash.com/photo-1600878459138-e1123b37cb30?w=400&h=400&fit=crop&crop=face',
    availability: defaultSchedule,
    languages: ['English', 'Portuguese', 'Spanish'],
    rating: 4.7,
    totalReviews: 223,
    isAvailable: true,
    createdAt: '2023-03-20T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'doc-025',
    userId: 'user-doc-025',
    firstName: 'Rachel',
    lastName: 'Gold',
    email: 'rachel.gold@consultara.com',
    phone: '+1-555-0125',
    specialization: 'Laryngology & Voice',
    department: 'ent',
    licenseNumber: 'MD-ENT-003',
    yearsOfExperience: 12,
    education: 'MD from NYU, Laryngology Fellowship at Cleveland Clinic',
    bio: 'Dr. Rachel Gold specializes in voice and swallowing disorders. She works with professional singers and speakers to protect and restore their vocal health.',
    consultationFee: 145,
    avatar: 'https://images.unsplash.com/photo-1558898479-33c0057a5d12?w=400&h=400&fit=crop&crop=face',
    availability: defaultSchedule,
    languages: ['English', 'Hebrew'],
    rating: 4.9,
    totalReviews: 298,
    isAvailable: true,
    location: 'Quezon City',
    acceptsInsurance: true,
    contactNumber: '+63-2-8100-0125',
    createdAt: '2022-12-10T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  }
];

// Metro Manila locations for default assignment
const metroManilaLocations = [
  'Makati City', 'Quezon City', 'Manila', 'Taguig City', 'Pasig City',
  'Mandaluyong City', 'San Juan City', 'Parañaque City', 'Pasay City',
  'Muntinlupa City', 'Las Piñas City', 'Marikina City', 'Caloocan City',
];

type DoctorView = DoctorProfile & {
  name: string;
  specialty: string;
};

const usedDoctorNames = new Set<string>();
const usedDoctorAvatars = new Set<string>();

const normalizeDoctor = (doc: DoctorProfile, index: number): DoctorView => {
  let firstName = doc.firstName;
  let lastName = doc.lastName;
  const baseName = `${firstName} ${lastName}`.trim();

  if (usedDoctorNames.has(baseName)) {
    lastName = `${lastName} ${index + 1}`;
  }

  const name = `${firstName} ${lastName}`.trim();
  usedDoctorNames.add(name);

  let avatar = doc.avatar;
  // Prefer local professional avatars in this order: .jpg, .png, .svg
  const jpgAvatar = `/professional-doctors/${doc.id}.jpg`;
  const pngAvatar = `/professional-doctors/${doc.id}.png`;
  const svgAvatar = `/professional-doctors/${doc.id}.svg`;
  avatar = jpgAvatar || pngAvatar || svgAvatar || doc.avatar;
  if (!avatar || usedDoctorAvatars.has(avatar)) {
    avatar = doc.avatar || `https://i.pravatar.cc/150?img=${(index % 70) + 1}`;
  }

  usedDoctorAvatars.add(avatar);

  return {
    ...doc,
    firstName,
    lastName,
    name,
    avatar,
    specialty: doc.specialization,
    location: doc.location || metroManilaLocations[index % metroManilaLocations.length],
    acceptsInsurance: doc.acceptsInsurance !== undefined ? doc.acceptsInsurance : index % 3 !== 2,
    contactNumber: doc.contactNumber || `+63-2-8100-${String(index + 1).padStart(4, '0')}`,
    availability: diversifySchedule(doc.availability, index),
  };
};

function diversifySchedule(schedule: WeeklySchedule, index: number): WeeklySchedule {
  const dayKeys: Array<keyof WeeklySchedule> = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  const offDay = dayKeys[index % dayKeys.length];
  const shiftMode = index % 3;

  const cloneDay = (day: WeeklySchedule[keyof WeeklySchedule]) => ({
    isWorkingDay: day.isWorkingDay,
    slots: day.slots.map(slot => ({ ...slot })),
  });

  const next: WeeklySchedule = {
    monday: cloneDay(schedule.monday),
    tuesday: cloneDay(schedule.tuesday),
    wednesday: cloneDay(schedule.wednesday),
    thursday: cloneDay(schedule.thursday),
    friday: cloneDay(schedule.friday),
    saturday: cloneDay(schedule.saturday),
    sunday: cloneDay(schedule.sunday),
  };

  next[offDay] = { isWorkingDay: false, slots: [] };

  dayKeys.forEach((key) => {
    if (!next[key].isWorkingDay) return;
    if (shiftMode === 0) {
      next[key].slots = next[key].slots.filter(slot => slot.startTime < "12:00");
    } else if (shiftMode === 1) {
      next[key].slots = next[key].slots.filter(slot => slot.startTime >= "13:00");
    }
  });

  return next;
}

// Combine base doctors with extended doctors
export const doctors: DoctorView[] = [...baseDoctors, ...extendedDoctors].map((doc, index) =>
  normalizeDoctor(doc, index)
);

// ============================================================================
// Sample Patient Profile
// ============================================================================

export const samplePatient: PatientProfile = {
  id: 'patient-001',
  userId: 'user-patient-001',
  firstName: 'Juan',
  lastName: 'Dela Cruz',
  email: 'juan.delacruz@email.com',
  phone: '+63-917-123-4567',
  dateOfBirth: '1990-05-15',
  gender: 'male',
  address: '123 Rizal Street',
  city: 'Makati City',
  state: 'Metro Manila',
  zipCode: '1200',
  emergencyContact: 'Maria Dela Cruz',
  emergencyPhone: '+63-917-765-4321',
  bloodType: 'O+',
  allergies: ['Penicillin', 'Peanuts'],
  medicalConditions: ['Mild Asthma'],
  currentMedications: ['Albuterol Inhaler'],
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z'
};

// ============================================================================
// Sample Appointments
// ============================================================================

export const sampleAppointments: Appointment[] = [
  {
    id: 'apt-001',
    patientId: 'patient-001',
    doctorId: 'doc-001',
    date: '2026-05-30',
    timeSlot: { startTime: '10:00', endTime: '10:30', isAvailable: false },
    consultationType: 'video',
    status: 'confirmed',
    symptoms: 'Experiencing occasional chest discomfort and shortness of breath',
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'apt-002',
    patientId: 'patient-001',
    doctorId: 'doc-020',
    date: '2026-06-02',
    timeSlot: { startTime: '14:00', endTime: '14:30', isAvailable: false },
    consultationType: 'video',
    status: 'pending',
    symptoms: 'Annual general checkup',
    createdAt: '2024-01-12T00:00:00Z',
    updatedAt: '2024-01-12T00:00:00Z'
  },
  {
    id: 'apt-003',
    patientId: 'patient-001',
    doctorId: 'doc-004',
    date: '2026-05-20',
    timeSlot: { startTime: '09:30', endTime: '10:00', isAvailable: false },
    consultationType: 'video',
    status: 'completed',
    symptoms: 'Skin rash on forearm',
    notes: 'Prescribed topical corticosteroid. Follow up in 2 weeks if no improvement.',
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  }
];

// ============================================================================
// Sample Medical Records
// ============================================================================

export const sampleMedicalRecords: MedicalRecord[] = [
  {
    id: 'record-001',
    patientId: 'patient-001',
    consultationId: 'cons-001',
    doctorId: 'doc-004',
    doctorName: 'Dr. Emily Johnson',
    date: '2026-05-20',
    diagnosis: 'Contact Dermatitis',
    symptoms: ['skin rash', 'itching', 'redness'],
    treatment: 'Topical corticosteroid cream twice daily for 2 weeks',
    prescription: {
      id: 'rx-001',
      consultationId: 'cons-001',
      medications: [
        {
          name: 'Hydrocortisone Cream 1%',
          dosage: 'Apply thin layer',
          frequency: 'Twice daily',
          duration: '2 weeks',
          instructions: 'Apply to affected area after cleaning'
        }
      ],
      instructions: 'Avoid contact with irritants. Keep the area clean and dry.',
      validUntil: '2026-06-20',
      createdAt: '2026-05-20T00:00:00Z'
    },
    followUpRequired: true,
    followUpDate: '2026-06-03',
    createdAt: '2026-05-20T00:00:00Z'
  },
  {
    id: 'record-002',
    patientId: 'patient-001',
    consultationId: 'cons-002',
    doctorId: 'doc-020',
    doctorName: 'Dr. William Brown',
    date: '2026-04-15',
    diagnosis: 'Annual Wellness Exam - Healthy',
    symptoms: ['routine checkup'],
    treatment: 'No treatment required. Continue current medications.',
    followUpRequired: false,
    createdAt: '2026-04-15T00:00:00Z'
  }
];

// ============================================================================
// Sample Notifications
// ============================================================================

export const sampleNotifications: Notification[] = [
  {
    id: 'notif-001',
    userId: 'user-patient-001',
    type: 'appointment-confirmed',
    title: 'Appointment Confirmed',
    message: 'Your appointment with Dr. Sarah Chen on May 30, 2026 at 10:00 AM has been confirmed.',
    isRead: false,
    actionUrl: '/patient/appointments/apt-001',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'notif-002',
    userId: 'user-patient-001',
    type: 'appointment-reminder',
    title: 'Upcoming Appointment',
    message: 'Reminder: You have an appointment with Dr. William Brown tomorrow at 2:00 PM.',
    isRead: false,
    actionUrl: '/patient/appointments/apt-002',
    createdAt: '2024-01-14T09:00:00Z'
  },
  {
    id: 'notif-003',
    userId: 'user-patient-001',
    type: 'prescription-ready',
    title: 'Prescription Available',
    message: 'Your prescription from Dr. Emily Johnson is ready for download.',
    isRead: true,
    actionUrl: '/patient/records',
    createdAt: '2024-01-10T14:30:00Z'
  }
];

// ============================================================================
// Sample Conversations
// ============================================================================

export const sampleConversations: Conversation[] = [
  {
    id: 'conv-001',
    participants: {
      patientId: 'patient-001',
      doctorId: 'doc-001'
    },
    lastMessage: {
      id: 'msg-003',
      conversationId: 'conv-001',
      senderId: 'doc-001',
      senderRole: 'doctor',
      content: 'Please remember to take your blood pressure readings before our appointment.',
      isRead: false,
      createdAt: '2024-01-15T08:30:00Z'
    },
    unreadCount: 1,
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-15T08:30:00Z'
  },
  {
    id: 'conv-002',
    participants: {
      patientId: 'patient-001',
      doctorId: 'doc-004'
    },
    lastMessage: {
      id: 'msg-006',
      conversationId: 'conv-002',
      senderId: 'patient-001',
      senderRole: 'patient',
      content: 'Thank you, the cream is working well. The rash is much better.',
      isRead: true,
      createdAt: '2024-01-12T15:45:00Z'
    },
    unreadCount: 0,
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-12T15:45:00Z'
  }
];

// ============================================================================
// Sample Messages
// ============================================================================

export const sampleMessages: Message[] = [
  {
    id: 'msg-001',
    conversationId: 'conv-001',
    senderId: 'patient-001',
    senderRole: 'patient',
    content: 'Hello Dr. Chen, I wanted to ask about my upcoming appointment.',
    isRead: true,
    createdAt: '2024-01-10T10:00:00Z'
  },
  {
    id: 'msg-002',
    conversationId: 'conv-001',
    senderId: 'doc-001',
    senderRole: 'doctor',
    content: 'Hello! Yes, I see you have an appointment scheduled for May 30. How can I help you prepare?',
    isRead: true,
    createdAt: '2024-01-10T11:30:00Z'
  },
  {
    id: 'msg-003',
    conversationId: 'conv-001',
    senderId: 'doc-001',
    senderRole: 'doctor',
    content: 'Please remember to take your blood pressure readings before our appointment.',
    isRead: false,
    createdAt: '2024-01-15T08:30:00Z'
  },
  {
    id: 'msg-004',
    conversationId: 'conv-002',
    senderId: 'doc-004',
    senderRole: 'doctor',
    content: 'How is the rash responding to the treatment?',
    isRead: true,
    createdAt: '2024-01-12T10:00:00Z'
  },
  {
    id: 'msg-005',
    conversationId: 'conv-002',
    senderId: 'patient-001',
    senderRole: 'patient',
    content: 'Thank you, the cream is working well. The rash is much better.',
    isRead: true,
    createdAt: '2024-01-12T15:45:00Z'
  }
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get doctors by department
 */
export function getDoctorsByDepartment(department: Department): DoctorProfile[] {
  return doctors.filter(doc => doc.department === department);
}

/**
 * Get department info by ID
 */
export function getDepartmentById(id: Department): DepartmentInfo | undefined {
  return departments.find(dept => dept.id === id);
}

/**
 * Get doctor by ID
 */
export function getDoctorById(id: string): DoctorProfile | undefined {
  return doctors.find(doc => doc.id === id);
}

/**
 * Search doctors by name or specialization
 */
export function searchDoctors(query: string): DoctorProfile[] {
  const lowercaseQuery = query.toLowerCase();
  return doctors.filter(doc => 
    doc.firstName.toLowerCase().includes(lowercaseQuery) ||
    doc.lastName.toLowerCase().includes(lowercaseQuery) ||
    doc.specialization.toLowerCase().includes(lowercaseQuery)
  );
}

/**
 * Get available time slots for a doctor on a specific date
 */
export function getAvailableSlots(doctorId: string, date: string): { startTime: string; endTime: string }[] {
  const doctor = getDoctorById(doctorId);
  if (!doctor) return [];
  
  const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof WeeklySchedule;
  const daySchedule = doctor.availability[dayOfWeek];
  
  if (!daySchedule.isWorkingDay) return [];
  
  return daySchedule.slots
    .filter(slot => slot.isAvailable)
    .map(({ startTime, endTime }) => ({ startTime, endTime }));
}

// ============================================================================
// Constants for UI
// ============================================================================

/**
 * Department names for filtering
 */
export const DEPARTMENTS = [
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

/**
 * Available locations for filtering (Metro Manila)
 */
export const LOCATIONS = [
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
  'Malabon City',
  'Navotas City',
  'Pateros',
];
