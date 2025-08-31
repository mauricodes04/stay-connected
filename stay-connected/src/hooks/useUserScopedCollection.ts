import { useEffect, useRef, useState } from 'react';
import { onSnapshot, type Query } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { authReady } from '@/lib/authReady';
import { auth } from '@/lib/firebase';

type Options = { enabled?: boolean };
export function useUserScopedSnapshot<T = any>(qFactory: () => Query, options?: Options) {
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [userVersion, setUserVersion] = useState(0);
  const enabled = options?.enabled ?? true;
  const lastStartRef = useRef<number>(0);

  // Listen for auth changes and bump version to trigger resubscribe
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, () => setUserVersion(v => v + 1));
    return () => unsub();
  }, []);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    let cancelled = false;

    (async () => {
      try {
        if (!enabled) { setLoading(false); return; }
        await authReady; // ensure auth resolved
        if (cancelled) return;
        // StrictMode-safe: avoid duplicate immediate subscribe in dev double-mount
        if (__DEV__) {
          const now = Date.now();
          if (now - lastStartRef.current < 50) {
            return; // skip duplicate immediate run
          }
          lastStartRef.current = now;
        }
        const q = qFactory();
        unsub = onSnapshot(q, (snap) => {
          setData(snap.docs.map((d: any) => ({ id: d.id, ...d.data() })) as T[]);
          setLoading(false);
        }, (err) => {
          setError(err);
          setLoading(false);
        });
      } catch (e) {
        setError(e);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (unsub) unsub();
    };
  }, [qFactory, userVersion, enabled]);

  return { data, error, loading };
}
