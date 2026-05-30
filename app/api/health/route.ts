import { NextResponse } from 'next/server';
import { consultaraDb } from '@/lib/server/consultara-db';

export async function GET() {
  // Basic health check for app + optional DB connectivity
  const payload: any = { ok: true, timestamp: new Date().toISOString() };
  try {
    // consultaraDb.getAppState may be async depending on adapter
    if (typeof consultaraDb.getAppState === 'function') {
      // call but limit heavy operations -- adapter implementations should return quickly
      const state = await Promise.race([Promise.resolve(consultaraDb.getAppState()), new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 2000))]);
      if (state) payload.db = { ok: true };
    }
  } catch (err: any) {
    payload.db = { ok: false, error: err?.message || String(err) };
  }

  return NextResponse.json(payload);
}
