import { NextRequest, NextResponse } from 'next/server';
import { consultaraDb } from '@/lib/server/consultara-db';

export async function GET() {
  return NextResponse.json(consultaraDb.getAppState());
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const resource = body.resource as string | undefined;
  const action = body.action as string | undefined;

  if (!resource || !action) {
    return NextResponse.json({ error: 'Missing resource or action' }, { status: 400 });
  }

  if (resource === 'appointments' && action === 'create') {
    return NextResponse.json({ appointment: consultaraDb.createAppointment(body.appointment) });
  }

  if (resource === 'notifications' && action === 'add') {
    return NextResponse.json({ notification: consultaraDb.addNotification(body.notification) });
  }

  if (resource === 'conversations' && action === 'create') {
    return NextResponse.json({ conversation: consultaraDb.getOrCreateConversation(body.conversation.patientId, body.conversation.doctorId) });
  }

  if (resource === 'messages' && action === 'add') {
    return NextResponse.json({ message: consultaraDb.addMessage(body.message) });
  }

  if (resource === 'medicalRecords' && action === 'add') {
    return NextResponse.json({ record: consultaraDb.addMedicalRecord(body.record) });
  }

  return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const resource = body.resource as string | undefined;
  const action = body.action as string | undefined;

  if (!resource || !action) {
    return NextResponse.json({ error: 'Missing resource or action' }, { status: 400 });
  }

  if (resource === 'appointments' && action === 'update') {
    return NextResponse.json({ appointment: consultaraDb.updateAppointment(body.id, body.updates || {}) });
  }

  if (resource === 'notifications' && action === 'markRead') {
    consultaraDb.markNotificationAsRead(body.id);
    return NextResponse.json({ success: true });
  }

  if (resource === 'notifications' && action === 'markAllRead') {
    consultaraDb.markAllNotificationsAsRead(body.userId);
    return NextResponse.json({ success: true });
  }

  if (resource === 'messages' && action === 'markRead') {
    consultaraDb.markMessagesAsRead(body.conversationId, body.userId);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
}
