#!/usr/bin/env node
/*
Copy data from local SQLite (.data/consultara.sqlite) into a Postgres database.
Usage: DATABASE_URL=postgres://user:pass@host:5432/dbname node scripts/sqlite-to-postgres.js
*/
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const { Client } = require('pg');

const SQLITE_PATH = process.env.SQLITE_PATH || path.join(process.cwd(), '.data', 'consultara.sqlite');
const DATABASE_URL = process.env.DATABASE_URL || process.argv[2];

if (!DATABASE_URL) {
  console.error('Please provide DATABASE_URL environment variable or as first arg');
  process.exit(1);
}

if (!fs.existsSync(SQLITE_PATH)) {
  console.error(`SQLite DB not found at ${SQLITE_PATH}`);
  process.exit(1);
}

const sdb = new Database(SQLITE_PATH, { readonly: true });
const pg = new Client({ connectionString: DATABASE_URL });

async function createTables() {
  const sql = `
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
    allergies_json JSONB,
    medical_conditions_json JSONB,
    current_medications_json JSONB,
    basic_medical_history TEXT,
    avatar TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
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
    availability_json JSONB NOT NULL,
    languages_json JSONB NOT NULL,
    rating REAL NOT NULL DEFAULT 0,
    total_reviews INTEGER NOT NULL DEFAULT 0,
    is_available INTEGER NOT NULL DEFAULT 1,
    location TEXT,
    accepts_insurance INTEGER NOT NULL DEFAULT 1,
    contact_number TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
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
    symptoms_json JSONB NOT NULL,
    treatment TEXT NOT NULL,
    prescription_json JSONB,
    notes TEXT,
    follow_up_required INTEGER NOT NULL DEFAULT 0,
    follow_up_date TEXT,
    attachments_json JSONB,
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
    last_message_json JSONB,
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
    attachments_json JSONB,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );
  `;

  await pg.query(sql);
}

async function copyTable(table) {
  console.log(`Copying table ${table}...`);
  const rows = sdb.prepare(`SELECT * FROM ${table}`).all();
  if (!rows || rows.length === 0) {
    console.log(`No rows for ${table}, skipping.`);
    return;
  }

  const cols = Object.keys(rows[0]);
  const colList = cols.map(c => `"${c}"`).join(',');
  const placeholders = cols.map((_, i) => `$${i + 1}`).join(',');
  const insertSql = `INSERT INTO ${table} (${colList}) VALUES (${placeholders})`;

  for (const row of rows) {
    const values = cols.map(c => {
      const v = row[c];
      // Try to parse JSON-looking strings for JSONB columns
      if (v && typeof v === 'string' && (c.endsWith('_json') || c.endsWith('_json') || c.includes('json'))) {
        try { return JSON.parse(v); } catch (e) { return v; }
      }
      return v;
    });
    try {
      await pg.query(insertSql, values);
    } catch (err) {
      console.error(`Failed inserting into ${table}:`, err.message);
      throw err;
    }
  }
}

async function main() {
  await pg.connect();
  console.log('Connected to Postgres');
  await createTables();
  console.log('Created tables if not exist');

  const tableRows = sdb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
  const tables = tableRows.map(r => r.name);
  for (const t of tables) {
    await copyTable(t);
  }

  console.log('Migration complete');
  await pg.end();
  sdb.close();
}

main().catch(err => { console.error(err); process.exit(1); });
