// @ts-ignore - expo-calendar types may be unavailable in dev
import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';

type Cal = {
  id: string;
  allowsModifications?: boolean;
  isPrimary?: boolean;
};

type CalEvent = {
  startDate: string | number | Date;
  endDate: string | number | Date;
};

export async function requestCalendarPermissions(): Promise<boolean> {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  return status === 'granted';
}

export async function getDefaultCalendarId(): Promise<string | null> {
  if (Platform.OS === 'ios') {
    const def = await Calendar.getDefaultCalendarAsync();
    return def?.id ?? null;
  }
  const cals = (await Calendar.getCalendarsAsync(
    Calendar.EntityTypes.EVENT
  )) as Cal[];
  const primary = cals.find(c => c.isPrimary && c.allowsModifications);
  if (primary) return primary.id;
  const writable = cals.find(c => c.allowsModifications);
  return writable?.id ?? null;
}

export async function findConflicts(startDate: Date, endDate: Date): Promise<boolean> {
  const id = await getDefaultCalendarId();
  if (!id) return false;
  const events = (await Calendar.getEventsAsync(
    [id],
    new Date(startDate.getTime() - 1000 * 60 * 60),
    new Date(endDate.getTime() + 1000 * 60 * 60)
  )) as CalEvent[];
  return events.some(ev => {
    const s = new Date(ev.startDate);
    const eEnd = new Date(ev.endDate);
    return s < endDate && eEnd > startDate;
  });
}

export async function createEventInDefaultCalendar(args: {
  title: string;
  notes?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
}): Promise<string> {
  const id = await getDefaultCalendarId();
  if (!id) throw new Error('no-default-calendar');
  return Calendar.createEventAsync(id, {
    title: args.title,
    notes: args.notes,
    startDate: args.startDate,
    endDate: args.endDate,
    location: args.location,
  });
}

export async function deleteEventById(eventId: string): Promise<void> {
  try {
    await Calendar.deleteEventAsync(eventId);
  } catch (e) {
    // ignore
  }
}
