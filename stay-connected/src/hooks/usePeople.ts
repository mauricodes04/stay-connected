import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, setDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ensureSignedIn } from "@/lib/ensureAuth";

export type Person = {
  id: string;
  name: string;
  nickname?: string;
  phone?: string;
  email?: string;
  createdAt?: any;
  updatedAt?: any;
  relationship_type?: string;
  notes?: string;
  displayName: string;
};

export function usePeople() {
  const [uid, setUid] = useState<string | null>(null);
  const [people, setPeople] = useState<Person[]>([]);

  useEffect(() => {
    let unsub: undefined | (() => void);
    let canceled = false;

    (async () => {
      const _uid = await ensureSignedIn();
      if (canceled) return;
      setUid(_uid);
      const q = query(
        collection(db, "users", _uid, "contacts"),
        orderBy("name", "asc")
      );
      unsub = onSnapshot(q, snap => {
        const rows = snap.docs.map(d => {
          const data = d.data() as any;
          const displayName = (data.nickname?.trim?.() || data.name) as string;
          return { id: d.id, ...data, displayName } as Person;
        });
        setPeople(rows);
      });
    })();

    return () => {
      canceled = true;
      if (unsub) unsub();
    };
  }, []);

  const upsertPerson = async (p: {
    id?: string;
    name: string;
    nickname?: string;
    phone?: string;
    email?: string;
    relationship_type?: string;
    notes?: string;
    createdAt?: any;
    updatedAt?: any;
  }) => {
    const key = (
      p.id ||
      p.email?.toLowerCase() ||
      p.phone?.replace(/\D+/g, "") ||
      p.name
    )!;
    const _uid = uid ?? (await ensureSignedIn());
    if (!uid) setUid(_uid);
    const ref = doc(db, "users", _uid, "contacts", key);
    const { serverTimestamp } = await import("firebase/firestore");
    const payload = {
      name: p.name,
      nickname: p.nickname ?? null,
      phone: p.phone ?? null,
      email: p.email?.toLowerCase() ?? null,
      relationship_type: p.relationship_type ?? null,
      notes: p.notes ?? null,
      updatedAt: serverTimestamp(),
      createdAt: p.createdAt ?? serverTimestamp(),
    };
    await setDoc(ref, payload, { merge: true });
  };

  return { people, upsertPerson };
}
