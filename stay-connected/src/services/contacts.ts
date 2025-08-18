import * as Contacts from 'expo-contacts';
import type { Goober } from '../state/store';

export async function requestContactsPermission(): Promise<boolean> {
  const { status } = await Contacts.requestPermissionsAsync();
  return status === 'granted';
}

export async function pickContacts(): Promise<Goober[]> {
  const { data } = await Contacts.getContactsAsync({
    fields: [
      Contacts.Fields.Birthday,
      Contacts.Fields.Emails,
      Contacts.Fields.PhoneNumbers,
    ],
  });
  return data.slice(0, 200).map(c => {
    const phone = c.phoneNumbers?.[0]?.number;
    const email = c.emails?.[0]?.email;
    const id = c.id ?? `${c.name ?? ''}-${phone ?? email ?? ''}`;
    const b = c.birthday;
    const birthday =
      b && b.month && b.day
        ? [b.year ?? '0000', String(b.month).padStart(2, '0'), String(b.day).padStart(2, '0')].join('-')
        : undefined;
    return {
      id,
      name: c.name ?? 'Unknown',
      nickname: c.nickname ?? undefined,
      birthday,
      phone,
      email,
      relationship_type: 'Friends',
    };
  });
}
