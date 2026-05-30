import { NextRequest, NextResponse } from 'next/server';
import { consultaraDb } from '@/lib/server/consultara-db';

export async function GET() {
  return NextResponse.json(await consultaraDb.getAppState());
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const resource = body.resource as string | undefined;
  const action = body.action as string | undefined;

  if (!resource || !action) {
    return NextResponse.json({ error: 'Missing resource or action' }, { status: 400 });
  }

  if (resource === 'appointments' && action === 'create') {
    return NextResponse.json(await consultaraDb.createAppointment(body.appointment));
  }

  if (resource === 'notifications' && action === 'add') {
    return NextResponse.json({ notification: await consultaraDb.addNotification(body.notification) });
  }

  if (resource === 'conversations' && action === 'create') {
    return NextResponse.json({ conversation: await consultaraDb.getOrCreateConversation(body.conversation.patientId, body.conversation.doctorId) });
  }

  if (resource === 'messages' && action === 'add') {
    return NextResponse.json({ message: await consultaraDb.addMessage(body.message) });
  }

  if (resource === 'medicalRecords' && action === 'add') {
    return NextResponse.json({ record: await consultaraDb.addMedicalRecord(body.record) });
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
    return NextResponse.json(await consultaraDb.updateAppointment(body.id, body.updates || {}));
  }

  if (resource === 'notifications' && action === 'markRead') {
    await consultaraDb.markNotificationAsRead(body.id);
    return NextResponse.json({ success: true });
  }

  if (resource === 'notifications' && action === 'markAllRead') {
    await consultaraDb.markAllNotificationsAsRead(body.userId);
    return NextResponse.json({ success: true });
  }

  if (resource === 'messages' && action === 'markRead') {
    await consultaraDb.markMessagesAsRead(body.conversationId, body.userId);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
}
