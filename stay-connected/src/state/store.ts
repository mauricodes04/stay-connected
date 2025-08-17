import { create } from 'zustand';

type State = {
  darkMode: boolean;
  toggleDarkMode: () => void;
};

export const useStore = create<State>(set => ({
  darkMode: false,
  toggleDarkMode: () => set(s => ({ darkMode: !s.darkMode })),
}));
