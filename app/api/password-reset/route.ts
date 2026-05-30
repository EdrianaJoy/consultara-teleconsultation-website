import { NextRequest, NextResponse } from 'next/server';
import { consultaraDb } from '@/lib/server/consultara-db';

export async function POST(request: NextRequest) {
  // Guard: only allow this endpoint in development to avoid accidental exposure in prod
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ success: false, error: 'Password reset endpoint disabled in production' }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const email = String(body.email || '').trim();
  const newPassword = String(body.newPassword || '');
  const confirmPassword = String(body.confirmPassword || '');

  if (!email || !newPassword) {
    return NextResponse.json({ success: false, error: 'Missing email or newPassword' }, { status: 400 });
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json({ success: false, error: 'Passwords do not match' }, { status: 400 });
  }

  try {
    const result = await consultaraDb.resetPassword(email, newPassword);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to reset password' }, { status: 500 });
  }
}
