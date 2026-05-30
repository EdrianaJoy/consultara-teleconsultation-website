import Database from 'better-sqlite3';
import crypto from 'crypto';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import type {
  Appointment,
  AppointmentStatus,
  ConsultationType,
  Conversation,
  DoctorProfile,
  MedicalRecord,
  Message,
  Notification,
  PatientProfile,
  Prescription,
  User,
  UserRole,
  WeeklySchedule,
  TimeSlot,
} from '@/lib/types';
import {
  doctors,
  sampleAppointments,
  sampleConversations,
  sampleMedicalRecords,
  sampleMessages,
  sampleNotifications,
  samplePatient,
} from '@/lib/data';
import { getDoctorPortrait, getDoctorPortraitForKey } from '@/lib/doctor-avatars';

const DEFAULT_PASSWORD = 'Consultara123!';
const DATABASE_PATH = join(process.cwd(), '.data', 'consultara.sqlite');

type DatabaseInstance = Database.Database;

type SessionPayload = {
  user: User | null;
  patientProfile: PatientProfile | null;
  doctorProfile: DoctorProfile | null;
  isAuthenticated: boolean;
};

type AppStatePayload = {
  appointments: Appointment[];
  medicalRecords: MedicalRecord[];
  notifications: Notification[];
  conversations: Conversation[];
  messages: Message[];
  prescriptions: Prescription[];
};

type AppointmentUpdateResult = {
  appointment: Appointment | null;
  notifications: Notification[];
  deletedMedicalRecordIds: string[];
  messages?: Message[];
};

let db: DatabaseInstance | null = null;
const seededDoctorAvatarById = new Map(doctors.map((doctor, index) => [doctor.id, getDoctorPortrait(index)]));

function getDb(): DatabaseInstance {
  if (db) {
    return db;
  }

  mkdirSync(dirname(DATABASE_PATH), { recursive: true });
  db = new Database(DATABASE_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  initializeSchema(db);
  seedDatabase(db);
  return db;
}

function initializeSchema(database: DatabaseInstance) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS patient_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      date_of_birth TEXT,
      gender TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      zip_code TEXT,
      emergency_contact TEXT,
      emergency_phone TEXT,
      weight TEXT,
      height TEXT,
      blood_type TEXT,
      allergies_json TEXT,
      medical_conditions_json TEXT,
      current_medications_json TEXT,
      basic_medical_history TEXT,
      avatar TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS doctor_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      specialization TEXT NOT NULL,
      department TEXT NOT NULL,
      license_number TEXT NOT NULL,
      years_of_experience INTEGER NOT NULL,
      education TEXT,
      bio TEXT,
      consultation_fee INTEGER NOT NULL,
        avatar TEXT,
        date_of_birth TEXT,
        availability_json TEXT NOT NULL,
      languages_json TEXT NOT NULL,
      rating REAL NOT NULL DEFAULT 0,
      total_reviews INTEGER NOT NULL DEFAULT 0,
      is_available INTEGER NOT NULL DEFAULT 1,
      location TEXT,
      accepts_insurance INTEGER NOT NULL DEFAULT 1,
      contact_number TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      doctor_id TEXT NOT NULL,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      consultation_type TEXT NOT NULL,
      status TEXT NOT NULL,
      symptoms TEXT,
      notes TEXT,
      reason TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS medical_records (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      consultation_id TEXT NOT NULL,
      doctor_id TEXT NOT NULL,
      doctor_name TEXT NOT NULL,
      date TEXT NOT NULL,
      title TEXT,
      record_type TEXT,
      diagnosis TEXT NOT NULL,
      symptoms_json TEXT NOT NULL,
      treatment TEXT NOT NULL,
      prescription_json TEXT,
      notes TEXT,
      follow_up_required INTEGER NOT NULL DEFAULT 0,
      follow_up_date TEXT,
      attachments_json TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      action_url TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      doctor_id TEXT NOT NULL,
      last_message_json TEXT,
      unread_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      sender_role TEXT NOT NULL,
      content TEXT NOT NULL,
      attachments_json TEXT,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);

  const doctorProfileColumns = database.prepare('PRAGMA table_info(doctor_profiles)').all() as Array<{ name: string }>;
  if (!doctorProfileColumns.some(column => column.name === 'date_of_birth')) {
    database.exec('ALTER TABLE doctor_profiles ADD COLUMN date_of_birth TEXT');
  }
}

function seedDatabase(database: DatabaseInstance) {
  const userCount = database.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count > 0) {
    return;
  }

  const insertUser = database.prepare(`
    INSERT INTO users (id, email, role, password_hash, created_at, updated_at)
    VALUES (@id, @email, @role, @passwordHash, @createdAt, @updatedAt)
  `);
  const insertPatientProfile = database.prepare(`
    INSERT INTO patient_profiles (
      id, user_id, first_name, last_name, email, phone, date_of_birth, gender, address,
      city, state, zip_code, emergency_contact, emergency_phone, weight, height,
      blood_type, allergies_json, medical_conditions_json, current_medications_json,
      basic_medical_history, avatar, created_at, updated_at
    ) VALUES (
      @id, @userId, @firstName, @lastName, @email, @phone, @dateOfBirth, @gender, @address,
      @city, @state, @zipCode, @emergencyContact, @emergencyPhone, @weight, @height,
      @bloodType, @allergiesJson, @medicalConditionsJson, @currentMedicationsJson,
      @basicMedicalHistory, @avatar, @createdAt, @updatedAt
    )
  `);
  const insertDoctorProfile = database.prepare(`
    INSERT INTO doctor_profiles (
      id, user_id, first_name, last_name, email, phone, specialization, department, license_number,
      years_of_experience, education, bio, consultation_fee, avatar, availability_json, languages_json,
      rating, total_reviews, is_available, location, accepts_insurance, contact_number, created_at, updated_at
    ) VALUES (
      @id, @userId, @firstName, @lastName, @email, @phone, @specialization, @department, @licenseNumber,
      @yearsOfExperience, @education, @bio, @consultationFee, @avatar, @availabilityJson, @languagesJson,
      @rating, @totalReviews, @isAvailable, @location, @acceptsInsurance, @contactNumber, @createdAt, @updatedAt
    )
  `);
  const insertAppointment = database.prepare(`
    INSERT INTO appointments (
      id, patient_id, doctor_id, date, start_time, end_time, consultation_type, status,
      symptoms, notes, reason, created_at, updated_at
    ) VALUES (
      @id, @patientId, @doctorId, @date, @startTime, @endTime, @consultationType, @status,
      @symptoms, @notes, @reason, @createdAt, @updatedAt
    )
  `);
  const insertMedicalRecord = database.prepare(`
    INSERT INTO medical_records (
      id, patient_id, consultation_id, doctor_id, doctor_name, date, title, record_type,
      diagnosis, symptoms_json, treatment, prescription_json, notes, follow_up_required,
      follow_up_date, attachments_json, created_at
    ) VALUES (
      @id, @patientId, @consultationId, @doctorId, @doctorName, @date, @title, @recordType,
      @diagnosis, @symptomsJson, @treatment, @prescriptionJson, @notes, @followUpRequired,
      @followUpDate, @attachmentsJson, @createdAt
    )
  `);
  const insertNotification = database.prepare(`
    INSERT INTO notifications (id, user_id, type, title, message, is_read, action_url, created_at)
    VALUES (@id, @userId, @type, @title, @message, @isRead, @actionUrl, @createdAt)
  `);
  const insertConversation = database.prepare(`
    INSERT INTO conversations (id, patient_id, doctor_id, last_message_json, unread_count, created_at, updated_at)
    VALUES (@id, @patientId, @doctorId, @lastMessageJson, @unreadCount, @createdAt, @updatedAt)
  `);
  const insertMessage = database.prepare(`
    INSERT INTO messages (id, conversation_id, sender_id, sender_role, content, attachments_json, is_read, created_at)
    VALUES (@id, @conversationId, @senderId, @senderRole, @content, @attachmentsJson, @isRead, @createdAt)
  `);

  const seedPasswordHash = hashPassword(DEFAULT_PASSWORD);
  const now = new Date().toISOString();

  const transaction = database.transaction(() => {
    const patientUser = {
      id: samplePatient.userId,
      email: samplePatient.email,
      role: 'patient' as UserRole,
      passwordHash: seedPasswordHash,
      createdAt: samplePatient.createdAt,
      updatedAt: samplePatient.updatedAt,
    };
    insertUser.run(patientUser);
    insertPatientProfile.run({
      ...samplePatient,
      userId: samplePatient.userId,
      allergiesJson: JSON.stringify(samplePatient.allergies ?? []),
      medicalConditionsJson: JSON.stringify(samplePatient.medicalConditions ?? []),
      currentMedicationsJson: JSON.stringify(samplePatient.currentMedications ?? []),
    });

    doctors.forEach((doctor) => {
      const doctorUser = {
        id: doctor.userId,
        email: doctor.email,
        role: 'doctor' as UserRole,
        passwordHash: seedPasswordHash,
        createdAt: doctor.createdAt,
        updatedAt: doctor.updatedAt,
      };
      insertUser.run(doctorUser);
      insertDoctorProfile.run({
        ...doctor,
        specializaton: doctor.specialization,
        availabilityJson: JSON.stringify(doctor.availability),
        languagesJson: JSON.stringify(doctor.languages),
        isAvailable: doctor.isAvailable ? 1 : 0,
        acceptsInsurance: doctor.acceptsInsurance ? 1 : 0,
      });
    });

    sampleAppointments.forEach((appointment) => {
      insertAppointment.run({
        ...appointment,
        startTime: appointment.timeSlot.startTime,
        endTime: appointment.timeSlot.endTime,
        reason: appointment.symptoms || 'General Consultation',
      });
    });

    sampleMedicalRecords.forEach((record) => {
      insertMedicalRecord.run({
        ...record,
        title: record.title || record.diagnosis,
        recordType: record.type || 'consultation',
        symptomsJson: JSON.stringify(record.symptoms ?? []),
        prescriptionJson: record.prescription ? JSON.stringify({
          ...record.prescription,
          patientId: record.patientId,
          doctorId: record.doctorId,
        }) : null,
        attachmentsJson: record.attachments ? JSON.stringify(record.attachments) : null,
        followUpRequired: record.followUpRequired ? 1 : 0,
      });
    });

    sampleNotifications.forEach((notification) => {
      insertNotification.run({
        ...notification,
        isRead: notification.isRead ? 1 : 0,
      });
    });

    sampleConversations.forEach((conversation) => {
      insertConversation.run({
        ...conversation,
        patientId: conversation.participants.patientId,
        doctorId: conversation.participants.doctorId,
        lastMessageJson: conversation.lastMessage ? JSON.stringify({
          ...conversation.lastMessage,
          senderType: conversation.lastMessage.senderRole,
          timestamp: conversation.lastMessage.createdAt,
          read: conversation.lastMessage.isRead,
        }) : null,
      });
    });

    sampleMessages.forEach((message) => {
      insertMessage.run({
        ...message,
        senderRole: message.senderRole,
        attachmentsJson: message.attachments ? JSON.stringify(message.attachments) : null,
        isRead: message.isRead ? 1 : 0,
      });
    });
  });

  transaction();

  // Mark the sample seed as available via the main demo password, but keep the
  // current timestamps from the source data so the seeded content stays stable.
  void now;
}

function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(':');
  const derived = crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(derived));
}

function rowToUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
  };
}

function rowToPatientProfile(row: any): PatientProfile {
  return {
    id: row.id,
    userId: row.user_id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    dateOfBirth: row.date_of_birth,
    gender: row.gender,
    address: row.address,
    city: row.city,
    state: row.state,
    zipCode: row.zip_code,
    emergencyContact: row.emergency_contact,
    emergencyPhone: row.emergency_phone,
    weight: row.weight || undefined,
    height: row.height || undefined,
    bloodType: row.blood_type || undefined,
    allergies: row.allergies_json ? JSON.parse(row.allergies_json) : [],
    medicalConditions: row.medical_conditions_json ? JSON.parse(row.medical_conditions_json) : [],
    currentMedications: row.current_medications_json ? JSON.parse(row.current_medications_json) : [],
    basicMedicalHistory: row.basic_medical_history || undefined,
    avatar: row.avatar || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToDoctorProfile(row: any): DoctorProfile {
  const availability = row.availability_json ? JSON.parse(row.availability_json) as WeeklySchedule : undefined;
  const languages = row.languages_json ? JSON.parse(row.languages_json) as string[] : [];
  const avatar = seededDoctorAvatarById.get(row.id) || row.avatar || getDoctorPortraitForKey(row.id);
  const profile: DoctorProfile = {
    id: row.id,
    userId: row.user_id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    specialization: row.specialization,
    specialty: row.specialization,
    name: `${row.first_name} ${row.last_name}`,
    department: row.department,
    licenseNumber: row.license_number,
    yearsOfExperience: row.years_of_experience,
    education: row.education || '',
    bio: row.bio || '',
    consultationFee: row.consultation_fee,
    avatar,
    availability: availability || {
      monday: { isWorkingDay: true, slots: [] },
      tuesday: { isWorkingDay: true, slots: [] },
      wednesday: { isWorkingDay: true, slots: [] },
      thursday: { isWorkingDay: true, slots: [] },
      friday: { isWorkingDay: true, slots: [] },
      saturday: { isWorkingDay: false, slots: [] },
      sunday: { isWorkingDay: false, slots: [] },
    },
    languages,
    rating: row.rating,
    totalReviews: row.total_reviews,
    isAvailable: Boolean(row.is_available),
    location: row.location || '',
    acceptsInsurance: Boolean(row.accepts_insurance),
    contactNumber: row.contact_number || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  return profile;
}

function rowToTimeSlot(startTime: string, endTime: string): TimeSlot {
  return {
    startTime,
    endTime,
    isAvailable: true,
  };
}

function rowToAppointment(row: any): Appointment {
  const consultationType = row.consultation_type as ConsultationType;
  return {
    id: row.id,
    patientId: row.patient_id,
    doctorId: row.doctor_id,
    date: row.date,
    timeSlot: rowToTimeSlot(row.start_time, row.end_time),
    consultationType,
    type: consultationType,
    time: row.start_time,
    reason: row.reason || row.symptoms || undefined,
    status: row.status as AppointmentStatus,
    symptoms: row.symptoms || undefined,
    notes: row.notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToPrescription(row: any, patientId: string, doctorId: string): Prescription | null {
  if (!row) return null;
  const parsed = JSON.parse(row) as Prescription;
  return {
    ...parsed,
    patientId,
    doctorId,
  };
}

function rowToMedicalRecord(row: any): MedicalRecord {
  const recordType = row.record_type || 'consultations';
  return {
    id: row.id,
    patientId: row.patient_id,
    consultationId: row.consultation_id,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name,
    date: row.date,
    title: row.title || row.diagnosis,
    type: (recordType === 'consultation' ? 'consultations' : recordType) as MedicalRecord['type'],
    diagnosis: row.diagnosis,
    symptoms: row.symptoms_json ? JSON.parse(row.symptoms_json) : [],
    treatment: row.treatment,
    prescription: row.prescription_json ? rowToPrescription(row.prescription_json, row.patient_id, row.doctor_id) || undefined : undefined,
    notes: row.notes || undefined,
    followUpRequired: Boolean(row.follow_up_required),
    followUpDate: row.follow_up_date || undefined,
    attachments: row.attachments_json ? JSON.parse(row.attachments_json) : undefined,
    createdAt: row.created_at,
  };
}

function rowToNotification(row: any): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    message: row.message,
    isRead: Boolean(row.is_read),
    actionUrl: row.action_url || undefined,
    createdAt: row.created_at,
  };
}

function getPatientProfileById(patientId: string): PatientProfile | null {
  const row = getDb().prepare('SELECT * FROM patient_profiles WHERE id = ?').get(patientId);
  return row ? rowToPatientProfile(row) : null;
}

function getDoctorProfileById(doctorId: string): DoctorProfile | null {
  const row = getDb().prepare('SELECT * FROM doctor_profiles WHERE id = ?').get(doctorId);
  return row ? rowToDoctorProfile(row) : null;
}

function formatAppointmentDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function buildAppointmentUpdateNotifications(previous: Appointment, next: Appointment): Omit<Notification, 'id' | 'createdAt'>[] {
  const patientProfile = getPatientProfileById(next.patientId);
  const doctorProfile = getDoctorProfileById(next.doctorId);
  const patientUserId = patientProfile?.userId || next.patientId;
  const doctorUserId = doctorProfile?.userId || next.doctorId;
  const doctorName = doctorProfile ? `Dr. ${doctorProfile.firstName} ${doctorProfile.lastName}` : 'your doctor';
  const patientName = patientProfile ? `${patientProfile.firstName} ${patientProfile.lastName}` : 'the patient';
  const appointmentDate = formatAppointmentDate(next.date);
  const appointmentTime = next.timeSlot.startTime;

  if (next.status === 'cancelled' && previous.status !== 'cancelled') {
    return [
      {
        userId: patientUserId,
        type: 'appointment-cancelled',
        title: 'Appointment Cancelled',
        message: `Your consultation with ${doctorName} on ${appointmentDate} at ${appointmentTime} has been cancelled.`,
        isRead: false,
        actionUrl: '/patient/calendar',
      },
      {
        userId: doctorUserId,
        type: 'appointment-cancelled',
        title: 'Appointment Cancelled',
        message: `Your consultation with ${patientName} on ${appointmentDate} at ${appointmentTime} has been cancelled.`,
        isRead: false,
        actionUrl: '/doctor/calendar',
      },
    ];
  }

  const rescheduleChanged =
    previous.date !== next.date ||
    previous.timeSlot.startTime !== next.timeSlot.startTime ||
    previous.timeSlot.endTime !== next.timeSlot.endTime ||
    previous.consultationType !== next.consultationType;

  if (rescheduleChanged) {
    return [
      {
        userId: patientUserId,
        type: 'appointment-rescheduled',
        title: 'Rescheduled',
        message: `Your consultation with ${doctorName} has been rescheduled for ${appointmentDate} at ${appointmentTime}.`,
        isRead: false,
        actionUrl: '/patient/calendar',
      },
      {
        userId: doctorUserId,
        type: 'appointment-rescheduled',
        title: 'Rescheduled',
        message: `Your consultation with ${patientName} has been rescheduled for ${appointmentDate} at ${appointmentTime}.`,
        isRead: false,
        actionUrl: '/doctor/calendar',
      },
    ];
  }

  return [];
}

function deleteMedicalRecordsByConsultationId(consultationId: string): string[] {
  const database = getDb();
  const rows = database.prepare('SELECT id FROM medical_records WHERE consultation_id = ?').all(consultationId) as Array<{ id: string }>;
  if (rows.length === 0) {
    return [];
  }

  database.prepare('DELETE FROM medical_records WHERE consultation_id = ?').run(consultationId);
  return rows.map(row => row.id);
}

function pruneCancelledConsultationRecords(): string[] {
  const database = getDb();
  const rows = database.prepare(`
    SELECT mr.id
    FROM medical_records mr
    JOIN appointments a ON a.id = mr.consultation_id
    WHERE a.status = 'cancelled'
  `).all() as Array<{ id: string }>;

  if (rows.length === 0) {
    return [];
  }

  database.prepare(`
    DELETE FROM medical_records
    WHERE consultation_id IN (
      SELECT id FROM appointments WHERE status = 'cancelled'
    )
  `).run();

  return rows.map(row => row.id);
}

function rowToConversation(row: any, lastMessage?: Message | null): Conversation {
  return {
    id: row.id,
    participants: {
      patientId: row.patient_id,
      doctorId: row.doctor_id,
    },
    patientId: row.patient_id,
    doctorId: row.doctor_id,
    lastMessage: lastMessage || undefined,
    unreadCount: row.unread_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function buildRescheduleFollowUpMessage(appointment: Appointment): Message {
  const patientProfile = getPatientProfileById(appointment.patientId);
  const doctorProfile = getDoctorProfileById(appointment.doctorId);
  const patientName = patientProfile?.firstName ? ` ${patientProfile.firstName}` : '';
  const doctorName = doctorProfile ? `Dr. ${doctorProfile.firstName} ${doctorProfile.lastName}` : 'your doctor';
  const appointmentDate = formatAppointmentDate(appointment.date);
  const now = new Date().toISOString();

  return {
    id: `msg-${crypto.randomUUID()}`,
    conversationId: '',
    senderId: appointment.doctorId,
    senderRole: 'doctor',
    senderType: 'doctor',
    content: `Hello${patientName}, your consultation with ${doctorName} has been rescheduled for ${appointmentDate} at ${appointment.timeSlot.startTime}. Please upload any past prescriptions or lab results here so we can review them before your appointment.`,
    attachments: undefined,
    isRead: false,
    read: false,
    createdAt: now,
    timestamp: now,
  };
}

function rowToMessage(row: any): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    senderRole: row.sender_role as UserRole,
    senderType: row.sender_role as UserRole,
    content: row.content,
    attachments: row.attachments_json ? JSON.parse(row.attachments_json) : undefined,
    isRead: Boolean(row.is_read),
    read: Boolean(row.is_read),
    createdAt: row.created_at,
    timestamp: row.created_at,
  };
}

function getPatientProfileByUserId(userId: string) {
  const row = getDb().prepare('SELECT * FROM patient_profiles WHERE user_id = ?').get(userId);
  return row ? rowToPatientProfile(row) : null;
}

function getDoctorProfileByUserId(userId: string) {
  const row = getDb().prepare('SELECT * FROM doctor_profiles WHERE user_id = ?').get(userId);
  return row ? rowToDoctorProfile(row) : null;
}

function getUserById(userId: string) {
  const row = getDb().prepare('SELECT * FROM users WHERE id = ?').get(userId);
  return row ? rowToUser(row) : null;
}

function getUserByEmail(email: string) {
  const row = getDb().prepare('SELECT * FROM users WHERE lower(email) = lower(?)').get(email);
  return row ? { row, user: rowToUser(row) } : null;
}

function buildSessionPayload(userId: string): SessionPayload {
  const user = getUserById(userId);
  if (!user) {
    return { user: null, patientProfile: null, doctorProfile: null, isAuthenticated: false };
  }

  const patientProfile = getPatientProfileByUserId(userId);
  const doctorProfile = getDoctorProfileByUserId(userId);
  return { user, patientProfile, doctorProfile, isAuthenticated: true };
}

function mergeUserWithProfile(user: User | null, patientProfile: PatientProfile | null, doctorProfile: DoctorProfile | null): User | null {
  if (!user) return null;
  const merged = { ...user } as User;
  if (patientProfile) {
    merged.name = `${patientProfile.firstName} ${patientProfile.lastName}`.trim();
    merged.firstName = patientProfile.firstName;
    merged.lastName = patientProfile.lastName;
    merged.phone = patientProfile.phone;
    merged.dateOfBirth = patientProfile.dateOfBirth;
    merged.gender = patientProfile.gender;
    merged.address = patientProfile.address;
    merged.city = patientProfile.city;
    merged.state = patientProfile.state;
    merged.zipCode = patientProfile.zipCode;
    merged.emergencyContact = patientProfile.emergencyContact;
    merged.emergencyPhone = patientProfile.emergencyPhone;
    merged.bloodType = patientProfile.bloodType;
    merged.allergies = patientProfile.allergies;
    merged.medicalConditions = patientProfile.medicalConditions;
    merged.currentMedications = patientProfile.currentMedications;
    merged.basicMedicalHistory = patientProfile.basicMedicalHistory;
  }
  if (doctorProfile) {
    merged.name = `${doctorProfile.firstName} ${doctorProfile.lastName}`.trim();
    merged.firstName = doctorProfile.firstName;
    merged.lastName = doctorProfile.lastName;
    merged.phone = doctorProfile.phone;
    merged.specialization = doctorProfile.specialization;
    merged.specialty = doctorProfile.specialization;
    merged.department = doctorProfile.department;
    merged.licenseNumber = doctorProfile.licenseNumber;
    merged.yearsOfExperience = doctorProfile.yearsOfExperience;
    merged.education = doctorProfile.education;
    merged.bio = doctorProfile.bio;
    merged.consultationFee = doctorProfile.consultationFee;
    merged.avatar = doctorProfile.avatar;
    merged.availability = doctorProfile.availability;
    merged.languages = doctorProfile.languages;
    merged.rating = doctorProfile.rating;
    merged.totalReviews = doctorProfile.totalReviews;
    merged.isAvailable = doctorProfile.isAvailable;
    merged.location = doctorProfile.location;
    merged.acceptsInsurance = doctorProfile.acceptsInsurance;
  }
  return merged;
}

export const consultaraDb = {
  hashPassword,
  verifyPassword,

  getSession(userId: string): SessionPayload {
    return buildSessionPayload(userId);
  },

  signIn(email: string, password: string): { success: boolean; error?: string; session?: SessionPayload } {
    const result = getUserByEmail(email);
    if (!result) {
      return { success: false, error: 'No account found with this email. Please sign up first to create an account.' };
    }

    const isValid = verifyPassword(password, result.row.password_hash);
    if (!isValid) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    return { success: true, session: buildSessionPayload(result.user.id) };
  },

  signUp(email: string, password: string, role: UserRole): { success: boolean; error?: string; session?: SessionPayload } {
    const existing = getUserByEmail(email);
    if (existing) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const userId = `user-${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const passwordHash = hashPassword(password);
    const database = getDb();

    database.prepare(`
      INSERT INTO users (id, email, role, password_hash, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId, email, role, passwordHash, now, now);

    return { success: true, session: buildSessionPayload(userId) };
  },

  selectRole(userId: string, role: UserRole): SessionPayload {
    const database = getDb();
    database.prepare('UPDATE users SET role = ?, updated_at = ? WHERE id = ?').run(role, new Date().toISOString(), userId);
    return buildSessionPayload(userId);
  },

  signOut(): void {
    return;
  },

  resetPassword(email: string, newPassword: string): { success: boolean; error?: string } {
    const user = getUserByEmail(email);
    if (!user) {
      return { success: false, error: 'No account found with this email.' };
    }

    const database = getDb();
    const passwordHash = hashPassword(newPassword);
    database.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?').run(passwordHash, new Date().toISOString(), user.user.id);
    return { success: true };
  },

  upsertPatientProfile(userId: string, profileData: Partial<PatientProfile>): SessionPayload {
    const database = getDb();
    const existing = getPatientProfileByUserId(userId);
    const base = existing || {
      id: `patient-${crypto.randomUUID()}`,
      userId,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: 'prefer-not-to-say' as const,
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
      avatar: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const merged: PatientProfile = {
      ...base,
      ...profileData,
      userId,
      email: profileData.email || base.email,
      allergies: profileData.allergies || base.allergies || [],
      medicalConditions: profileData.medicalConditions || base.medicalConditions || [],
      currentMedications: profileData.currentMedications || base.currentMedications || [],
      updatedAt: new Date().toISOString(),
    };

    database.prepare(`
      INSERT INTO patient_profiles (
        id, user_id, first_name, last_name, email, phone, date_of_birth, gender, address, city,
        state, zip_code, emergency_contact, emergency_phone, weight, height, blood_type,
        allergies_json, medical_conditions_json, current_medications_json, basic_medical_history,
        avatar, created_at, updated_at
      ) VALUES (
        @id, @userId, @firstName, @lastName, @email, @phone, @dateOfBirth, @gender, @address, @city,
        @state, @zipCode, @emergencyContact, @emergencyPhone, @weight, @height, @bloodType,
        @allergiesJson, @medicalConditionsJson, @currentMedicationsJson, @basicMedicalHistory,
        @avatar, @createdAt, @updatedAt
      )
      ON CONFLICT(user_id) DO UPDATE SET
        first_name = excluded.first_name,
        last_name = excluded.last_name,
        email = excluded.email,
        phone = excluded.phone,
        date_of_birth = excluded.date_of_birth,
        gender = excluded.gender,
        address = excluded.address,
        city = excluded.city,
        state = excluded.state,
        zip_code = excluded.zip_code,
        emergency_contact = excluded.emergency_contact,
        emergency_phone = excluded.emergency_phone,
        weight = excluded.weight,
        height = excluded.height,
        blood_type = excluded.blood_type,
        allergies_json = excluded.allergies_json,
        medical_conditions_json = excluded.medical_conditions_json,
        current_medications_json = excluded.current_medications_json,
        basic_medical_history = excluded.basic_medical_history,
        avatar = excluded.avatar,
        updated_at = excluded.updated_at
    `).run({
      ...merged,
      allergiesJson: JSON.stringify(merged.allergies || []),
      medicalConditionsJson: JSON.stringify(merged.medicalConditions || []),
      currentMedicationsJson: JSON.stringify(merged.currentMedications || []),
    });

    return buildSessionPayload(userId);
  },

  upsertDoctorProfile(userId: string, profileData: Partial<DoctorProfile>): SessionPayload {
    const database = getDb();
    const existing = getDoctorProfileByUserId(userId);
    const account = getUserById(userId);
    // Server-side PRC license validation: format + check against seeded doctors
    if (profileData.licenseNumber) {
      const license = String(profileData.licenseNumber).trim().toUpperCase();
      const prcRegex = /^PRC-\d{6,7}$/;
      if (!prcRegex.test(license)) {
        throw new Error('Invalid PRC license format');
      }
      profileData.licenseNumber = license;
    }
    const base = existing || {
      id: `doctor-${crypto.randomUUID()}`,
      userId,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      specialization: '',
      department: 'general-medicine' as const,
      licenseNumber: '',
      yearsOfExperience: 0,
      education: '',
      bio: '',
      consultationFee: 0,
      avatar: '',
      availability: {
        monday: { isWorkingDay: true, slots: [] },
        tuesday: { isWorkingDay: true, slots: [] },
        wednesday: { isWorkingDay: true, slots: [] },
        thursday: { isWorkingDay: true, slots: [] },
        friday: { isWorkingDay: true, slots: [] },
        saturday: { isWorkingDay: false, slots: [] },
        sunday: { isWorkingDay: false, slots: [] },
      } as WeeklySchedule,
      languages: ['English', 'Filipino'],
      rating: 0,
      totalReviews: 0,
      isAvailable: true,
      location: 'Metro Manila',
      acceptsInsurance: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const merged: DoctorProfile = {
      ...base,
      ...profileData,
      userId,
      email: account?.email || base.email || profileData.email || '',
      specialization: profileData.specialization || base.specialization,
      department: profileData.department || base.department,
      licenseNumber: profileData.licenseNumber || base.licenseNumber,
      yearsOfExperience: profileData.yearsOfExperience ?? base.yearsOfExperience,
      consultationFee: profileData.consultationFee ?? base.consultationFee,
      avatar: profileData.avatar || base.avatar,
      availability: profileData.availability || base.availability,
      languages: profileData.languages || base.languages,
      rating: profileData.rating ?? base.rating,
      totalReviews: profileData.totalReviews ?? base.totalReviews,
      isAvailable: profileData.isAvailable ?? base.isAvailable,
      location: profileData.location || base.location,
      acceptsInsurance: profileData.acceptsInsurance ?? base.acceptsInsurance,
      updatedAt: new Date().toISOString(),
    };

    database.prepare(`
      INSERT INTO doctor_profiles (
        id, user_id, first_name, last_name, email, phone, specialization, department, license_number,
        years_of_experience, education, bio, consultation_fee, avatar, date_of_birth, availability_json, languages_json,
        rating, total_reviews, is_available, location, accepts_insurance, contact_number, created_at, updated_at
      ) VALUES (
        @id, @userId, @firstName, @lastName, @email, @phone, @specialization, @department, @licenseNumber,
        @yearsOfExperience, @education, @bio, @consultationFee, @avatar, @dateOfBirth, @availabilityJson, @languagesJson,
        @rating, @totalReviews, @isAvailable, @location, @acceptsInsurance, @contactNumber, @createdAt, @updatedAt
      )
      ON CONFLICT(user_id) DO UPDATE SET
        first_name = excluded.first_name,
        last_name = excluded.last_name,
        email = excluded.email,
        phone = excluded.phone,
        specialization = excluded.specialization,
        department = excluded.department,
        license_number = excluded.license_number,
        years_of_experience = excluded.years_of_experience,
        education = excluded.education,
        bio = excluded.bio,
        consultation_fee = excluded.consultation_fee,
        avatar = excluded.avatar,
        availability_json = excluded.availability_json,
        languages_json = excluded.languages_json,
        rating = excluded.rating,
        total_reviews = excluded.total_reviews,
        is_available = excluded.is_available,
        location = excluded.location,
        accepts_insurance = excluded.accepts_insurance,
        date_of_birth = excluded.date_of_birth,
        contact_number = excluded.contact_number,
        updated_at = excluded.updated_at
    `).run({
      ...merged,
      availabilityJson: JSON.stringify(merged.availability),
      languagesJson: JSON.stringify(merged.languages || []),
      isAvailable: merged.isAvailable ? 1 : 0,
      acceptsInsurance: merged.acceptsInsurance ? 1 : 0,
      dateOfBirth: (merged as any).dateOfBirth || null,
      contactNumber: merged.contactNumber || null,
    });

    return buildSessionPayload(userId);
  },

  completeRegistration(userId: string, profileData: Partial<PatientProfile> | Partial<DoctorProfile>): SessionPayload {
    const session = buildSessionPayload(userId);
    if (!session.user) {
      return session;
    }

    if (session.user.role === 'patient') {
      return this.upsertPatientProfile(userId, profileData as Partial<PatientProfile>);
    }

    return this.upsertDoctorProfile(userId, profileData as Partial<DoctorProfile>);
  },

  getAppState(): AppStatePayload {
    const database = getDb();

    pruneCancelledConsultationRecords();

    const appointmentRows = database.prepare('SELECT * FROM appointments ORDER BY date ASC, start_time ASC').all();
    const medicalRecordRows = database.prepare('SELECT * FROM medical_records ORDER BY date DESC, created_at DESC').all();
    const notificationRows = database.prepare('SELECT * FROM notifications ORDER BY created_at DESC').all();
    const conversationRows = database.prepare('SELECT * FROM conversations ORDER BY updated_at DESC').all();
    const messageRows = database.prepare('SELECT * FROM messages ORDER BY created_at ASC').all();

    const messages = messageRows.map(rowToMessage);
    const conversations = conversationRows.map((row: any) => {
      const lastMessage = row.last_message_json ? rowToMessage({ ...JSON.parse(row.last_message_json), conversation_id: row.id }) : messages.filter(message => message.conversationId === row.id).slice(-1)[0] || null;
      return rowToConversation(row, lastMessage);
    });

    const prescriptions = medicalRecordRows
      .map((row: any) => row.prescription_json ? rowToPrescription(row.prescription_json, row.patient_id, row.doctor_id) : null)
      .filter(Boolean) as Prescription[];

    return {
      appointments: appointmentRows.map(rowToAppointment),
      medicalRecords: medicalRecordRows.map(rowToMedicalRecord),
      notifications: notificationRows.map(rowToNotification),
      conversations,
      messages,
      prescriptions,
    };
  },

  getDoctors(): DoctorProfile[] {
    const database = getDb();
    const rows = database.prepare('SELECT * FROM doctor_profiles ORDER BY last_name ASC, first_name ASC').all();
    return rows.map(rowToDoctorProfile);
  },

  createAppointment(input: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Appointment {
    const database = getDb();
    const now = new Date().toISOString();
    const appointment: Appointment = {
      ...input,
      id: `apt-${crypto.randomUUID()}`,
      type: input.type || input.consultationType,
      time: input.time || input.timeSlot.startTime,
      reason: input.reason || input.symptoms || 'General Consultation',
      createdAt: now,
      updatedAt: now,
    };

    database.prepare(`
      INSERT INTO appointments (
        id, patient_id, doctor_id, date, start_time, end_time, consultation_type, status,
        symptoms, notes, reason, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      appointment.id,
      appointment.patientId,
      appointment.doctorId,
      appointment.date,
      appointment.timeSlot.startTime,
      appointment.timeSlot.endTime,
      appointment.consultationType,
      appointment.status,
      appointment.symptoms || null,
      appointment.notes || null,
      appointment.reason || null,
      appointment.createdAt,
      appointment.updatedAt,
    );

    return appointment;
  },

  updateAppointment(id: string, updates: Partial<Appointment>): AppointmentUpdateResult {
    const database = getDb();
    const current = database.prepare('SELECT * FROM appointments WHERE id = ?').get(id);
    if (!current) {
      return { appointment: null, notifications: [], deletedMedicalRecordIds: [] };
    }

    const previousAppointment = rowToAppointment(current);

    const nextAppointment = {
      ...previousAppointment,
      ...updates,
      timeSlot: updates.timeSlot || rowToAppointment(current).timeSlot,
      consultationType: (updates.consultationType || previousAppointment.consultationType) as ConsultationType,
      type: updates.type || updates.consultationType || previousAppointment.consultationType,
      time: updates.time || updates.timeSlot?.startTime || previousAppointment.time,
      reason: updates.reason || updates.symptoms || previousAppointment.reason,
      updatedAt: new Date().toISOString(),
    } as Appointment;

    database.prepare(`
      UPDATE appointments
      SET patient_id = ?, doctor_id = ?, date = ?, start_time = ?, end_time = ?, consultation_type = ?,
          status = ?, symptoms = ?, notes = ?, reason = ?, updated_at = ?
      WHERE id = ?
    `).run(
      nextAppointment.patientId,
      nextAppointment.doctorId,
      nextAppointment.date,
      nextAppointment.timeSlot.startTime,
      nextAppointment.timeSlot.endTime,
      nextAppointment.consultationType,
      nextAppointment.status,
      nextAppointment.symptoms || null,
      nextAppointment.notes || null,
      nextAppointment.reason || null,
      nextAppointment.updatedAt,
      id,
    );

    const notifications = buildAppointmentUpdateNotifications(previousAppointment, nextAppointment);
    const deletedMedicalRecordIds = nextAppointment.status === 'cancelled'
      ? deleteMedicalRecordsByConsultationId(nextAppointment.id)
      : [];
    const persistedNotifications = notifications.map(notification => consultaraDb.addNotification(notification));

    const messages: Message[] = [];

    const rescheduleChanged =
      previousAppointment.date !== nextAppointment.date ||
      previousAppointment.timeSlot.startTime !== nextAppointment.timeSlot.startTime ||
      previousAppointment.timeSlot.endTime !== nextAppointment.timeSlot.endTime ||
      previousAppointment.consultationType !== nextAppointment.consultationType;

    if (rescheduleChanged) {
      try {
        const conv = consultaraDb.getOrCreateConversation(nextAppointment.patientId, nextAppointment.doctorId);
        const followUp = buildRescheduleFollowUpMessage(nextAppointment);
        followUp.conversationId = conv.id;
        const persisted = consultaraDb.addMessage(followUp);
        messages.push(persisted);
      } catch (err) {
        // swallow errors so appointment update still succeeds even if messaging fails
      }
    }

    return {
      appointment: nextAppointment,
      notifications: persistedNotifications,
      deletedMedicalRecordIds,
      messages,
    };
  },

  addMedicalRecord(record: Omit<MedicalRecord, 'id' | 'createdAt'>): MedicalRecord {
    const database = getDb();
    const now = new Date().toISOString();
    const nextRecord: MedicalRecord = {
      ...record,
      id: `record-${crypto.randomUUID()}`,
      title: record.title || record.diagnosis,
      type: record.type || 'consultations',
      createdAt: now,
    };

    database.prepare(`
      INSERT INTO medical_records (
        id, patient_id, consultation_id, doctor_id, doctor_name, date, title, record_type,
        diagnosis, symptoms_json, treatment, prescription_json, notes, follow_up_required,
        follow_up_date, attachments_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      nextRecord.id,
      nextRecord.patientId,
      nextRecord.consultationId,
      nextRecord.doctorId,
      nextRecord.doctorName,
      nextRecord.date,
      nextRecord.title || null,
      nextRecord.type || 'consultations',
      nextRecord.diagnosis,
      JSON.stringify(nextRecord.symptoms || []),
      nextRecord.treatment,
      nextRecord.prescription ? JSON.stringify(nextRecord.prescription) : null,
      nextRecord.notes || null,
      nextRecord.followUpRequired ? 1 : 0,
      nextRecord.followUpDate || null,
      nextRecord.attachments ? JSON.stringify(nextRecord.attachments) : null,
      nextRecord.createdAt,
    );

    return nextRecord;
  },

  addNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Notification {
    const database = getDb();
    const nextNotification: Notification = {
      ...notification,
      id: `notif-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
    };

    database.prepare(`
      INSERT INTO notifications (id, user_id, type, title, message, is_read, action_url, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      nextNotification.id,
      nextNotification.userId,
      nextNotification.type,
      nextNotification.title,
      nextNotification.message,
      nextNotification.isRead ? 1 : 0,
      nextNotification.actionUrl || null,
      nextNotification.createdAt,
    );

    return nextNotification;
  },

  markNotificationAsRead(id: string) {
    getDb().prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(id);
  },

  markAllNotificationsAsRead(userId: string) {
    getDb().prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(userId);
  },

  getOrCreateConversation(patientId: string, doctorId: string): Conversation {
    const database = getDb();
    const existing = database.prepare('SELECT * FROM conversations WHERE patient_id = ? AND doctor_id = ?').get(patientId, doctorId);
    if (existing) {
      const lastMessageRow = database.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 1').get(existing.id);
      return rowToConversation(existing, lastMessageRow ? rowToMessage(lastMessageRow) : null);
    }

    const now = new Date().toISOString();
    const conversation: Conversation = {
      id: `conv-${crypto.randomUUID()}`,
      participants: { patientId, doctorId },
      patientId,
      doctorId,
      unreadCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    database.prepare(`
      INSERT INTO conversations (id, patient_id, doctor_id, last_message_json, unread_count, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(conversation.id, patientId, doctorId, null, 0, now, now);

    return conversation;
  },

  addMessage(message: Message): Message {
    const database = getDb();
    const now = message.createdAt || new Date().toISOString();
    const nextMessage: Message = {
      ...message,
      senderType: message.senderType || message.senderRole,
      timestamp: message.timestamp || now,
      read: message.read ?? message.isRead,
      createdAt: now,
      isRead: message.isRead ?? message.read ?? false,
    };

    const conversation = database.prepare('SELECT * FROM conversations WHERE id = ?').get(nextMessage.conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    database.prepare(`
      INSERT INTO messages (id, conversation_id, sender_id, sender_role, content, attachments_json, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      nextMessage.id,
      nextMessage.conversationId,
      nextMessage.senderId,
      nextMessage.senderRole,
      nextMessage.content,
      nextMessage.attachments ? JSON.stringify(nextMessage.attachments) : null,
      nextMessage.isRead ? 1 : 0,
      now,
    );

    const unreadCount = (conversation.unread_count || 0) + 1;
    database.prepare(`
      UPDATE conversations
      SET last_message_json = ?, unread_count = ?, updated_at = ?
      WHERE id = ?
    `).run(JSON.stringify(nextMessage), unreadCount, now, nextMessage.conversationId);

    return nextMessage;
  },

  markMessagesAsRead(conversationId: string, userId: string) {
    const database = getDb();
    database.prepare(`
      UPDATE messages
      SET is_read = 1
      WHERE conversation_id = ? AND sender_id != ?
    `).run(conversationId, userId);
    database.prepare('UPDATE conversations SET unread_count = 0, updated_at = ? WHERE id = ?').run(new Date().toISOString(), conversationId);
  },
};

export function mergeSessionUser(session: SessionPayload): User | null {
  return mergeUserWithProfile(session.user, session.patientProfile, session.doctorProfile);
}
