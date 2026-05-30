import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getPgPool } from './pg-client';
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

const seedAvatarMap = new Map(doctors.map((d, i) => [d.id, getDoctorPortrait(i)]));

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

async function ensureSchema() {
  const pool = getPgPool();
  const sql = fs.readFileSync(path.join(__dirname, 'schema-postgres.sql'), 'utf8');
  await pool.query(sql);
}

async function seedDatabaseIfEmpty() {
  const pool = getPgPool();
  const res = await pool.query('SELECT COUNT(*)::int AS count FROM users');
  const count = res.rows?.[0]?.count ?? 0;
  if (count > 0) return;

  const now = new Date().toISOString();
  const pw = hashPassword('Consultara123!');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // patient
    await client.query(
      `INSERT INTO users (id, email, role, password_hash, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6)`,
      [samplePatient.userId, samplePatient.email, 'patient', pw, samplePatient.createdAt, samplePatient.updatedAt]
    );

    await client.query(
      `INSERT INTO patient_profiles (id, user_id, first_name, last_name, email, created_at, updated_at, allergies_json, medical_conditions_json, current_medications_json)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [samplePatient.id, samplePatient.userId, samplePatient.firstName, samplePatient.lastName, samplePatient.email, samplePatient.createdAt, samplePatient.updatedAt, JSON.stringify(samplePatient.allergies ?? []), JSON.stringify(samplePatient.medicalConditions ?? []), JSON.stringify(samplePatient.currentMedications ?? [])]
    );

    for (const doc of doctors) {
      await client.query(
        `INSERT INTO users (id, email, role, password_hash, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6)`,
        [doc.userId, doc.email, 'doctor', pw, doc.createdAt, doc.updatedAt]
      );

      await client.query(
        `INSERT INTO doctor_profiles (id, user_id, first_name, last_name, email, specialization, department, license_number, years_of_experience, consultation_fee, avatar, availability_json, languages_json, rating, total_reviews, is_available, location, accepts_insurance, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)`,
        [doc.id, doc.userId, doc.firstName, doc.lastName, doc.email, doc.specialization, doc.department, doc.licenseNumber || '', doc.yearsOfExperience || 0, doc.consultationFee || 0, seedAvatarMap.get(doc.id) || doc.avatar || getDoctorPortraitForKey(doc.id), JSON.stringify(doc.availability || {}), JSON.stringify(doc.languages || []), doc.rating || 0, doc.totalReviews || 0, doc.isAvailable ? true : false, doc.location || null, doc.acceptsInsurance ? true : false, doc.createdAt, doc.updatedAt]
      );
    }

    // appointments, medical records, notifications, conversations, messages
    for (const ap of sampleAppointments) {
      await client.query(
        `INSERT INTO appointments (id, patient_id, doctor_id, date, start_time, end_time, consultation_type, status, symptoms, reason, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [ap.id, ap.patientId, ap.doctorId, ap.date, ap.timeSlot.startTime, ap.timeSlot.endTime, ap.consultationType, ap.status, ap.symptoms || null, ap.reason || null, ap.createdAt, ap.updatedAt]
      );
    }

    for (const mr of sampleMedicalRecords) {
      await client.query(
        `INSERT INTO medical_records (id, patient_id, consultation_id, doctor_id, doctor_name, date, title, record_type, diagnosis, symptoms_json, treatment, prescription_json, notes, follow_up_required, attachments_json, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
        [mr.id, mr.patientId, mr.consultationId, mr.doctorId, mr.doctorName, mr.date, mr.title || mr.diagnosis, mr.type || 'consultation', mr.diagnosis, JSON.stringify(mr.symptoms || []), mr.treatment || '', mr.prescription ? JSON.stringify(mr.prescription) : null, mr.notes || null, mr.followUpRequired ? true : false, mr.attachments ? JSON.stringify(mr.attachments) : null, mr.createdAt]
      );
    }

    for (const n of sampleNotifications) {
      await client.query(
        `INSERT INTO notifications (id, user_id, type, title, message, is_read, action_url, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [n.id, n.userId, n.type, n.title, n.message, n.isRead ? true : false, n.actionUrl || null, n.createdAt]
      );
    }

    for (const conv of sampleConversations) {
      await client.query(
        `INSERT INTO conversations (id, patient_id, doctor_id, last_message_json, unread_count, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [conv.id, conv.participants.patientId, conv.participants.doctorId, conv.lastMessage ? JSON.stringify(conv.lastMessage) : null, conv.unreadCount || 0, conv.createdAt, conv.updatedAt]
      );
    }

    for (const msg of sampleMessages) {
      await client.query(
        `INSERT INTO messages (id, conversation_id, sender_id, sender_role, content, attachments_json, is_read, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [msg.id, msg.conversationId, msg.senderId, msg.senderRole, msg.content, msg.attachments ? JSON.stringify(msg.attachments) : null, msg.isRead ? true : false, msg.createdAt]
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

function rowToUser(row: any): User {
  if (!row) return null as any;
  return { id: row.id, email: row.email, role: row.role, createdAt: row.created_at } as User;
}

function rowToPatientProfile(row: any): PatientProfile {
  if (!row) return null as any;
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
    allergies: row.allergies_json || [],
    medicalConditions: row.medical_conditions_json || [],
    currentMedications: row.current_medications_json || [],
    basicMedicalHistory: row.basic_medical_history || undefined,
    avatar: row.avatar || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as PatientProfile;
}

function rowToDoctorProfile(row: any): DoctorProfile {
  if (!row) return null as any;
  const availability = row.availability_json || undefined;
  const languages = row.languages_json || [];
  const avatar = seedAvatarMap.get(row.id) || row.avatar || getDoctorPortraitForKey(row.id);
  return {
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
    availability: availability || undefined,
    languages,
    rating: row.rating,
    totalReviews: row.total_reviews,
    isAvailable: Boolean(row.is_available),
    location: row.location || '',
    acceptsInsurance: Boolean(row.accepts_insurance),
    contactNumber: row.contact_number || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as DoctorProfile;
}

async function getUserById(userId: string) {
  const pool = getPgPool();
  const res = await pool.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [userId]);
  return res.rows[0] ? rowToUser(res.rows[0]) : null;
}

async function getUserByEmail(email: string) {
  const pool = getPgPool();
  const res = await pool.query('SELECT * FROM users WHERE lower(email) = lower($1) LIMIT 1', [email]);
  return res.rows[0] ? { row: res.rows[0], user: rowToUser(res.rows[0]) } : null;
}

async function getPatientProfileByUserId(userId: string) {
  const pool = getPgPool();
  const res = await pool.query('SELECT * FROM patient_profiles WHERE user_id = $1 LIMIT 1', [userId]);
  return res.rows[0] ? rowToPatientProfile(res.rows[0]) : null;
}

async function getDoctorProfileByUserId(userId: string) {
  const pool = getPgPool();
  const res = await pool.query('SELECT * FROM doctor_profiles WHERE user_id = $1 LIMIT 1', [userId]);
  return res.rows[0] ? rowToDoctorProfile(res.rows[0]) : null;
}

export const consultaraDb = {
  hashPassword,
  verifyPassword,

  async getSession(userId: string) {
    const user = await getUserById(userId);
    if (!user) return { user: null, patientProfile: null, doctorProfile: null, isAuthenticated: false };
    const patientProfile = await getPatientProfileByUserId(userId);
    const doctorProfile = await getDoctorProfileByUserId(userId);
    return { user, patientProfile, doctorProfile, isAuthenticated: true };
  },

  async signIn(email: string, password: string) {
    const found = await getUserByEmail(email);
    if (!found) return { success: false, error: 'No account found with this email. Please sign up first to create an account.' };
    const isValid = verifyPassword(password, found.row.password_hash);
    if (!isValid) return { success: false, error: 'Incorrect password. Please try again.' };
    return { success: true, session: await this.getSession(found.user.id) };
  },

  async signUp(email: string, password: string, role: UserRole) {
    const existing = await getUserByEmail(email);
    if (existing) return { success: false, error: 'An account with this email already exists.' };
    const id = `user-${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const passwordHash = hashPassword(password);
    const pool = getPgPool();
    await pool.query('INSERT INTO users (id,email,role,password_hash,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6)', [id, email, role, passwordHash, now, now]);
    return { success: true, session: await this.getSession(id) };
  },

  async selectRole(userId: string, role: UserRole) {
    const pool = getPgPool();
    await pool.query('UPDATE users SET role = $1, updated_at = $2 WHERE id = $3', [role, new Date().toISOString(), userId]);
    return this.getSession(userId);
  },

  async signOut() {
    return;
  },

  async resetPassword(email: string, newPassword: string) {
    const user = await getUserByEmail(email);
    if (!user) return { success: false, error: 'No account found with this email.' };
    const hashed = hashPassword(newPassword);
    const pool = getPgPool();
    await pool.query('UPDATE users SET password_hash = $1, updated_at = $2 WHERE id = $3', [hashed, new Date().toISOString(), user.user.id]);
    return { success: true };
  },

  async upsertPatientProfile(userId: string, profileData: Partial<PatientProfile>) {
    const pool = getPgPool();
    const existing = await getPatientProfileByUserId(userId);
    const id = existing?.id || `patient-${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const allergies = JSON.stringify(profileData.allergies || existing?.allergies || []);
    const medicalConditions = JSON.stringify(profileData.medicalConditions || existing?.medicalConditions || []);
    const currentMeds = JSON.stringify(profileData.currentMedications || existing?.currentMedications || []);

    await pool.query(
      `INSERT INTO patient_profiles (id,user_id,first_name,last_name,email,phone,date_of_birth,gender,address,city,state,zip_code,emergency_contact,emergency_phone,weight,height,blood_type,allergies_json,medical_conditions_json,current_medications_json,basic_medical_history,avatar,created_at,updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)
       ON CONFLICT (user_id) DO UPDATE SET first_name=EXCLUDED.first_name,last_name=EXCLUDED.last_name,email=EXCLUDED.email,phone=EXCLUDED.phone,date_of_birth=EXCLUDED.date_of_birth,gender=EXCLUDED.gender,address=EXCLUDED.address,city=EXCLUDED.city,state=EXCLUDED.state,zip_code=EXCLUDED.zip_code,emergency_contact=EXCLUDED.emergency_contact,emergency_phone=EXCLUDED.emergency_phone,weight=EXCLUDED.weight,height=EXCLUDED.height,blood_type=EXCLUDED.blood_type,allergies_json=EXCLUDED.allergies_json,medical_conditions_json=EXCLUDED.medical_conditions_json,current_medications_json=EXCLUDED.current_medications_json,basic_medical_history=EXCLUDED.basic_medical_history,avatar=EXCLUDED.avatar,updated_at=EXCLUDED.updated_at`,
      [id, userId, profileData.firstName || existing?.firstName || '', profileData.lastName || existing?.lastName || '', profileData.email || existing?.email || '', profileData.phone || existing?.phone || null, profileData.dateOfBirth || existing?.dateOfBirth || null, profileData.gender || existing?.gender || null, profileData.address || existing?.address || null, profileData.city || existing?.city || null, profileData.state || existing?.state || null, profileData.zipCode || existing?.zipCode || null, profileData.emergencyContact || existing?.emergencyContact || null, profileData.emergencyPhone || existing?.emergencyPhone || null, profileData.weight || existing?.weight || null, profileData.height || existing?.height || null, profileData.bloodType || existing?.bloodType || null, allergies, medicalConditions, currentMeds, profileData.basicMedicalHistory || existing?.basicMedicalHistory || null, profileData.avatar || existing?.avatar || null, existing?.createdAt || now, now]
    );

    return this.getSession(userId);
  },

  async upsertDoctorProfile(userId: string, profileData: Partial<DoctorProfile>) {
    const pool = getPgPool();
    const existing = await getDoctorProfileByUserId(userId);
    const account = await getUserById(userId);
    if (profileData.licenseNumber) {
      const license = String(profileData.licenseNumber).trim().toUpperCase();
      const prcRegex = /^PRC-\d{6,7}$/;
      if (!prcRegex.test(license)) {
        // warn and normalize
        // eslint-disable-next-line no-console
        console.warn(`Non-standard license format for user ${userId}: ${license}`);
        profileData.licenseNumber = license;
      } else {
        profileData.licenseNumber = license;
      }
    }

    const id = existing?.id || `doctor-${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const availability = JSON.stringify(profileData.availability || existing?.availability || {});
    const languages = JSON.stringify(profileData.languages || existing?.languages || []);

    await pool.query(
      `INSERT INTO doctor_profiles (id,user_id,first_name,last_name,email,phone,specialization,department,license_number,years_of_experience,education,bio,consultation_fee,avatar,date_of_birth,availability_json,languages_json,rating,total_reviews,is_available,location,accepts_insurance,contact_number,created_at,updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)
       ON CONFLICT (user_id) DO UPDATE SET first_name=EXCLUDED.first_name,last_name=EXCLUDED.last_name,email=EXCLUDED.email,phone=EXCLUDED.phone,specialization=EXCLUDED.specialization,department=EXCLUDED.department,license_number=EXCLUDED.license_number,years_of_experience=EXCLUDED.years_of_experience,education=EXCLUDED.education,bio=EXCLUDED.bio,consultation_fee=EXCLUDED.consultation_fee,avatar=EXCLUDED.avatar,availability_json=EXCLUDED.availability_json,languages_json=EXCLUDED.languages_json,rating=EXCLUDED.rating,total_reviews=EXCLUDED.total_reviews,is_available=EXCLUDED.is_available,location=EXCLUDED.location,accepts_insurance=EXCLUDED.accepts_insurance,contact_number=EXCLUDED.contact_number,date_of_birth=EXCLUDED.date_of_birth,updated_at=EXCLUDED.updated_at`,
      [id, userId, profileData.firstName || existing?.firstName || '', profileData.lastName || existing?.lastName || '', profileData.email || account?.email || existing?.email || '', profileData.phone || existing?.phone || null, profileData.specialization || existing?.specialization || '', profileData.department || existing?.department || 'general-medicine', profileData.licenseNumber || existing?.licenseNumber || '', profileData.yearsOfExperience ?? existing?.yearsOfExperience ?? 0, profileData.education || existing?.education || null, profileData.bio || existing?.bio || null, profileData.consultationFee ?? existing?.consultationFee ?? 0, profileData.avatar || existing?.avatar || null, (profileData as any).dateOfBirth || existing?.dateOfBirth || null, availability, languages, profileData.rating ?? existing?.rating ?? 0, profileData.totalReviews ?? existing?.totalReviews ?? 0, profileData.isAvailable ?? existing?.isAvailable ?? true, profileData.location || existing?.location || null, profileData.acceptsInsurance ?? existing?.acceptsInsurance ?? true, profileData.contactNumber || existing?.contactNumber || null, existing?.createdAt || now, now]
    );

    return this.getSession(userId);
  },

  async completeRegistration(userId: string, profileData: Partial<PatientProfile> | Partial<DoctorProfile>) {
    const sess = await this.getSession(userId);
    if (!sess.user) return sess;
    if (sess.user.role === 'patient') {
      return this.upsertPatientProfile(userId, profileData as Partial<PatientProfile>);
    }
    return this.upsertDoctorProfile(userId, profileData as Partial<DoctorProfile>);
  },

  async getAppState() {
    const pool = getPgPool();
    await pool.query('SELECT 1');
    await seedDatabaseIfEmpty();

    const appointmentRes = await pool.query('SELECT * FROM appointments ORDER BY date ASC, start_time ASC');
    const medicalRes = await pool.query('SELECT * FROM medical_records ORDER BY date DESC, created_at DESC');
    const notifRes = await pool.query('SELECT * FROM notifications ORDER BY created_at DESC');
    const convRes = await pool.query('SELECT * FROM conversations ORDER BY updated_at DESC');
    const msgRes = await pool.query('SELECT * FROM messages ORDER BY created_at ASC');

    const messages = msgRes.rows.map((r: any) => ({
      id: r.id,
      conversationId: r.conversation_id,
      senderId: r.sender_id,
      senderRole: r.sender_role,
      senderType: r.sender_role,
      content: r.content,
      attachments: r.attachments_json || undefined,
      isRead: Boolean(r.is_read),
      read: Boolean(r.is_read),
      createdAt: r.created_at,
      timestamp: r.created_at,
    } as Message));

    const conversations = convRes.rows.map((r: any) => {
      const lastMsg = r.last_message_json ? JSON.parse(r.last_message_json) : null;
      return {
        id: r.id,
        participants: { patientId: r.patient_id, doctorId: r.doctor_id },
        patientId: r.patient_id,
        doctorId: r.doctor_id,
        lastMessage: lastMsg ? ({ ...lastMsg, conversationId: r.id } as Message) : messages.filter(m => m.conversationId === r.id).slice(-1)[0] || undefined,
        unreadCount: r.unread_count,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      } as Conversation;
    });

    const prescriptions = medicalRes.rows.map((r: any) => r.prescription_json ? ({ ...JSON.parse(r.prescription_json), patientId: r.patient_id, doctorId: r.doctor_id } as Prescription) : null).filter(Boolean) as Prescription[];

    return {
      appointments: appointmentRes.rows.map((r: any) => ({ id: r.id, patientId: r.patient_id, doctorId: r.doctor_id, date: r.date, timeSlot: { startTime: r.start_time, endTime: r.end_time, isAvailable: true }, consultationType: r.consultation_type, type: r.consultation_type as ConsultationType, time: r.start_time, reason: r.reason || undefined, status: r.status as AppointmentStatus, symptoms: r.symptoms || undefined, notes: r.notes || undefined, createdAt: r.created_at, updatedAt: r.updated_at } as Appointment)),
      medicalRecords: medicalRes.rows.map((r: any) => ({ id: r.id, patientId: r.patient_id, consultationId: r.consultation_id, doctorId: r.doctor_id, doctorName: r.doctor_name, date: r.date, title: r.title, type: r.record_type, diagnosis: r.diagnosis, symptoms: r.symptoms_json || [], treatment: r.treatment, prescription: r.prescription_json ? JSON.parse(r.prescription_json) : undefined, notes: r.notes, followUpRequired: Boolean(r.follow_up_required), followUpDate: r.follow_up_date, attachments: r.attachments_json || undefined, createdAt: r.created_at } as MedicalRecord)),
      notifications: notifRes.rows.map((r: any) => ({ id: r.id, userId: r.user_id, type: r.type, title: r.title, message: r.message, isRead: Boolean(r.is_read), actionUrl: r.action_url || undefined, createdAt: r.created_at } as Notification)),
      conversations,
      messages,
      prescriptions,
    };
  },

  async getDoctors() {
    const pool = getPgPool();
    await seedDatabaseIfEmpty();
    const res = await pool.query('SELECT * FROM doctor_profiles ORDER BY last_name ASC, first_name ASC');
    return res.rows.map(rowToDoctorProfile);
  },

  async createAppointment(input: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) {
    const pool = getPgPool();
    const now = new Date().toISOString();
    const appointment: Appointment = { ...input, id: `apt-${crypto.randomUUID()}`, type: input.type || input.consultationType, time: input.time || input.timeSlot.startTime, reason: input.reason || input.symptoms || 'General Consultation', createdAt: now, updatedAt: now };
    await pool.query(`INSERT INTO appointments (id, patient_id, doctor_id, date, start_time, end_time, consultation_type, status, symptoms, notes, reason, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`, [appointment.id, appointment.patientId, appointment.doctorId, appointment.date, appointment.timeSlot.startTime, appointment.timeSlot.endTime, appointment.consultationType, appointment.status, appointment.symptoms || null, appointment.notes || null, appointment.reason || null, appointment.createdAt, appointment.updatedAt]);

    const patientProfile = await (async () => {
      const pool2 = getPgPool();
      const r = await pool2.query('SELECT * FROM patient_profiles WHERE id = $1 LIMIT 1', [appointment.patientId]);
      return r.rows[0] ? rowToPatientProfile(r.rows[0]) : null;
    })();
    const doctorProfile = await (async () => {
      const pool2 = getPgPool();
      const r = await pool2.query('SELECT * FROM doctor_profiles WHERE id = $1 LIMIT 1', [appointment.doctorId]);
      return r.rows[0] ? rowToDoctorProfile(r.rows[0]) : null;
    })();

    const patientUserId = patientProfile?.userId || appointment.patientId;
    const doctorUserId = doctorProfile?.userId || appointment.doctorId;
    const doctorName = doctorProfile ? `Dr. ${doctorProfile.firstName} ${doctorProfile.lastName}` : 'your doctor';
    const patientName = patientProfile ? `${patientProfile.firstName} ${patientProfile.lastName}` : 'the patient';
    const appointmentDate = new Date(`${appointment.date}T00:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const appointmentTime = appointment.timeSlot.startTime;

    const bookingNotifications: Omit<Notification, 'id' | 'createdAt'>[] = [
      { userId: patientUserId, type: 'appointment-created', title: 'Appointment Booked', message: `Your consultation with ${doctorName} is booked for ${appointmentDate} at ${appointmentTime}.`, isRead: false, actionUrl: '/patient/calendar' },
      { userId: doctorUserId, type: 'appointment-created', title: 'New Appointment', message: `You have a new consultation with ${patientName} scheduled for ${appointmentDate} at ${appointmentTime}.`, isRead: false, actionUrl: '/doctor/calendar' },
    ];

    const persistedNotifications = [] as Notification[];
    for (const n of bookingNotifications) {
      persistedNotifications.push(await this.addNotification(n));
    }

    const messages: Message[] = [];
    try {
      const conv = await this.getOrCreateConversation(appointment.patientId, appointment.doctorId);
      const nowTs = new Date().toISOString();
      const doctorGreeting: Message = { id: `msg-${crypto.randomUUID()}`, conversationId: conv.id, senderId: appointment.doctorId, senderRole: 'doctor', senderType: 'doctor', content: `Hello ${patientProfile?.firstName || ''}, thank you for booking a consultation with ${doctorName} on ${appointmentDate} at ${appointmentTime}. Please upload any relevant documents or let me know your main concerns so I can prepare before the appointment.`, attachments: undefined, isRead: false, read: false, createdAt: nowTs, timestamp: nowTs };
      const persistedMsg = await this.addMessage(doctorGreeting);
      messages.push(persistedMsg);
    } catch (err) {
      // ignore
    }

    return { appointment, notifications: persistedNotifications, messages };
  },

  async updateAppointment(id: string, updates: Partial<Appointment>) {
    const pool = getPgPool();
    const cur = await pool.query('SELECT * FROM appointments WHERE id = $1 LIMIT 1', [id]);
    if (!cur.rows[0]) return { appointment: null, notifications: [], deletedMedicalRecordIds: [] } as any;
    const prev = cur.rows[0];
    const previousAppointment: Appointment = { id: prev.id, patientId: prev.patient_id, doctorId: prev.doctor_id, date: prev.date, timeSlot: { startTime: prev.start_time, endTime: prev.end_time, isAvailable: true }, consultationType: prev.consultation_type, type: prev.consultation_type as ConsultationType, time: prev.start_time, reason: prev.reason || prev.symptoms || undefined, status: prev.status as AppointmentStatus, symptoms: prev.symptoms || undefined, notes: prev.notes || undefined, createdAt: prev.created_at, updatedAt: prev.updated_at };

    const nextAppointment: Appointment = { ...previousAppointment, ...updates, timeSlot: updates.timeSlot || previousAppointment.timeSlot, consultationType: updates.consultationType || previousAppointment.consultationType, type: updates.type || updates.consultationType || previousAppointment.consultationType, time: updates.time || updates.timeSlot?.startTime || previousAppointment.time, reason: updates.reason || updates.symptoms || previousAppointment.reason, updatedAt: new Date().toISOString() } as Appointment;

    await pool.query('UPDATE appointments SET patient_id=$1, doctor_id=$2, date=$3, start_time=$4, end_time=$5, consultation_type=$6, status=$7, symptoms=$8, notes=$9, reason=$10, updated_at=$11 WHERE id=$12', [nextAppointment.patientId, nextAppointment.doctorId, nextAppointment.date, nextAppointment.timeSlot.startTime, nextAppointment.timeSlot.endTime, nextAppointment.consultationType, nextAppointment.status, nextAppointment.symptoms || null, nextAppointment.notes || null, nextAppointment.reason || null, nextAppointment.updatedAt, id]);

    // notifications and messages
    const notifications = [] as Omit<Notification, 'id' | 'createdAt'>[];
    // simple: if status cancelled, delete related medical records
    const deletedMedicalRecordIds: string[] = [];
    if (nextAppointment.status === 'cancelled') {
      const mr = await pool.query('SELECT id FROM medical_records WHERE consultation_id = $1', [nextAppointment.id]);
      for (const r of mr.rows) deletedMedicalRecordIds.push(r.id);
      if (deletedMedicalRecordIds.length) await pool.query('DELETE FROM medical_records WHERE consultation_id = $1', [nextAppointment.id]);
    }

    const persistedNotifications = [] as Notification[];
    for (const n of notifications) persistedNotifications.push(await this.addNotification(n));

    const messages: Message[] = [];
    const rescheduleChanged = previousAppointment.date !== nextAppointment.date || previousAppointment.timeSlot.startTime !== nextAppointment.timeSlot.startTime || previousAppointment.timeSlot.endTime !== nextAppointment.timeSlot.endTime || previousAppointment.consultationType !== nextAppointment.consultationType;
    if (rescheduleChanged) {
      try {
        const conv = await this.getOrCreateConversation(nextAppointment.patientId, nextAppointment.doctorId);
        const followUp = { ...({} as Message) };
        // build simple follow-up
        followUp.id = `msg-${crypto.randomUUID()}`;
        followUp.conversationId = conv.id;
        followUp.senderId = nextAppointment.doctorId;
        followUp.senderRole = 'doctor';
        followUp.senderType = 'doctor';
        followUp.content = `Your appointment has been rescheduled for ${nextAppointment.date} at ${nextAppointment.timeSlot.startTime}`;
        followUp.createdAt = new Date().toISOString();
        const persisted = await this.addMessage(followUp as Message);
        messages.push(persisted);
      } catch (err) {}
    }

    return { appointment: nextAppointment, notifications: persistedNotifications, deletedMedicalRecordIds, messages };
  },

  async addMedicalRecord(record: Omit<MedicalRecord, 'id' | 'createdAt'>) {
    const pool = getPgPool();
    const now = new Date().toISOString();
    const id = `record-${crypto.randomUUID()}`;
    await pool.query(`INSERT INTO medical_records (id,patient_id,consultation_id,doctor_id,doctor_name,date,title,record_type,diagnosis,symptoms_json,treatment,prescription_json,notes,follow_up_required,follow_up_date,attachments_json,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`, [id, record.patientId, record.consultationId, record.doctorId, record.doctorName, record.date, record.title || record.diagnosis, record.type || 'consultations', record.diagnosis, JSON.stringify(record.symptoms || []), record.treatment || '', record.prescription ? JSON.stringify(record.prescription) : null, record.notes || null, record.followUpRequired ? true : false, record.followUpDate || null, record.attachments ? JSON.stringify(record.attachments) : null, now]);
    return { ...record, id, createdAt: now } as MedicalRecord;
  },

  async addNotification(notification: Omit<Notification, 'id' | 'createdAt'>) {
    const pool = getPgPool();
    const id = `notif-${crypto.randomUUID()}`;
    const createdAt = new Date().toISOString();
    await pool.query('INSERT INTO notifications (id,user_id,type,title,message,is_read,action_url,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', [id, notification.userId, notification.type, notification.title, notification.message, notification.isRead ? true : false, notification.actionUrl || null, createdAt]);
    return { ...notification, id, createdAt } as Notification;
  },

  async markNotificationAsRead(id: string) {
    const pool = getPgPool();
    await pool.query('UPDATE notifications SET is_read = true WHERE id = $1', [id]);
  },

  async markAllNotificationsAsRead(userId: string) {
    const pool = getPgPool();
    await pool.query('UPDATE notifications SET is_read = true WHERE user_id = $1', [userId]);
  },

  async getOrCreateConversation(patientId: string, doctorId: string) {
    const pool = getPgPool();
    const existing = await pool.query('SELECT * FROM conversations WHERE patient_id = $1 AND doctor_id = $2 LIMIT 1', [patientId, doctorId]);
    if (existing.rows[0]) {
      const row = existing.rows[0];
      const lastMessage = row.last_message_json ? JSON.parse(row.last_message_json) : null;
      return { id: row.id, participants: { patientId: row.patient_id, doctorId: row.doctor_id }, patientId: row.patient_id, doctorId: row.doctor_id, lastMessage: lastMessage || undefined, unreadCount: row.unread_count, createdAt: row.created_at, updatedAt: row.updated_at } as Conversation;
    }
    const id = `conv-${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    await pool.query('INSERT INTO conversations (id,patient_id,doctor_id,last_message_json,unread_count,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7)', [id, patientId, doctorId, null, 0, now, now]);
    return { id, participants: { patientId, doctorId }, patientId, doctorId, unreadCount: 0, createdAt: now, updatedAt: now } as Conversation;
  },

  async addMessage(message: Message) {
    const pool = getPgPool();
    const now = message.createdAt || new Date().toISOString();
    const id = message.id || `msg-${crypto.randomUUID()}`;
    const conv = await pool.query('SELECT * FROM conversations WHERE id = $1 LIMIT 1', [message.conversationId]);
    if (!conv.rows[0]) throw new Error('Conversation not found');
    await pool.query('INSERT INTO messages (id,conversation_id,sender_id,sender_role,content,attachments_json,is_read,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', [id, message.conversationId, message.senderId, message.senderRole, message.content, message.attachments ? JSON.stringify(message.attachments) : null, message.isRead ? true : false, now]);
    const unreadCount = (conv.rows[0].unread_count || 0) + 1;
    await pool.query('UPDATE conversations SET last_message_json = $1, unread_count = $2, updated_at = $3 WHERE id = $4', [JSON.stringify({ ...message, id, createdAt: now }), unreadCount, now, message.conversationId]);
    return { ...message, id, createdAt: now, timestamp: now } as Message;
  },

  async markMessagesAsRead(conversationId: string, userId: string) {
    const pool = getPgPool();
    await pool.query('UPDATE messages SET is_read = true WHERE conversation_id = $1 AND sender_id != $2', [conversationId, userId]);
    await pool.query('UPDATE conversations SET unread_count = 0, updated_at = $1 WHERE id = $2', [new Date().toISOString(), conversationId]);
  },
};

export function mergeSessionUser(session: any): User | null {
  if (!session?.user) return null;
  const user = { ...session.user } as User;
  if (session.patientProfile) {
    user.name = `${session.patientProfile.firstName} ${session.patientProfile.lastName}`.trim();
  }
  if (session.doctorProfile) {
    user.name = `${session.doctorProfile.firstName} ${session.doctorProfile.lastName}`.trim();
  }
  return user;
}

// Initialize schema/seed on module load
(async () => {
  try {
    await ensureSchema();
    await seedDatabaseIfEmpty();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('consultara-db-pg: schema/seed init failed', err?.message || err);
  }
})();
// Postgres adapter implemented above. Exports are provided by the module.
