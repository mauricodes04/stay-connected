import { useMemo } from 'react';
import { useStore, Goober } from '../state/store';

export type Person = Goober & { displayName: string };

export function usePeople(): Person[] {
  const goobers = useStore(s => s.goobers);
  return useMemo(
    () =>
      goobers.map(g => ({
        ...g,
        displayName: g.nickname?.trim() || g.name,
      })),
    [goobers]
  );
}
