'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Appointment, AppointmentStatus, Conversation, MedicalRecord, Message, Notification, Prescription } from './types';
import { sampleAppointments, sampleConversations, sampleMedicalRecords, sampleMessages, sampleNotifications } from './data';
import { useAuth } from './auth-context';

interface AppDataState {
  appointments: Appointment[];
  medicalRecords: MedicalRecord[];
  notifications: Notification[];
  conversations: Conversation[];
  messages: Message[];
  prescriptions: Prescription[];
  isLoading: boolean;
}

interface AppDataContextType extends AppDataState {
  createAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Appointment>;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  cancelAppointment: (id: string) => void;
  getAppointmentsByPatient: (patientId: string) => Appointment[];
  getAppointmentsByDoctor: (doctorId: string) => Appointment[];
  getUpcomingAppointments: (userId: string, role: 'patient' | 'doctor') => Appointment[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: (userId: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  getUnreadCount: (userId: string) => number;
  sendMessage: (conversationId: string, senderId: string, senderRole: 'patient' | 'doctor', content: string) => void;
  addMessage: (message: Message) => void;
  getMessagesByConversation: (conversationId: string) => Message[];
  markMessagesAsRead: (conversationId: string, userId: string) => void;
  getOrCreateConversation: (patientId: string, doctorId: string) => Conversation;
  addMedicalRecord: (record: Omit<MedicalRecord, 'id' | 'createdAt'>) => void;
  getMedicalRecordsByPatient: (patientId: string) => MedicalRecord[];
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

async function apiRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(payload?.error || 'Request failed');
  }

  return response.json() as Promise<T>;
}

function normalizeMessage(message: Message): Message {
  const timestamp = message.timestamp || message.createdAt || new Date().toISOString();
  return {
    ...message,
    senderRole: message.senderRole || message.senderType || 'patient',
    senderType: message.senderType || message.senderRole,
    isRead: message.isRead ?? message.read ?? false,
    read: message.read ?? message.isRead ?? false,
    createdAt: message.createdAt || timestamp,
    timestamp,
  };
}

function normalizeConversation(conversation: Conversation): Conversation {
  return {
    ...conversation,
    patientId: conversation.patientId || conversation.participants.patientId,
    doctorId: conversation.doctorId || conversation.participants.doctorId,
  };
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [state, setState] = useState<AppDataState>({
    appointments: [],
    medicalRecords: [],
    notifications: [],
    conversations: [],
    messages: [],
    prescriptions: [],
    isLoading: true,
  });

  const loadData = useCallback(async () => {
    try {
      const response = await apiRequest<Pick<AppDataState, 'appointments' | 'medicalRecords' | 'notifications' | 'conversations' | 'messages' | 'prescriptions'>>('/api/state');
      setState({
        appointments: response.appointments,
        medicalRecords: response.medicalRecords.map(record => ({
          ...record,
          type: record.type === 'consultation' ? 'consultations' : record.type,
        })),
        notifications: response.notifications,
        conversations: response.conversations.map(normalizeConversation),
        messages: response.messages.map(normalizeMessage),
        prescriptions: response.prescriptions,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error loading app data:', error);
      setState({
        appointments: sampleAppointments,
        medicalRecords: sampleMedicalRecords.map(record => ({
          ...record,
          type: record.type === 'consultation' ? 'consultations' : record.type,
        })),
        notifications: sampleNotifications,
        conversations: sampleConversations.map(normalizeConversation),
        messages: sampleMessages.map(normalizeMessage),
        prescriptions: sampleMedicalRecords
          .map(record => record.prescription)
          .filter((prescription): prescription is Prescription => Boolean(prescription)),
        isLoading: false,
      });
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    const refresh = () => {
      void loadData();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refresh();
      }
    };

    const intervalId = window.setInterval(refresh, 15000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthLoading, loadData]);

  const visibleNotifications = useMemo(() => {
    if (!user) {
      return [];
    }

    const allowedTypes = user.role === 'doctor'
      ? new Set(['appointment-created', 'appointment-rescheduled', 'appointment-cancelled'])
      : new Set(['appointment-created', 'appointment-rescheduled', 'appointment-cancelled']);

    return state.notifications.filter(notification => notification.userId === user.id && allowedTypes.has(notification.type));
  }, [state.notifications, user]);

  const createAppointment = useCallback(async (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newAppointment: Appointment = {
      ...appointmentData,
      id: `apt-${Date.now()}`,
      type: appointmentData.type || appointmentData.consultationType,
      time: appointmentData.time || appointmentData.timeSlot.startTime,
      reason: appointmentData.reason || appointmentData.symptoms || 'General Consultation',
      createdAt: now,
      updatedAt: now,
    };

    setState(prev => ({ ...prev, appointments: [...prev.appointments, newAppointment] }));

    try {
      const response = await apiRequest('/api/state', {
        method: 'POST',
        body: JSON.stringify({ resource: 'appointments', action: 'create', appointment: newAppointment }),
      });

      // If server returned an authoritative appointment, replace local placeholder
      if (response?.appointment) {
        setState(prev => ({
          ...prev,
          appointments: prev.appointments.map(a => a.id === newAppointment.id ? response.appointment : a),
        }));
      }

      // Merge any server-generated notifications
      if (response?.notifications && response.notifications.length) {
        setState(prev => ({ ...prev, notifications: [...response.notifications, ...prev.notifications] }));
      }

      // Merge any server-generated messages and conversations
      if (response?.messages && response.messages.length) {
        setState(prev => {
          const newMessages = [...prev.messages, ...response.messages.map((m: any) => normalizeMessage(m))];
          // Update conversations that correspond to the messages
          const updatedConversations = prev.conversations.map(conv => {
            const lastMsg = response.messages.filter((m: any) => m.conversationId === conv.id).slice(-1)[0];
            if (lastMsg) {
              return { ...conv, lastMessage: normalizeMessage(lastMsg), unreadCount: (conv.unreadCount || 0) + 1 };
            }
            return conv;
          });
          return { ...prev, messages: newMessages, conversations: updatedConversations };
        });
      }

      return response?.appointment ?? newAppointment;
    } catch (err) {
      console.error('Error creating appointment on server:', err);
      return newAppointment;
    }
  }, []);

  const updateAppointment = useCallback((id: string, updates: Partial<Appointment>) => {
    setState(prev => ({
      ...prev,
      appointments: prev.appointments.map(appointment =>
        appointment.id === id ? { ...appointment, ...updates, updatedAt: new Date().toISOString() } : appointment
      ),
    }));

    void apiRequest<{ appointment: Appointment | null; notifications?: Notification[]; deletedMedicalRecordIds?: string[] }>('/api/state', {
      method: 'PATCH',
      body: JSON.stringify({ resource: 'appointments', action: 'update', id, updates }),
    }).then(response => {
      if (response.deletedMedicalRecordIds?.length) {
        setState(prev => ({
          ...prev,
          medicalRecords: prev.medicalRecords.filter(record => !response.deletedMedicalRecordIds?.includes(record.id)),
          prescriptions: prev.prescriptions.filter(prescription => !response.deletedMedicalRecordIds?.includes(prescription.consultationId)),
        }));
      }

      if (!response.notifications?.length) {
        return;
      }

      setState(prev => ({
        ...prev,
        notifications: [...response.notifications, ...prev.notifications],
      }));
    }).catch(error => {
      console.error('Error updating appointment:', error);
    });
  }, []);

  const updateAppointmentStatus = useCallback((id: string, status: AppointmentStatus) => {
    updateAppointment(id, { status });
  }, [updateAppointment]);

  const cancelAppointment = useCallback((id: string) => {
    updateAppointment(id, { status: 'cancelled' });
  }, [updateAppointment]);

  const getAppointmentsByPatient = useCallback((patientId: string) => state.appointments.filter(appointment => appointment.patientId === patientId), [state.appointments]);
  const getAppointmentsByDoctor = useCallback((doctorId: string) => state.appointments.filter(appointment => appointment.doctorId === doctorId), [state.appointments]);

  const getUpcomingAppointments = useCallback((userId: string, role: 'patient' | 'doctor') => {
    const today = new Date().toISOString().split('T')[0];
    return state.appointments
      .filter(appointment => {
        const matchesRole = role === 'patient' ? appointment.patientId === userId : appointment.doctorId === userId;
        const isFuture = appointment.date >= today;
        const isActive = appointment.status === 'pending' || appointment.status === 'confirmed';
        return matchesRole && isFuture && isActive;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [state.appointments]);

  const markNotificationAsRead = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(notification => notification.id === id ? { ...notification, isRead: true, read: true } : notification),
    }));

    void apiRequest('/api/state', {
      method: 'PATCH',
      body: JSON.stringify({ resource: 'notifications', action: 'markRead', id }),
    });
  }, []);

  const markAllNotificationsAsRead = useCallback((userId: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(notification => notification.userId === userId ? { ...notification, isRead: true, read: true } : notification),
    }));

    void apiRequest('/api/state', {
      method: 'PATCH',
      body: JSON.stringify({ resource: 'notifications', action: 'markAllRead', userId }),
    });
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setState(prev => ({ ...prev, notifications: [newNotification, ...prev.notifications] }));

    void apiRequest('/api/state', {
      method: 'POST',
      body: JSON.stringify({ resource: 'notifications', action: 'add', notification: newNotification }),
    });
  }, []);

  const getUnreadCount = useCallback((userId: string) => visibleNotifications.filter(notification => notification.userId === userId && !notification.isRead && !notification.read).length, [visibleNotifications]);

  const addMessage = useCallback((message: Message) => {
    const normalizedMessage = normalizeMessage(message);

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, normalizedMessage],
      conversations: prev.conversations.map(conversation =>
        conversation.id === normalizedMessage.conversationId
          ? { ...conversation, lastMessage: normalizedMessage, unreadCount: conversation.unreadCount + 1, updatedAt: normalizedMessage.createdAt }
          : conversation
      ),
    }));

    void apiRequest('/api/state', {
      method: 'POST',
      body: JSON.stringify({ resource: 'messages', action: 'add', message: normalizedMessage }),
    });
  }, []);

  const sendMessage = useCallback((conversationId: string, senderId: string, senderRole: 'patient' | 'doctor', content: string) => {
    addMessage({
      id: `msg-${Date.now()}`,
      conversationId,
      senderId,
      senderRole,
      senderType: senderRole,
      content,
      isRead: false,
      read: false,
      createdAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
    });
  }, [addMessage]);

  const getMessagesByConversation = useCallback((conversationId: string) => {
    return state.messages
      .filter(message => message.conversationId === conversationId)
      .sort((a, b) => (a.createdAt || a.timestamp || '').localeCompare(b.createdAt || b.timestamp || ''));
  }, [state.messages]);

  const markMessagesAsRead = useCallback((conversationId: string, userId: string) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(message =>
        message.conversationId === conversationId && message.senderId !== userId ? { ...message, isRead: true, read: true } : message
      ),
      conversations: prev.conversations.map(conversation => conversation.id === conversationId ? { ...conversation, unreadCount: 0 } : conversation),
    }));

    void apiRequest('/api/state', {
      method: 'PATCH',
      body: JSON.stringify({ resource: 'messages', action: 'markRead', conversationId, userId }),
    });
  }, []);

  const getOrCreateConversation = useCallback((patientId: string, doctorId: string) => {
    const existing = state.conversations.find(conversation => conversation.participants.patientId === patientId && conversation.participants.doctorId === doctorId);
    if (existing) return existing;

    const now = new Date().toISOString();
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      participants: { patientId, doctorId },
      patientId,
      doctorId,
      unreadCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    setState(prev => ({ ...prev, conversations: [...prev.conversations, newConversation] }));

    void apiRequest('/api/state', {
      method: 'POST',
      body: JSON.stringify({ resource: 'conversations', action: 'create', conversation: newConversation }),
    }).then((response: any) => {
      if (response?.conversation) {
        const serverConv = normalizeConversation(response.conversation as any);
        setState(prev => ({ ...prev, conversations: prev.conversations.map(c => c.id === newConversation.id ? serverConv : c) }));
        return serverConv;
      }
    }).catch(err => {
      console.error('Error creating conversation on server:', err);
    });

    return newConversation;
  }, [state.conversations]);


  const addMedicalRecord = useCallback((record: Omit<MedicalRecord, 'id' | 'createdAt'>) => {
    const newRecord: MedicalRecord = {
      ...record,
      id: `record-${Date.now()}`,
      title: record.title || record.diagnosis,
      type: record.type || 'consultations',
      createdAt: new Date().toISOString(),
    };

    const newPrescription = newRecord.prescription
      ? { ...newRecord.prescription, patientId: newRecord.patientId, doctorId: newRecord.doctorId }
      : null;

    setState(prev => ({
      ...prev,
      medicalRecords: [...prev.medicalRecords, newRecord],
      prescriptions: newPrescription ? [...prev.prescriptions, newPrescription] : prev.prescriptions,
    }));

    void apiRequest('/api/state', {
      method: 'POST',
      body: JSON.stringify({ resource: 'medicalRecords', action: 'add', record: newRecord }),
    });
  }, []);

  const getMedicalRecordsByPatient = useCallback((patientId: string) => state.medicalRecords.filter(record => record.patientId === patientId).sort((a, b) => b.date.localeCompare(a.date)), [state.medicalRecords]);

  const value: AppDataContextType = {
    ...state,
    notifications: visibleNotifications,
    createAppointment,
    updateAppointment,
    updateAppointmentStatus,
    cancelAppointment,
    getAppointmentsByPatient,
    getAppointmentsByDoctor,
    getUpcomingAppointments,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    addNotification,
    getUnreadCount,
    sendMessage,
    addMessage,
    getMessagesByConversation,
    markMessagesAsRead,
    getOrCreateConversation,
    addMedicalRecord,
    getMedicalRecordsByPatient,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}
