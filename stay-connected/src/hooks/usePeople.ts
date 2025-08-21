import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
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
      unsub = onSnapshot(
        q,
        (snap) => {
          const rows = snap.docs.map((d) => {
            const data = d.data() as any;
            const displayName = (data?.nickname?.trim?.() || data?.name) as string;
            return { id: d.id, ...data, displayName } as Person;
          });
          if (__DEV__) console.log("[contacts] count:", rows.length);
          setPeople(rows);
        },
        (err) => {
          console.warn("contacts onSnapshot error:", err);
        }
      );
    })();

    return () => {
      canceled = true;
      if (unsub) unsub();
    };
  }, []);

  // --- helpers ---
  const normEmail = (e?: string) => e?.trim().toLowerCase() || undefined;
  const normPhone = (p?: string) => (p ? p.replace(/\D+/g, "") : undefined);
  const hash = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = (h << 5) - h + s.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h).toString(36);
  };
  const stableIdFor = (p: {
    id?: string;
    email?: string;
    phone?: string;
    name: string;
  }) => {
    const e = normEmail(p.email);
    const ph = normPhone(p.phone);
    if (p.id && p.id.trim()) return p.id.trim();
    if (e) return `email:${e}`;
    if (ph) return `phone:${ph}`;
    return `name:${hash(p.name.trim())}`;
  };

  /**
   * Upsert a person deterministically into users/{uid}/contacts/{contactId}.
   * Resolves the *effective* uid at call-time to avoid stale state issues.
   */
  const upsertPerson = async (p: {
    id?: string;
    name: string;
    nickname?: string;
    phone?: string;
    email?: string;
    relationship_type?: string;
    notes?: string;
  }) => {
    const effectiveUid = uid ?? (await ensureSignedIn());
    const email = normEmail(p.email);
    const phone = normPhone(p.phone);
    const name = p.name?.trim();
    if (!name) throw new Error("Contact name is required");

    const contactId = stableIdFor({ id: p.id, email, phone, name });
    if (!uid) setUid(effectiveUid);
    const ref = doc(db, "users", effectiveUid, "contacts", contactId);
    const payload = {
      name,
      nickname: p.nickname?.trim() || null,
      phone: phone || null,
      email: email || null,
      relationship_type: p.relationship_type ?? null,
      notes: p.notes ?? null,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    };

    console.log("[upsertPerson]", { effectiveUid, contactId, payload });
    await setDoc(ref, payload, { merge: true });
  };

  return { people, upsertPerson };
}

