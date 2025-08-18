import { create } from 'zustand';

export type Goober = {
  id: string;
  name: string;
  nickname?: string;
  birthday?: string;
  phone?: string;
  email?: string;
  relationship_type:
    | 'Friends'
    | 'Close Friend'
    | 'Family'
    | 'Romantic'
    | 'Study Buddy'
    | 'Colleague'
    | 'Neighbor';
  notes?: string;
};

type State = {
  darkMode: boolean;
  toggleDarkMode: () => void;
  goobers: Goober[];
  addGoobers: (goobers: Goober[]) => void;
  clearGoobers: () => void;
};

export const useStore = create<State>(set => ({
  darkMode: false,
  toggleDarkMode: () => set(s => ({ darkMode: !s.darkMode })),
  goobers: [],
  addGoobers: goobers =>
    set(s => ({ goobers: [...s.goobers, ...goobers] })),
  clearGoobers: () => set({ goobers: [] }),
}));
