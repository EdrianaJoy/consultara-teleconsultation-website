# Verification Checklist

This checklist verifies the repository follows the Technical Expectations and that the Patient and Doctor modules include required parts and working actions.

Follow each item and mark it as done when verified.

---

## Technical Expectations

- [ ] Platform: Web, responsive for desktop and mobile.
- [ ] Frontend: Built with Next.js + TypeScript (codebase uses TypeScript).
- [ ] Backend: Custom Node/Next APIs; avoid relying on BaaS for core logic.
- [ ] Database: Persistent DB (SQLite used in dev; production should use Postgres/MySQL).
- [ ] Version control: Repository is on GitHub with commit history.
- [ ] Code quality: Project builds (`pnpm build`) and lints without critical errors.
- [ ] Deployment: Contains notes on deployment and containerization options.

Verification steps:
- Run `pnpm install` then `pnpm build` — build completes.
- Confirm `.gitignore` contains database artifacts: `*.sqlite`, `*.sqlite-shm`, `*.sqlite-wal`, and `.data/`.

---

## Patient Module

Required parts (from spec): account creation, profile, doctor discovery, AI recommendation, appointment booking, consultation session, medical records.

- Account Creation
  - [ ] Register using email/password via `/auth/signup`.
  - [ ] Confirm `confirmPassword` is enforced on signup.

- Profile
  - [ ] Patient can add/edit personal details (name, DOB, contact, basic medical history).

- Doctor Discovery
  - [ ] Browse doctors listing and view doctor details.
  - [ ] Filter/search by specialization.

- AI Recommendation (if present)
  - [ ] Describe symptoms and receive recommended doctors (if the feature is implemented).

- Appointment Booking
  - [ ] Book a consultation from a doctor's page — booking persists on the server.
  - [ ] Server returns authoritative `appointment.id` and any `notifications` and `messages` created.
  - [ ] Patient can reschedule/cancel bookings and changes persist.
  - [ ] Upcoming appointments UI deduplicates entries.

- Consultation Session
  - [ ] Patient can join an appointment session (link or route exists).

- Medical Records
  - [ ] Patient can view appointment history and prescriptions/notes added by doctors.

Verification steps (Patient flows):
- Sign up as a patient, create a profile.
- From a patient account, browse a doctor and book an appointment; observe server response shape (inspect network call to `/api/state`).
- Confirm conversation/messages and notifications are present server-side and appear in UI.

---

## Doctor Module

Required parts: profile management, medical records access, schedule management, consultation notes & prescriptions, consultation sessions.

- Profile Management
  - [ ] Doctor can register and create a profile (multi-step doctor registration flows under `/auth/register/doctor`).
  - [ ] Profile allows adding bio, specialization, contact, and clinic location.

- Medical Records Access
  - [ ] Doctor can view patient appointment history and records/prescriptions.

- Consultation Schedule Management
  - [ ] Doctor can set availability and block unavailable slots.
  - [ ] Doctor receives real-time notifications for new bookings/changes (verify server persisted notifications).

- Consultation Notes & Prescriptions
  - [ ] After an appointment, doctor can add notes and prescriptions attached to the appointment.

- Consultation Session
  - [ ] Doctor can join the appointment session (link or route exists).

Verification steps (Doctor flows):
- Create a doctor account via `/auth/register/doctor` and complete profile.
- From a patient booking, confirm the doctor receives server-persisted notification and message (check `/api/state` response and DB via `lib/server/consultara-db.ts`).
- Add consultation notes for an appointment and confirm the patient can view them.

---

## Notes & Troubleshooting

- The server stores appointments, notifications, and messages; client merges server-returned objects into state. See `lib/server/consultara-db.ts` and `lib/app-data-context.tsx` for details.
- If you find WAL/SHM files committed accidentally, remove them and update `.gitignore`.

If you want, I can run the scripted checks or walk through failing items and fix them.
