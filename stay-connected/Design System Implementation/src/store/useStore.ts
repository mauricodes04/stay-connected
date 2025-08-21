import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Goober {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  birthday?: string;
  nickname?: string;
  relationship?: string;
  notes?: string;
  createdAt: string;
}

export interface Event {
  id: string;
  gooberId: string;
  gooberName: string;
  date: string;
  time: string;
  duration: number; // in minutes
  createdAt: string;
}

export interface ContactImport {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface AppState {
  // Dark mode
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  
  // Contacts/Goobers
  goobers: Goober[];
  addGoober: (goober: Omit<Goober, 'id' | 'createdAt'>) => void;
  updateGoober: (id: string, updates: Partial<Goober>) => void;
  deleteGoober: (id: string) => void;
  getGoober: (id: string) => Goober | undefined;
  
  // Events/Plans
  events: Event[];
  addEvent: (event: Omit<Event, 'id' | 'createdAt'>) => void;
  deleteEvent: (id: string) => void;
  
  // Contact import
  importedContacts: ContactImport[];
  setImportedContacts: (contacts: ContactImport[]) => void;
  selectedContactIds: string[];
  toggleContactSelection: (id: string) => void;
  clearContactSelection: () => void;
  
  // Permission states
  contactPermissionDenied: boolean;
  setContactPermissionDenied: (denied: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Dark mode
      isDarkMode: false,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      
      // Contacts/Goobers
      goobers: [],
      addGoober: (gooberData) => {
        const goober: Goober = {
          ...gooberData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ goobers: [...state.goobers, goober] }));
      },
      updateGoober: (id, updates) => {
        set((state) => ({
          goobers: state.goobers.map((goober) =>
            goober.id === id ? { ...goober, ...updates } : goober
          ),
        }));
      },
      deleteGoober: (id) => {
        set((state) => ({
          goobers: state.goobers.filter((goober) => goober.id !== id),
          events: state.events.filter((event) => event.gooberId !== id),
        }));
      },
      getGoober: (id) => get().goobers.find((goober) => goober.id === id),
      
      // Events/Plans
      events: [],
      addEvent: (eventData) => {
        const event: Event = {
          ...eventData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ events: [...state.events, event] }));
      },
      deleteEvent: (id) => {
        set((state) => ({
          events: state.events.filter((event) => event.id !== id),
        }));
      },
      
      // Contact import
      importedContacts: [],
      setImportedContacts: (contacts) => set({ importedContacts: contacts }),
      selectedContactIds: [],
      toggleContactSelection: (id) => {
        set((state) => ({
          selectedContactIds: state.selectedContactIds.includes(id)
            ? state.selectedContactIds.filter((selectedId) => selectedId !== id)
            : [...state.selectedContactIds, id],
        }));
      },
      clearContactSelection: () => set({ selectedContactIds: [] }),
      
      // Permission states
      contactPermissionDenied: false,
      setContactPermissionDenied: (denied) => set({ contactPermissionDenied: denied }),
    }),
    {
      name: 'goober-app-storage',
    }
  )
);

// Mock contact data for demonstration
export const mockContacts: ContactImport[] = [
  { id: '1', name: 'Alice Johnson', phone: '+1-555-0101', email: 'alice@example.com' },
  { id: '2', name: 'Bob Smith', phone: '+1-555-0102', email: 'bob@example.com' },
  { id: '3', name: 'Carol Davis', phone: '+1-555-0103', email: 'carol@example.com' },
  { id: '4', name: 'David Wilson', phone: '+1-555-0104', email: 'david@example.com' },
  { id: '5', name: 'Emma Brown', phone: '+1-555-0105', email: 'emma@example.com' },
  { id: '6', name: 'Frank Miller', phone: '+1-555-0106', email: 'frank@example.com' },
  { id: '7', name: 'Grace Taylor', phone: '+1-555-0107', email: 'grace@example.com' },
  { id: '8', name: 'Henry Clark', phone: '+1-555-0108', email: 'henry@example.com' },
];