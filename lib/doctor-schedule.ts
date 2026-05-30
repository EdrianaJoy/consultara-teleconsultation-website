import type { WeeklySchedule } from '@/lib/types';

export const DOCTOR_DEFAULT_SCHEDULE: WeeklySchedule = {
  monday: { isWorkingDay: true, slots: [{ startTime: '09:00', endTime: '17:00', isAvailable: true }] },
  tuesday: { isWorkingDay: true, slots: [{ startTime: '09:00', endTime: '17:00', isAvailable: true }] },
  wednesday: { isWorkingDay: true, slots: [{ startTime: '09:00', endTime: '17:00', isAvailable: true }] },
  thursday: { isWorkingDay: true, slots: [{ startTime: '09:00', endTime: '17:00', isAvailable: true }] },
  friday: { isWorkingDay: true, slots: [{ startTime: '09:00', endTime: '17:00', isAvailable: true }] },
  saturday: { isWorkingDay: false, slots: [] },
  sunday: { isWorkingDay: false, slots: [] },
};

export const DOCTOR_SCHEDULE_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

export function normalizeWeeklySchedule(schedule?: Partial<WeeklySchedule> | null): WeeklySchedule {
  const normalized: WeeklySchedule = {
    ...DOCTOR_DEFAULT_SCHEDULE,
    ...(schedule || {}),
  } as WeeklySchedule;

  for (const day of DOCTOR_SCHEDULE_DAYS) {
    const value = schedule?.[day];
    normalized[day] = {
      isWorkingDay: value?.isWorkingDay ?? DOCTOR_DEFAULT_SCHEDULE[day].isWorkingDay,
      slots: (value?.slots?.length ? value.slots : DOCTOR_DEFAULT_SCHEDULE[day].slots).map((slot) => ({
        startTime: slot.startTime || '09:00',
        endTime: slot.endTime || '17:00',
        isAvailable: slot.isAvailable ?? true,
      })),
    };
  }

  return normalized;
}

export function buildWeeklyScheduleFromWorkingHours(
  workingDays: Record<typeof DOCTOR_SCHEDULE_DAYS[number], boolean>,
  timeSlots: Record<typeof DOCTOR_SCHEDULE_DAYS[number], { start: string; end: string }>,
): WeeklySchedule {
  return {
    monday: { isWorkingDay: workingDays.monday, slots: workingDays.monday ? [{ startTime: timeSlots.monday.start, endTime: timeSlots.monday.end, isAvailable: true }] : [] },
    tuesday: { isWorkingDay: workingDays.tuesday, slots: workingDays.tuesday ? [{ startTime: timeSlots.tuesday.start, endTime: timeSlots.tuesday.end, isAvailable: true }] : [] },
    wednesday: { isWorkingDay: workingDays.wednesday, slots: workingDays.wednesday ? [{ startTime: timeSlots.wednesday.start, endTime: timeSlots.wednesday.end, isAvailable: true }] : [] },
    thursday: { isWorkingDay: workingDays.thursday, slots: workingDays.thursday ? [{ startTime: timeSlots.thursday.start, endTime: timeSlots.thursday.end, isAvailable: true }] : [] },
    friday: { isWorkingDay: workingDays.friday, slots: workingDays.friday ? [{ startTime: timeSlots.friday.start, endTime: timeSlots.friday.end, isAvailable: true }] : [] },
    saturday: { isWorkingDay: workingDays.saturday, slots: workingDays.saturday ? [{ startTime: timeSlots.saturday.start, endTime: timeSlots.saturday.end, isAvailable: true }] : [] },
    sunday: { isWorkingDay: workingDays.sunday, slots: workingDays.sunday ? [{ startTime: timeSlots.sunday.start, endTime: timeSlots.sunday.end, isAvailable: true }] : [] },
  };
}