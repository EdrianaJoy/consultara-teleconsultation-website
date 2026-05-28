/**
 * ConsulTara TeleConsultation Platform - App Data Context
 * 
 * This context manages application data including appointments, medical records,
 * notifications, and messages. Uses localStorage for demo persistence.
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { 
  Appointment, 
  MedicalRecord, 
  Notification, 
  Conversation, 
  Message,
  AppointmentStatus
} from './types';
import { 
  sampleAppointments, 
  sampleMedicalRecords, 
  sampleNotifications, 
  sampleConversations, 
  sampleMessages 
} from './data';

// ============================================================================
// Types
// ============================================================================

interface AppDataState {
  appointments: Appointment[];
  medicalRecords: MedicalRecord[];
  notifications: Notification[];
  conversations: Conversation[];
  messages: Message[];
  isLoading: boolean;
}

interface AppDataContextType extends AppDataState {
  // Appointment actions
  createAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => Appointment;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  cancelAppointment: (id: string) => void;
  getAppointmentsByPatient: (patientId: string) => Appointment[];
  getAppointmentsByDoctor: (doctorId: string) => Appointment[];
  getUpcomingAppointments: (userId: string, role: 'patient' | 'doctor') => Appointment[];
  
  // Notification actions
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: (userId: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  getUnreadCount: (userId: string) => number;
  
  // Message actions
  sendMessage: (conversationId: string, senderId: string, senderRole: 'patient' | 'doctor', content: string) => void;
  getMessagesByConversation: (conversationId: string) => Message[];
  markMessagesAsRead: (conversationId: string, userId: string) => void;
  getOrCreateConversation: (patientId: string, doctorId: string) => Conversation;
  
  // Medical record actions
  addMedicalRecord: (record: Omit<MedicalRecord, 'id' | 'createdAt'>) => void;
  getMedicalRecordsByPatient: (patientId: string) => MedicalRecord[];
}

// ============================================================================
// Context
// ============================================================================

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

// ============================================================================
// Storage Keys
// ============================================================================

const STORAGE_KEYS = {
  APPOINTMENTS: 'consultara_appointments',
  MEDICAL_RECORDS: 'consultara_medical_records',
  NOTIFICATIONS: 'consultara_notifications',
  CONVERSATIONS: 'consultara_conversations',
  MESSAGES: 'consultara_messages',
};

// ============================================================================
// Provider Component
// ============================================================================

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppDataState>({
    appointments: [],
    medicalRecords: [],
    notifications: [],
    conversations: [],
    messages: [],
    isLoading: true,
  });

  // Load saved data on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const savedAppointments = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
        const savedMedicalRecords = localStorage.getItem(STORAGE_KEYS.MEDICAL_RECORDS);
        const savedNotifications = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
        const savedConversations = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
        const savedMessages = localStorage.getItem(STORAGE_KEYS.MESSAGES);

        setState({
          appointments: savedAppointments ? JSON.parse(savedAppointments) : sampleAppointments,
          medicalRecords: savedMedicalRecords ? JSON.parse(savedMedicalRecords) : sampleMedicalRecords,
          notifications: savedNotifications ? JSON.parse(savedNotifications) : sampleNotifications,
          conversations: savedConversations ? JSON.parse(savedConversations) : sampleConversations,
          messages: savedMessages ? JSON.parse(savedMessages) : sampleMessages,
          isLoading: false,
        });
      } catch (error) {
        console.error('Error loading app data:', error);
        setState({
          appointments: sampleAppointments,
          medicalRecords: sampleMedicalRecords,
          notifications: sampleNotifications,
          conversations: sampleConversations,
          messages: sampleMessages,
          isLoading: false,
        });
      }
    };

    loadData();
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    if (!state.isLoading) {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(state.appointments));
      localStorage.setItem(STORAGE_KEYS.MEDICAL_RECORDS, JSON.stringify(state.medicalRecords));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(state.notifications));
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(state.conversations));
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(state.messages));
    }
  }, [state]);

  // ============================================================================
  // Appointment Actions
  // ============================================================================

  const createAppointment = useCallback((appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Appointment => {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: `apt-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setState(prev => ({
      ...prev,
      appointments: [...prev.appointments, newAppointment],
    }));

    return newAppointment;
  }, []);

  const updateAppointment = useCallback((id: string, updates: Partial<Appointment>) => {
    setState(prev => ({
      ...prev,
      appointments: prev.appointments.map(apt =>
        apt.id === id
          ? { ...apt, ...updates, updatedAt: new Date().toISOString() }
          : apt
      ),
    }));
  }, []);

  const cancelAppointment = useCallback((id: string) => {
    updateAppointment(id, { status: 'cancelled' as AppointmentStatus });
  }, [updateAppointment]);

  const getAppointmentsByPatient = useCallback((patientId: string): Appointment[] => {
    return state.appointments.filter(apt => apt.patientId === patientId);
  }, [state.appointments]);

  const getAppointmentsByDoctor = useCallback((doctorId: string): Appointment[] => {
    return state.appointments.filter(apt => apt.doctorId === doctorId);
  }, [state.appointments]);

  const getUpcomingAppointments = useCallback((userId: string, role: 'patient' | 'doctor'): Appointment[] => {
    const today = new Date().toISOString().split('T')[0];
    return state.appointments.filter(apt => {
      const isRelevant = role === 'patient' ? apt.patientId === userId : apt.doctorId === userId;
      const isFuture = apt.date >= today;
      const isActive = apt.status === 'pending' || apt.status === 'confirmed';
      return isRelevant && isFuture && isActive;
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [state.appointments]);

  // ============================================================================
  // Notification Actions
  // ============================================================================

  const markNotificationAsRead = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      ),
    }));
  }, []);

  const markAllNotificationsAsRead = useCallback((userId: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(notif =>
        notif.userId === userId ? { ...notif, isRead: true } : notif
      ),
    }));
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setState(prev => ({
      ...prev,
      notifications: [newNotification, ...prev.notifications],
    }));
  }, []);

  const getUnreadCount = useCallback((userId: string): number => {
    return state.notifications.filter(n => n.userId === userId && !n.isRead).length;
  }, [state.notifications]);

  // ============================================================================
  // Message Actions
  // ============================================================================

  const sendMessage = useCallback((conversationId: string, senderId: string, senderRole: 'patient' | 'doctor', content: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId,
      senderRole,
      content,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      conversations: prev.conversations.map(conv =>
        conv.id === conversationId
          ? {
              ...conv,
              lastMessage: newMessage,
              unreadCount: conv.unreadCount + 1,
              updatedAt: new Date().toISOString(),
            }
          : conv
      ),
    }));
  }, []);

  const getMessagesByConversation = useCallback((conversationId: string): Message[] => {
    return state.messages
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [state.messages]);

  const markMessagesAsRead = useCallback((conversationId: string, userId: string) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(msg =>
        msg.conversationId === conversationId && msg.senderId !== userId
          ? { ...msg, isRead: true }
          : msg
      ),
      conversations: prev.conversations.map(conv =>
        conv.id === conversationId
          ? { ...conv, unreadCount: 0 }
          : conv
      ),
    }));
  }, []);

  const getOrCreateConversation = useCallback((patientId: string, doctorId: string): Conversation => {
    const existing = state.conversations.find(
      conv => conv.participants.patientId === patientId && conv.participants.doctorId === doctorId
    );

    if (existing) return existing;

    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      participants: { patientId, doctorId },
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setState(prev => ({
      ...prev,
      conversations: [...prev.conversations, newConversation],
    }));

    return newConversation;
  }, [state.conversations]);

  // ============================================================================
  // Medical Record Actions
  // ============================================================================

  const addMedicalRecord = useCallback((record: Omit<MedicalRecord, 'id' | 'createdAt'>) => {
    const newRecord: MedicalRecord = {
      ...record,
      id: `record-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setState(prev => ({
      ...prev,
      medicalRecords: [...prev.medicalRecords, newRecord],
    }));
  }, []);

  const getMedicalRecordsByPatient = useCallback((patientId: string): MedicalRecord[] => {
    return state.medicalRecords
      .filter(record => record.patientId === patientId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [state.medicalRecords]);

  // ============================================================================
  // Context Value
  // ============================================================================

  const value: AppDataContextType = {
    ...state,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    getAppointmentsByPatient,
    getAppointmentsByDoctor,
    getUpcomingAppointments,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    addNotification,
    getUnreadCount,
    sendMessage,
    getMessagesByConversation,
    markMessagesAsRead,
    getOrCreateConversation,
    addMedicalRecord,
    getMedicalRecordsByPatient,
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useAppData() {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}
