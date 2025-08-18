import { create } from 'zustand';
import type { Relationship } from '../types';

export type Goober = {
  id: string;
  name: string;
  nickname?: string;
  birthday?: string;
  phone?: string;
  email?: string;
  relationship_type: Relationship;
  notes?: string;
};

export type EventItem = {
  id: string;
  gooberId: string;
  title: string;
  start: string;
  end: string;
  location?: string;
  calendarEventId?: string;
};

function normalizePhone(p?: string) {
  return (p ?? '').replace(/\D/g, '');
}
function normalizeName(n?: string) {
  return (n ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
}
function gooberKey(g: Pick<Goober, 'name' | 'email' | 'phone'>) {
  const email = (g.email ?? '').trim().toLowerCase();
  const phone = normalizePhone(g.phone);
  if (email) return `e:${email}`;
  if (phone) return `p:${phone}`;
  return `n:${normalizeName(g.name)}`;
}

type State = {
  darkMode: boolean;
  toggleDarkMode: () => void;
  goobers: Goober[];
  gooberKeys: string[];
  addGoobers: (
    goobers: Goober[],
    options?: { dedupe?: boolean }
  ) => { added: number; skipped: number };
  clearGoobers: () => void;
  getGooberById: (id: string) => Goober | undefined;
  updateGoober: (id: string, patch: Partial<Goober>) => void;
  deleteGoober: (id: string) => void;
  events: EventItem[];
  addOrUpdateEvent: (e: EventItem) => void;
  updateEventById: (id: string, patch: Partial<EventItem>) => void;
  deleteEventById: (id: string) => void;
};

let keySet = new Set<string>();

export const useStore = create<State>((set, get) => ({
  darkMode: false,
  toggleDarkMode: () => set(s => ({ darkMode: !s.darkMode })),
  goobers: [],
  gooberKeys: [],
  addGoobers: (incoming, options) => {
    const dedupe = options?.dedupe;
    const toAdd: Goober[] = [];
    const keys: string[] = [];
    let skipped = 0;
    incoming.forEach(g => {
      const key = gooberKey(g);
      if (dedupe && keySet.has(key)) {
        skipped += 1;
        return;
      }
      toAdd.push(g);
      keys.push(key);
      keySet.add(key);
    });
    if (toAdd.length) {
      set(s => ({
        goobers: [...s.goobers, ...toAdd],
        gooberKeys: [...s.gooberKeys, ...keys],
      }));
    }
    return { added: toAdd.length, skipped };
  },
  clearGoobers: () => {
    keySet = new Set();
    set({ goobers: [], gooberKeys: [] });
  },
  getGooberById: id => get().goobers.find(g => g.id === id),
  updateGoober: (id, patch) =>
    set(s => {
      const idx = s.goobers.findIndex(g => g.id === id);
      if (idx === -1) return {};
      const current = s.goobers[idx];
      const updated = { ...current, ...patch };
      const oldKey = gooberKey(current);
      const newKey = gooberKey(updated);
      const goobers = [...s.goobers];
      goobers[idx] = updated;
      if (oldKey !== newKey) {
        keySet.delete(oldKey);
        keySet.add(newKey);
        const keys = [...s.gooberKeys];
        keys[idx] = newKey;
        return { goobers, gooberKeys: keys };
      }
      return { goobers };
    }),
  deleteGoober: id =>
    set(s => {
      const idx = s.goobers.findIndex(g => g.id === id);
      if (idx === -1) return {};
      const key = s.gooberKeys[idx];
      keySet.delete(key);
      const goobers = s.goobers.filter(g => g.id !== id);
      const gooberKeys = s.gooberKeys.filter((_, i) => i !== idx);
      return { goobers, gooberKeys };
    }),
  events: [],
  addOrUpdateEvent: e =>
    set(s => {
      const idx = s.events.findIndex(ev => ev.id === e.id);
      if (idx === -1) return { events: [...s.events, e] };
      const events = [...s.events];
      events[idx] = e;
      return { events };
    }),
  updateEventById: (id, patch) =>
    set(s => {
      const idx = s.events.findIndex(ev => ev.id === id);
      if (idx === -1) return {};
      const events = [...s.events];
      events[idx] = { ...events[idx], ...patch };
      return { events };
    }),
  deleteEventById: id =>
    set(s => ({ events: s.events.filter(ev => ev.id !== id) })),
}));
