
# ConsulTara

**A teleconsultation platform for fast, secure, and accessible healthcare in Metro Manila.**

Built with **Next.js (App Router)**, **SQLite/Postgres**, and a server-authoritative architecture, ConsulTara simulates a real-world telehealth system with end-to-end patient and doctor workflows.

---

## 📌 Overview

ConsulTara is a teleconsultation platform designed to improve healthcare accessibility by enabling patients to connect with doctors through a structured, efficient, and secure digital system.

It focuses on solving key healthcare challenges in Metro Manila:
- Long waiting times for consultations
- Fragmented patient-doctor communication
- Lack of centralized medical records
- Limited access to immediate care

---

## 🎯 Product Vision

Deliver **fast, reliable, and structured teleconsultations** that reduce friction between patients and healthcare providers.

**North Star Metric:** Completed consultations per active user

---

## 👤 User Roles

### Patients
- Book consultations (instant or scheduled)
- View appointment history
- Receive prescriptions and updates
- Communicate with doctors via messaging

### Doctors
- Manage appointment requests
- Accept/reject consultations
- View patient history
- Issue prescriptions and notes

---

## ⚙️ Core Features

- Authentication system (patient & doctor roles)
- Appointment scheduling & management
- In-app messaging system
- Digital prescriptions
- Medical records storage
- Notification system
- Server-authoritative state management

---

## 🧱 Architecture

- **Frontend:** Next.js (App Router, TypeScript)
- **Backend:** Next.js API routes
- **Database:** SQLite (development) → Postgres (production-ready)
- **State Model:** Server-authoritative system
- **Deployment:** Vercel / Docker / PM2 supported

**Key Design Principle:**
> The server is the single source of truth for appointments and medical data, ensuring consistency across patient and doctor views.

---

## 🗄️ Database Strategy

- SQLite for local development and demo environment
- Optional Postgres adapter for production parity
- Modular API layer supports:
  - Authentication
  - Appointments
  - Messaging
  - Notifications
  - Medical records
  - Prescriptions

---

## 🚀 Getting Started

### Install dependencies
```bash
pnpm install
```

### Run development server
pnpm dev
open: http://localhost:3000

### 🧪 Verification
Run automated checks: node scripts/verify-ui-check.js
Or follow manual verification steps in: docs/verification-checklist.md
 
## Covers:
- Authentication flows
- Appointment creation & sync
- Doctor-patient state consistency
- API persistence validation

## 🧠 Engineering Highlights

- Server-authoritative appointment system (prevents data conflicts)
- Clean separation of UI, API, and database layers
- SQLite → Postgres migration support
- Seeded demo environment for instant usability
- Production-ready architecture design

---

## 📦 Deployment

### Vercel (Recommended)
- Connect GitHub repo
- Auto-deploy on `main` branch

### Docker
```bash
docker compose up -d

### PM2 
npm run build
npx pm2 start ecosystem.config.js

### 📊 Why This Project Matters
## Product Thinking
- End-to-end healthcare workflow design
- Focus on speed, access, and usability
- Real-world telehealth constraints in the Philippines
## Engineering Strength
- Full-stack system design (Next.js + API + DB)
- Server-authoritative state architecture
- Production-ready database migration strategy
- Scalable modular backend design

### 🛠️ Tech Stack
- Next.js (App Router)
- TypeScript
- SQLite (development)
- Postgres (production-ready)
- Vercel / Docker / PM2
- Node.js API Routes

### 📚 Resources
https://nextjs.org/docs
https://v0.app/docs

