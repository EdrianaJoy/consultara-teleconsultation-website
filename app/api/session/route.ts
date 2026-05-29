import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { consultaraDb, mergeSessionUser } from '@/lib/server/consultara-db';

const SESSION_COOKIE = 'consultara_session';

function sessionResponse(payload: ReturnType<typeof consultaraDb.getSession>) {
  return {
    user: mergeSessionUser(payload),
    patientProfile: payload.patientProfile,
    doctorProfile: payload.doctorProfile,
    isAuthenticated: payload.isAuthenticated,
  };
}

export async function GET() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) {
    return NextResponse.json({ user: null, patientProfile: null, doctorProfile: null, isAuthenticated: false });
  }

  const payload = consultaraDb.getSession(sessionId);
  return NextResponse.json(sessionResponse(payload));
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const action = body.action as string | undefined;
  const cookieStore = await cookies();

  if (!action) {
    return NextResponse.json({ error: 'Missing action' }, { status: 400 });
  }

  if (action === 'signin') {
    const result = consultaraDb.signIn(String(body.email || ''), String(body.password || ''));
    if (!result.success || !result.session) {
      return NextResponse.json(result, { status: 401 });
    }

    cookieStore.set(SESSION_COOKIE, result.session.user?.id || '', { path: '/', sameSite: 'lax' });
    return NextResponse.json({ success: true, ...sessionResponse(result.session) });
  }

  if (action === 'signup') {
    const result = consultaraDb.signUp(String(body.email || ''), String(body.password || ''), body.role);
    if (!result.success || !result.session) {
      return NextResponse.json(result, { status: 400 });
    }

    cookieStore.set(SESSION_COOKIE, result.session.user?.id || '', { path: '/', sameSite: 'lax' });
    return NextResponse.json({ success: true, ...sessionResponse(result.session) });
  }

  if (action === 'register') {
    const signupResult = consultaraDb.signUp(String(body.email || ''), String(body.password || ''), body.role);
    if (!signupResult.success || !signupResult.session?.user) {
      return NextResponse.json(signupResult, { status: 400 });
    }

    const payload = consultaraDb.completeRegistration(signupResult.session.user.id, body.profileData || {});
    cookieStore.set(SESSION_COOKIE, signupResult.session.user.id, { path: '/', sameSite: 'lax' });
    return NextResponse.json({ success: true, ...sessionResponse(payload) });
  }

  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  if (action === 'signout') {
    cookieStore.delete(SESSION_COOKIE);
    consultaraDb.signOut();
    return NextResponse.json({ success: true });
  }

  if (action === 'selectRole') {
    const payload = consultaraDb.selectRole(sessionId, body.role);
    return NextResponse.json({ success: true, ...sessionResponse(payload) });
  }

  if (action === 'updatePatientProfile') {
    const payload = consultaraDb.upsertPatientProfile(sessionId, body.profile || {});
    return NextResponse.json({ success: true, ...sessionResponse(payload) });
  }

  if (action === 'updateDoctorProfile') {
    try {
      const payload = consultaraDb.upsertDoctorProfile(sessionId, body.profile || {});
      return NextResponse.json({ success: true, ...sessionResponse(payload) });
    } catch (err: any) {
      return NextResponse.json({ error: err?.message || 'Failed to update profile' }, { status: 400 });
    }
  }

  if (action === 'completeRegistration') {
    try {
      const payload = consultaraDb.completeRegistration(sessionId, body.profileData || {});
      return NextResponse.json({ success: true, ...sessionResponse(payload) });
    } catch (err: any) {
      return NextResponse.json({ error: err?.message || 'Failed to complete registration' }, { status: 400 });
    }
  }

  return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
}
